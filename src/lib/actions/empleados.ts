"use server";

import { db } from "@/lib/db";
import { usuarios, ordenes, turnosCaja, vehiculos, clientes } from "@/lib/db/schema";
import { eq, and, sql, count, desc } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { canDo } from "@/lib/auth/permissions";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";
import { auth } from "@/lib/auth/config";
import { sendWelcomeEmail } from "@/lib/email";

// Obtener lavadores y comisiones ganadas por órdenes completadas/cobradas
export async function getEmpleadosComisiones() {
  try {
    const session = await getSessionOrThrow({ modulo: "empleados", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    // 1. Obtener todos los empleados de la sucursal (tanto activos como inactivos)
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
      .where(eq(usuarios.sucursalId, sucursalId))
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

// Actualizar un empleado existente con salvaguardas
export async function actualizarEmpleado(
  id: string,
  data: {
    nombre: string;
    apellido?: string | null;
    telefono?: string | null;
    rol: "admin" | "supervisor" | "cajero" | "lavador";
  }
) {
  try {
    const session = await getSessionOrThrow({ modulo: "empleados", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;
    const requesterId = session.user.id;

    // 1. Obtener datos actuales del usuario a modificar
    const [emp] = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, id), eq(usuarios.sucursalId, sucursalId)))
      .limit(1);

    if (!emp) {
      throw new Error("Empleado no encontrado o no pertenece a tu sucursal.");
    }

    // 2. Salvaguarda: No permitir modificar un superadmin
    if (emp.rol === "superadmin") {
      throw new Error("No tienes permisos para modificar a un Super Administrador.");
    }

    // 3. Salvaguarda: No permitir que un usuario modifique su propio rol (evitar pérdida de permisos)
    if (id === requesterId && data.rol !== emp.rol) {
      throw new Error("No puedes cambiar tu propio rol para evitar pérdida de accesos.");
    }

    // 4. Actualizar base de datos
    const [updated] = await db
      .update(usuarios)
      .set({
        nombre: data.nombre.trim(),
        apellido: data.apellido || null,
        telefono: data.telefono || null,
        rol: data.rol,
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, id))
      .returning();

    revalidatePath("/empleados");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar empleado:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar el empleado") };
  }
}

// Cambiar estado activo/inactivo (Dar de baja / reactivar) de un empleado
export async function cambiarEstadoEmpleado(id: string, activo: boolean) {
  try {
    const session = await getSessionOrThrow({ modulo: "empleados", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;
    const requesterId = session.user.id;

    // 1. Obtener datos actuales del usuario a modificar
    const [emp] = await db
      .select()
      .from(usuarios)
      .where(and(eq(usuarios.id, id), eq(usuarios.sucursalId, sucursalId)))
      .limit(1);

    if (!emp) {
      throw new Error("Empleado no encontrado o no pertenece a tu sucursal.");
    }

    // 2. Salvaguarda: No permitir desactivar a un superadmin
    if (emp.rol === "superadmin" && !activo) {
      throw new Error("No se puede desactivar al Super Administrador.");
    }

    // 3. Salvaguarda: No permitir desactivarse a sí mismo
    if (id === requesterId && !activo) {
      throw new Error("No puedes dar de baja a tu propia cuenta en sesión.");
    }

    // 4. Actualizar el estado en la base de datos
    const [updated] = await db
      .update(usuarios)
      .set({
        activo,
        updatedAt: new Date(),
      })
      .where(eq(usuarios.id, id))
      .returning();

    revalidatePath("/empleados");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al cambiar estado del empleado:", error);
    return { success: false, error: getErrorMessage(error, "Error al cambiar estado del empleado") };
  }
}

// Obtener detalles de rendimiento de un empleado específico
export async function getEmpleadoRendimiento(id: string) {
  try {
    const session = await getSessionOrThrow();
    const isOwner = session.user.id === id;
    const hasPermission = canDo(session.user.rol, "empleados", "ver");

    if (!isOwner && !hasPermission) {
      throw new Error("No autorizado para ver el rendimiento de este empleado.");
    }

    const sucursalId = session.user.sucursalId!;

    // 1. Obtener información básica del empleado
    const [emp] = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        email: usuarios.email,
        telefono: usuarios.telefono,
        rol: usuarios.rol,
        activo: usuarios.activo,
        createdAt: usuarios.createdAt,
      })
      .from(usuarios)
      .where(and(eq(usuarios.id, id), eq(usuarios.sucursalId, sucursalId)))
      .limit(1);

    if (!emp) {
      return null;
    }

    // 2. Obtener KPIs (lavador vs cajero)
    const orderColumn = emp.rol === "lavador" ? ordenes.empleadoId : ordenes.cajeroId;

    const [stats] = await db
      .select({
        totalServicios: count(ordenes.id),
        montoTotal: sql<string>`coalesce(sum(${ordenes.total}), 0)`,
        ticketPromedio: sql<string>`coalesce(avg(${ordenes.total}), 0)`,
      })
      .from(ordenes)
      .where(
        and(
          eq(orderColumn, id),
          eq(ordenes.sucursalId, sucursalId),
          sql`${ordenes.estado} IN ('completado', 'cobrado')`
        )
      );

    const totalServicios = stats?.totalServicios || 0;
    const montoTotal = parseFloat(stats?.montoTotal || "0");
    const ticketPromedio = parseFloat(stats?.ticketPromedio || "0");
    
    // Comisión del 30% sólo para lavadores
    const comisionAcumulada = emp.rol === "lavador" ? montoTotal * 0.30 : 0;

    // Si es cajero, obtener total de turnos de caja
    let turnosTotales = 0;
    if (emp.rol === "cajero" || emp.rol === "admin" || emp.rol === "supervisor") {
      const [turnosCount] = await db
        .select({ val: count(turnosCaja.id) })
        .from(turnosCaja)
        .where(eq(turnosCaja.empleadoId, id));
      turnosTotales = turnosCount?.val || 0;
    }

    // 3. Obtener productividad diaria (últimos 30 días)
    const productividadDiariaRaw = await db
      .select({
        fecha: sql<string>`to_char(${ordenes.createdAt}, 'DD/MM')`,
        cantidad: count(ordenes.id),
        total: sql<string>`coalesce(sum(${ordenes.total}), 0)`,
      })
      .from(ordenes)
      .where(
        and(
          eq(orderColumn, id),
          eq(ordenes.sucursalId, sucursalId),
          sql`${ordenes.estado} IN ('completado', 'cobrado')`,
          sql`${ordenes.createdAt} >= now() - interval '30 days'`
        )
      )
      .groupBy(sql`date_trunc('day', ${ordenes.createdAt})`, sql`to_char(${ordenes.createdAt}, 'DD/MM')`)
      .orderBy(sql`date_trunc('day', ${ordenes.createdAt})`);

    const productividadDiaria = productividadDiariaRaw.map((d) => ({
      fecha: d.fecha,
      cantidad: d.cantidad,
      total: parseFloat(d.total),
    }));

    // 4. Obtener últimas 10 órdenes procesadas por el empleado
    const ordenesRecientes = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        total: ordenes.total,
        createdAt: ordenes.createdAt,
        placa: vehiculos.placa,
        vehiculoMarca: vehiculos.marca,
        vehiculoModelo: vehiculos.modelo,
        vehiculoTipo: vehiculos.tipo,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .where(
        and(
          eq(orderColumn, id),
          eq(ordenes.sucursalId, sucursalId)
        )
      )
      .orderBy(desc(ordenes.createdAt))
      .limit(10);

    return {
      empleado: emp,
      kpis: {
        totalServicios,
        montoTotal,
        comisionAcumulada,
        ticketPromedio,
        turnosTotales,
      },
      productividadDiaria,
      ordenesRecientes,
    };
  } catch (error) {
    console.error("Error al obtener rendimiento del empleado:", error);
    return null;
  }
}
