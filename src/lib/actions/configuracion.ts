"use server";

import { db } from "@/lib/db";
import { sucursales, empresas } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";

type SucursalConfig = Record<string, unknown>;

// Obtener el nombre de la empresa vinculada al usuario actual
export async function getMiEmpresaNombre() {
  try {
    const session = await getSessionOrThrow();
    if (session.user.rol === "superadmin") {
      return "WashMaster Central";
    }
    const empresaId = session.user.empresaId;
    if (!empresaId) return null;

    const [empresa] = await db
      .select({ nombre: empresas.nombre })
      .from(empresas)
      .where(eq(empresas.id, empresaId));

    return empresa?.nombre || null;
  } catch {
    return null;
  }
}

// Obtener los datos y configuración de la sucursal actual
export async function getSucursalConfig() {
  try {
    const session = await getSessionOrThrow();
    const sucursalId = session.user.sucursalId;
    if (!sucursalId) return null;

    const [sucursal] = await db
      .select()
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId));

    return sucursal || null;
  } catch {
    return null;
  }
}

// Actualizar los datos de contacto y RUC de la sucursal
export async function updateSucursalInfo(data: {
  nombre: string;
  direccion?: string | null;
  telefono?: string | null;
  email?: string | null;
  ruc?: string | null;
  logoUrl?: string | null;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const sucursalId = session.user.sucursalId;
    if (!sucursalId) throw new Error("Sucursal no asignada");

    const [updated] = await db
      .update(sucursales)
      .set({
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        email: data.email || null,
        ruc: data.ruc || null,
        logoUrl: data.logoUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(sucursales.id, sucursalId))
      .returning();

    revalidatePath("/configuracion");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar la info de la sucursal:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar la sucursal") };
  }
}

// Actualizar configuraciones avanzadas en el JSONB (multiplicadores, cupones, lealtad)
export async function updateSucursalConfigJSON(newConfig: SucursalConfig) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const sucursalId = session.user.sucursalId;
    if (!sucursalId) throw new Error("Sucursal no asignada");

    // Primero obtener la config actual para combinarla
    const [sucursal] = await db
      .select({ config: sucursales.config })
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId));

    const currentConfig = (sucursal?.config as SucursalConfig) || {};
    const mergedConfig = {
      ...currentConfig,
      ...newConfig,
    };

    const [updated] = await db
      .update(sucursales)
      .set({
        config: mergedConfig,
        updatedAt: new Date(),
      })
      .where(eq(sucursales.id, sucursalId))
      .returning();

    revalidatePath("/configuracion");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar config JSONB:", error);
    return { success: false, error: getErrorMessage(error, "Error al guardar la configuración") };
  }
}
