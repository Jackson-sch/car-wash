"use server";

import { db } from "@/lib/db";
import { usuarios, ordenes } from "@/lib/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";
import { auth } from "@/lib/auth/config";
import { sendWelcomeEmail } from "@/lib/email";

// Obtener lavadores y comisiones ganadas por órdenes completadas/cobradas
export async function getEmpleadosComisiones() {
  try {
    const session = await getSessionOrThrow({ modulo: "empleados", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    // 1. Obtener todos los empleados de la sucursal
    const empleadosList = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        email: usuarios.email,
        telefono: usuarios.telefono,
        rol: usuarios.rol,
        activo: usuarios.activo,
      })
      .from(usuarios)
      .where(and(eq(usuarios.sucursalId, sucursalId), eq(usuarios.activo, true)))
      .orderBy(usuarios.nombre);

    // 2. Para cada empleado, si es lavador, calcular comisiones
    const result = [];
    for (const emp of empleadosList) {
      if (emp.rol === "lavador") {
        // Buscar órdenes completadas o cobradas asociadas a él
        const [stats] = await db
          .select({
            totalLavados: count(ordenes.id),
            montoTotal: sql<string>`coalesce(sum(${ordenes.total}), 0)`,
          })
          .from(ordenes)
          .where(
            and(
              eq(ordenes.empleadoId, emp.id),
              sql`${ordenes.estado} IN ('completado', 'cobrado')`
            )
          );

        const totalLavadosVal = stats?.totalLavados || 0;
        const montoTotalVal = parseFloat(stats?.montoTotal || "0");
        // Asignar comisión del 30%
        const comisionVal = montoTotalVal * 0.30;

        result.push({
          ...emp,
          totalLavados: totalLavadosVal,
          montoLavado: montoTotalVal,
          comisionAcumulada: comisionVal,
        });
      } else {
        result.push({
          ...emp,
          totalLavados: 0,
          montoLavado: 0,
          comisionAcumulada: 0,
        });
      }
    }

    return result;
  } catch (error) {
    console.error("Error al obtener comisiones de empleados:", error);
    return [];
  }
}

// Crear un empleado (usuario) de forma manual
export async function registrarEmpleado(data: {
  nombre: string;
  apellido?: string | null;
  email: string;
  telefono?: string | null;
  rol: "admin" | "supervisor" | "cajero" | "lavador";
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "empleados", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    // 1. Registrar usuario en Better Auth (esto crea el usuario y su cuenta con contraseña hashed)
    const defaultPassword = "CarWash2026!";
    const res = await auth.api.signUpEmail({
      body: {
        email: data.email.toLowerCase().trim(),
        password: defaultPassword,
        name: `${data.nombre} ${data.apellido || ""}`.trim(),
        rol: data.rol,
        sucursalId: sucursalId,
      }
    });

    if (!res || !res.user) {
      throw new Error("No se pudo registrar la cuenta en el sistema de autenticación.");
    }

    // 2. Actualizar campos específicos (como teléfono y apellido) que no se configuran directamente en signUpEmail
    const [updatedEmp] = await db
      .update(usuarios)
      .set({
        apellido: data.apellido || null,
        telefono: data.telefono || null,
      })
      .where(eq(usuarios.id, res.user.id))
      .returning();

    await sendWelcomeEmail(data.email, `${data.nombre} ${data.apellido || ""}`.trim());

    revalidatePath("/empleados");
    return { success: true, data: updatedEmp || res.user };
  } catch (error: unknown) {
    console.error("Error al registrar empleado:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar el personal") };
  }
}
