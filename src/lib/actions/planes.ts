"use server";

import { db } from "@/lib/db";
import { planes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";
import { logAudit } from "./auditoria";

async function verifySuperAdminSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session || session.user.rol !== "superadmin") {
    throw new Error("No autorizado.");
  }
  return session;
}

export async function getPlanes() {
  try {
    await verifySuperAdminSession();
    return await db.select().from(planes).orderBy(planes.precio);
  } catch (error) {
    console.error("Error fetching planes:", error);
    return [];
  }
}

export async function createPlan(data: {
  codigo: string;
  nombre: string;
  descripcion?: string;
  precio: string;
  limiteSucursales?: number | null;
  limiteUsuarios?: number | null;
  features: Record<string, boolean>;
}) {
  try {
    const session = await verifySuperAdminSession();

    const [existing] = await db
      .select()
      .from(planes)
      .where(eq(planes.codigo, data.codigo))
      .limit(1);

    if (existing) {
      return { success: false, error: "Ya existe un plan con ese código." };
    }

    await db.insert(planes).values({
      codigo: data.codigo.toLowerCase().trim(),
      nombre: data.nombre.trim(),
      descripcion: data.descripcion?.trim() || null,
      precio: data.precio,
      limiteSucursales: data.limiteSucursales ?? null,
      limiteUsuarios: data.limiteUsuarios ?? null,
      features: data.features,
      activo: true,
    });

    logAudit({
      usuarioId: session.user.id,
      usuarioNombre: session.user.name || session.user.email,
      accion: "crear_plan",
      descripcion: `Creó el plan "${data.nombre}" (${data.codigo}) a S/ ${data.precio}`,
      entidad: "plan",
      metadata: { codigo: data.codigo, precio: data.precio },
    });

    revalidatePath("/superadmin/planes");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Error al crear plan") };
  }
}

export async function updatePlan(id: string, data: {
  nombre?: string;
  descripcion?: string;
  precio?: string;
  limiteSucursales?: number | null;
  limiteUsuarios?: number | null;
  features?: Record<string, boolean>;
  activo?: boolean;
}) {
  try {
    const session = await verifySuperAdminSession();

    await db.update(planes).set({
      ...data,
      updatedAt: new Date(),
    }).where(eq(planes.id, id));

    logAudit({
      usuarioId: session.user.id,
      usuarioNombre: session.user.name || session.user.email,
      accion: "editar_plan",
      descripcion: `Editó el plan`,
      entidad: "plan",
      entidadId: id,
      metadata: data as Record<string, unknown>,
    });

    revalidatePath("/superadmin/planes");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Error al actualizar plan") };
  }
}

export async function deletePlan(id: string) {
  try {
    const session = await verifySuperAdminSession();

    const [plan] = await db
      .select({ nombre: planes.nombre, codigo: planes.codigo })
      .from(planes)
      .where(eq(planes.id, id))
      .limit(1);

    await db.delete(planes).where(eq(planes.id, id));

    if (plan) {
      logAudit({
        usuarioId: session.user.id,
        usuarioNombre: session.user.name || session.user.email,
        accion: "eliminar_plan",
        descripcion: `Eliminó el plan "${plan.nombre}" (${plan.codigo})`,
        entidad: "plan",
        entidadId: id,
      });
    }

    revalidatePath("/superadmin/planes");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Error al eliminar plan") };
  }
}
