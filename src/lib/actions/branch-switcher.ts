"use server";

import { db } from "@/lib/db";
import { usuarios, sucursales } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function getSessionOrThrow() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session) {
    throw new Error("No autorizado. Inicie sesión nuevamente.");
  }
  return session;
}

// Obtener todas las sucursales pertenecientes a la empresa del usuario logueado
export async function getEmpresaSucursales() {
  try {
    const session = await getSessionOrThrow();
    const { rol, empresaId } = session.user;

    // Super Admin puede ver absolutamente todas las sucursales del sistema
    if (rol === "superadmin") {
      return await db
        .select({
          id: sucursales.id,
          nombre: sucursales.nombre,
          empresaNombre: sucursales.nombre, // Opcional, o traer de tabla empresas
        })
        .from(sucursales)
        .where(eq(sucursales.activa, true));
    }

    if (!empresaId) {
      return [];
    }

    // Admins o supervisores ven las sucursales de su propia empresa
    return await db
      .select({
        id: sucursales.id,
        nombre: sucursales.nombre,
      })
      .from(sucursales)
      .where(and(eq(sucursales.empresaId, empresaId), eq(sucursales.activa, true)));
  } catch (error) {
    console.error("Error al obtener sucursales de la empresa:", error);
    return [];
  }
}

// Cambiar la sucursal activa actual para el usuario autenticado
export async function switchActiveBranch(sucursalId: string) {
  try {
    const session = await getSessionOrThrow();
    const userId = session.user.id;
    const { rol, empresaId } = session.user;

    // 1. Validar que la sucursal exista y esté activa
    const [sucursal] = await db
      .select()
      .from(sucursales)
      .where(and(eq(sucursales.id, sucursalId), eq(sucursales.activa, true)))
      .limit(1);

    if (!sucursal) {
      return { success: false, error: "La sucursal seleccionada no existe o está inactiva." };
    }

    // 2. Validar propiedad si no es Super Admin
    if (rol !== "superadmin") {
      if (!empresaId || sucursal.empresaId !== empresaId) {
        return { success: false, error: "No autorizado. Esta sucursal no pertenece a tu empresa." };
      }
    }

    // 3. Actualizar la sucursal activa del usuario en la base de datos
    await db
      .update(usuarios)
      .set({ sucursalId: sucursal.id, updatedAt: new Date() })
      .where(eq(usuarios.id, userId));

    revalidatePath("/");
    revalidatePath("/dashboard");
    return { success: true, sucursalNombre: sucursal.nombre };
  } catch (error) {
    console.error("Error al cambiar de sucursal:", error);
    return { success: false, error: "Error interno al cambiar de sucursal." };
  }
}
