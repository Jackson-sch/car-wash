"use server";

import { db } from "@/lib/db";
import { usuarios, sucursales } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSessionOrThrow } from "./servicios";

export { getSessionOrThrow };

// Obtener todas las sucursales pertenecientes a la empresa del usuario logueado
export async function getEmpresaSucursales() {
  try {
    const session = await getSessionOrThrow();
    const { rol, sucursalId } = session.user;
    let { empresaId } = session.user;

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

    // Si empresaId es null pero tenemos sucursalId, lo resolvemos desde la sucursal
    if (!empresaId && sucursalId) {
      const [sucursal] = await db
        .select({ empresaId: sucursales.empresaId })
        .from(sucursales)
        .where(eq(sucursales.id, sucursalId))
        .limit(1);

      if (sucursal?.empresaId) {
        empresaId = sucursal.empresaId;
      }
    }

    if (!empresaId) return [];

    return await db
      .select({
        id: sucursales.id,
        nombre: sucursales.nombre,
        empresaNombre: sucursales.nombre,
      })
      .from(sucursales)
      .where(and(eq(sucursales.empresaId, empresaId), eq(sucursales.activa, true)));
  } catch (error) {
    console.error("Error al obtener sucursales de la empresa:", error);
    return [];
  }
}

// Acción para cambiar de sucursal activa
export async function switchActiveBranch(newBranchId: string) {
  try {
    const session = await getSessionOrThrow();

    // 1. Obtener la sucursal solicitada y validar que esté activa
    const [branch] = await db
      .select()
      .from(sucursales)
      .where(and(eq(sucursales.id, newBranchId), eq(sucursales.activa, true)))
      .limit(1);

    if (!branch) {
      return { success: false, error: "La sucursal seleccionada no existe o no está activa." };
    }

    // 2. Si no es superadmin, validar que pertenezca a su misma empresa
    if (session.user.rol !== "superadmin") {
      if (branch.empresaId !== session.user.empresaId) {
        return { success: false, error: "No tienes permiso para acceder a esta sucursal." };
      }
    }

    // 3. Actualizar la sucursal asignada en el perfil del usuario
    await db
      .update(usuarios)
      .set({ sucursalId: newBranchId })
      .where(eq(usuarios.id, session.user.id));

    // 4. Invalidar todos los tags de caché vinculados a la sucursal
    revalidateTag("dashboard", "max");
    revalidateTag("servicios", "max");
    revalidateTag("caja", "max");
    revalidateTag("ordenes", "max");

    // 5. Revalidar todas las rutas del dashboard
    revalidatePath("/dashboard");
    revalidatePath("/caja");
    revalidatePath("/ordenes");
    revalidatePath("/patio");

    return {
      success: true,
      branchName: branch.nombre,
      sucursalNombre: branch.nombre,
    };
  } catch (error: unknown) {
    console.error("Error al cambiar de sucursal:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error al cambiar de sucursal.",
    };
  }
}
