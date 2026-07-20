"use server";

import { db } from "@/lib/db";
import { sucursales, empresas, planes } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";

export async function getActiveSucursales() {
  try {
    await getSessionOrThrow();

    return await db
      .select({
        id: sucursales.id,
        nombre: sucursales.nombre,
      })
      .from(sucursales)
      .where(eq(sucursales.activa, true));
  } catch (error) {
    console.error("Error fetching active branches:", error);
    return [];
  }
}

// Obtener todas las sucursales de la empresa y la configuración del plan
export async function getSucursalesList() {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "ver" });
    const { empresaId, sucursalId } = session.user;

    if (!empresaId) {
      throw new Error("No tienes una empresa asociada.");
    }

    // 1. Obtener límite del plan de la empresa
    const [empresaPlan] = await db
      .select({
        limiteSucursales: planes.limiteSucursales,
      })
      .from(empresas)
      .leftJoin(planes, eq(planes.codigo, empresas.plan))
      .where(eq(empresas.id, empresaId))
      .limit(1);

    const limiteSucursales = empresaPlan ? empresaPlan.limiteSucursales : 1;

    // 2. Obtener lista de sucursales
    const list = await db
      .select()
      .from(sucursales)
      .where(eq(sucursales.empresaId, empresaId))
      .orderBy(sucursales.nombre);

    return {
      success: true,
      sucursales: list,
      limiteSucursales,
      userSucursalId: sucursalId,
    };
  } catch (error: unknown) {
    console.error("Error al obtener lista de sucursales:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error al obtener sucursales"),
      sucursales: [],
      limiteSucursales: 1,
      userSucursalId: null,
    };
  }
}

// Crear una nueva sucursal
export async function createSucursalAction(data: {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  ruc?: string | null;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const { empresaId } = session.user;

    if (!empresaId) {
      throw new Error("No tienes una empresa asociada.");
    }

    // 1. Validar límite de sucursales
    const [empresaPlan] = await db
      .select({
        limiteSucursales: planes.limiteSucursales,
      })
      .from(empresas)
      .leftJoin(planes, eq(planes.codigo, empresas.plan))
      .where(eq(empresas.id, empresaId))
      .limit(1);

    const limit = empresaPlan ? empresaPlan.limiteSucursales : 1;

    const [currentCountResult] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(sucursales)
      .where(eq(sucursales.empresaId, empresaId));

    const currentCount = Number(currentCountResult?.count || 0);

    if (limit !== null && currentCount >= limit) {
      throw new Error(`Has alcanzado el límite de sucursales permitido por tu plan (${limit}).`);
    }

    // 2. Crear sucursal
    const [newBranch] = await db
      .insert(sucursales)
      .values({
        empresaId,
        nombre: data.nombre.trim(),
        direccion: data.direccion?.trim() || null,
        telefono: data.telefono?.trim() || null,
        email: data.email?.trim() || null,
        ruc: data.ruc?.trim() || null,
        config: { igv: 18, moneda: "PEN" },
        activa: true,
      })
      .returning();

    revalidatePath("/configuracion/sucursales");
    return { success: true, sucursal: newBranch };
  } catch (error: unknown) {
    console.error("Error al crear sucursal:", error);
    return { success: false, error: getErrorMessage(error, "Error al crear la sucursal") };
  }
}

// Actualizar una sucursal existente
export async function updateSucursalAction(
  id: string,
  data: {
    nombre: string;
    direccion?: string | null;
    telefono?: string | null;
    email?: string | null;
    ruc?: string | null;
  }
) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const { empresaId } = session.user;

    if (!empresaId) {
      throw new Error("No tienes una empresa asociada.");
    }

    // Actualizar sucursal asegurando pertenencia a la empresa
    const [updated] = await db
      .update(sucursales)
      .set({
        nombre: data.nombre.trim(),
        direccion: data.direccion?.trim() || null,
        telefono: data.telefono?.trim() || null,
        email: data.email?.trim() || null,
        ruc: data.ruc?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(eq(sucursales.id, id), eq(sucursales.empresaId, empresaId)))
      .returning();

    if (!updated) {
      throw new Error("La sucursal no existe o no pertenece a tu empresa.");
    }

    revalidatePath("/configuracion/sucursales");
    return { success: true, sucursal: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar sucursal:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar la sucursal") };
  }
}

// Alternar estado activo de una sucursal
export async function toggleSucursalStatusAction(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const { empresaId, sucursalId: activeUserSucursalId } = session.user;

    if (!empresaId) {
      throw new Error("No tienes una empresa asociada.");
    }

    if (id === activeUserSucursalId) {
      throw new Error("No puedes desactivar la sucursal en la que estás trabajando actualmente.");
    }

    // Obtener sucursal actual para saber su estado activa
    const [sucursal] = await db
      .select({ activa: sucursales.activa })
      .from(sucursales)
      .where(and(eq(sucursales.id, id), eq(sucursales.empresaId, empresaId)))
      .limit(1);

    if (!sucursal) {
      throw new Error("La sucursal no existe o no pertenece a tu empresa.");
    }

    const [updated] = await db
      .update(sucursales)
      .set({
        activa: !sucursal.activa,
        updatedAt: new Date(),
      })
      .where(and(eq(sucursales.id, id), eq(sucursales.empresaId, empresaId)))
      .returning();

    revalidatePath("/configuracion/sucursales");
    return { success: true, sucursal: updated };
  } catch (error: unknown) {
    console.error("Error al cambiar estado de sucursal:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error al cambiar estado de la sucursal"),
    };
  }
}

// Establecer una sucursal como principal (y quitar principal a las demás de la misma empresa)
export async function setMainSucursalAction(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const { empresaId } = session.user;

    if (!empresaId) {
      throw new Error("No tienes una empresa asociada.");
    }

    // Iniciar transacción para actualizar todas las sucursales de la empresa
    await db.transaction(async (tx) => {
      // 1. Obtener todas las sucursales de la empresa
      const branches = await tx
        .select({ id: sucursales.id, config: sucursales.config })
        .from(sucursales)
        .where(eq(sucursales.empresaId, empresaId));

      await Promise.all(
        branches.map(branch => {
          const currentConfig = (branch.config || {}) as Record<string, unknown>;
          const isMain = branch.id === id;
          return tx
            .update(sucursales)
            .set({
              config: { ...currentConfig, esPrincipal: isMain },
              updatedAt: new Date(),
            })
            .where(eq(sucursales.id, branch.id));
        })
      );
    });

    revalidatePath("/configuracion/sucursales");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al establecer sucursal principal:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error al establecer la sucursal principal"),
    };
  }
}
