"use server";

import { db } from "@/lib/db";
import { usuarios, sucursales } from "@/lib/db/schema";
import { sql, eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { sendWelcomeEmail } from "@/lib/email";

// Verifica si el sistema ya tiene algún usuario registrado
export async function checkSystemStatus() {
  try {
    // Si ya hay usuarios en el sistema, exigir autenticación
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usuarios);
    
    if (count > 0) {
      // Sistema ya inicializado — solo usuarios autenticados pueden consultar
      const session = await auth.api.getSession({
        headers: await headers(),
      });
      if (!session) {
        return { hasUsers: true }; // No revelar detalles a no autenticados
      }
    }

    return { hasUsers: count > 0 };
  } catch (error) {
    console.error("Error al verificar el estado del sistema:", error);
    return { hasUsers: false, dbError: true };
  }
}

// Inicializa el sistema con la primera sucursal y el primer usuario Administrador
export async function bootstrapSystem(data: {
  nombre: string;
  apellido?: string | null;
  email: string;
  password: string;
  sucursalNombre: string;
}) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    // 1. Validar que la base de datos no contenga usuarios (prevención de reinicialización)
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usuarios);
    
    if (count > 0 && (!session || session.user.rol !== "superadmin")) {
      return { success: false, error: "El sistema ya cuenta con usuarios registrados." };
    }

    // 2. Crear la Sucursal Principal
    const [sucursal] = await db
      .insert(sucursales)
      .values({
        nombre: data.sucursalNombre.trim(),
        direccion: "Dirección General Central",
        telefono: "999-999-999",
        ruc: "20100000001",
        activa: true,
        config: { igv: 18, moneda: "PEN" }
      })
      .returning();

    // 3. Crear el primer administrador en Better Auth (crea registro en usuarios y cuentas)
    const res = await auth.api.signUpEmail({
      body: {
        email: data.email.toLowerCase().trim(),
        password: data.password,
        name: `${data.nombre} ${data.apellido || ""}`.trim(),
        rol: "admin",
        sucursalId: sucursal.id,
      }
    });

    if (!res || !res.user) {
      throw new Error("No se pudo dar de alta el usuario administrador.");
    }

    // 4. Actualizar apellido si se proporcionó
    if (data.apellido) {
      await db
        .update(usuarios)
        .set({ apellido: data.apellido.trim() })
        .where(eq(usuarios.id, res.user.id));
    }

    await sendWelcomeEmail(data.email, `${data.nombre} ${data.apellido || ""}`.trim());

    return { success: true };
  } catch (error: unknown) {
    console.error("Error durante la inicialización del sistema:", error);
    return { success: false, error: error instanceof Error ? error.message : "Error al inicializar el sistema." };
  }
}
