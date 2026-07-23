"use server";

import { db } from "@/lib/db";
import { paquetes, paqueteServicios, servicios } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "./action-utils";

export async function getPaquetes() {
  try {
    const session = await getSessionOrThrow({ modulo: "paquetes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const rows = await db
      .select({
        id: paquetes.id,
        nombre: paquetes.nombre,
        descripcion: paquetes.descripcion,
        precio: paquetes.precio,
        activo: paquetes.activo,
        createdAt: paquetes.createdAt,
        servicioId: paqueteServicios.servicioId,
        servicioNombre: servicios.nombre,
      })
      .from(paquetes)
      .leftJoin(paqueteServicios, eq(paquetes.id, paqueteServicios.paqueteId))
      .leftJoin(servicios, eq(paqueteServicios.servicioId, servicios.id))
      .where(eq(paquetes.sucursalId, sucursalId))
      .orderBy(paquetes.nombre);

    const grouped = new Map<string, {
      id: string;
      nombre: string;
      descripcion: string | null;
      precio: string;
      activo: boolean | null;
      createdAt: Date | null;
      servicios: { id: string; nombre: string }[];
    }>();

    for (const row of rows) {
      if (!grouped.has(row.id)) {
        grouped.set(row.id, {
          id: row.id,
          nombre: row.nombre,
          descripcion: row.descripcion,
          precio: row.precio,
          activo: row.activo,
          createdAt: row.createdAt,
          servicios: [],
        });
      }
      const pkg = grouped.get(row.id);
      if (row.servicioId && pkg) {
        pkg.servicios.push({
          id: row.servicioId,
          nombre: row.servicioNombre || "",
        });
      }
    }

    return Array.from(grouped.values());
  } catch (error) {
    console.error("Error al obtener paquetes:", error);
    return [];
  }
}

export async function createPaquete(data: {
  nombre: string;
  descripcion?: string;
  precio: string;
  servicioIds: string[];
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "paquetes", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [paquete] = await db
      .insert(paquetes)
      .values({
        sucursalId,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        precio: data.precio,
        activo: true,
      })
      .returning();

    if (data.servicioIds.length > 0) {
      await db.insert(paqueteServicios).values(
        data.servicioIds.map((servicioId) => ({
          paqueteId: paquete.id,
          servicioId,
        }))
      );
    }

    revalidateTag("paquetes", { expire: 3600 });
    revalidatePath("/paquetes");
    return { success: true, data: paquete };
  } catch (error: unknown) {
    console.error("Error al crear paquete:", error);
    return { success: false, error: getErrorMessage(error, "Error al crear el paquete") };
  }
}

export async function updatePaquete(
  id: string,
  data: {
    nombre?: string;
    descripcion?: string;
    precio?: string;
    activo?: boolean;
    servicioIds?: string[];
  }
) {
  try {
    const session = await getSessionOrThrow({ modulo: "paquetes", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [updated] = await db
      .update(paquetes)
      .set({
        ...(data.nombre !== undefined && { nombre: data.nombre }),
        ...(data.descripcion !== undefined && { descripcion: data.descripcion || null }),
        ...(data.precio !== undefined && { precio: data.precio }),
        ...(data.activo !== undefined && { activo: data.activo }),
      })
      .where(and(eq(paquetes.id, id), eq(paquetes.sucursalId, sucursalId)))
      .returning();

    if (data.servicioIds !== undefined) {
      await db.delete(paqueteServicios).where(eq(paqueteServicios.paqueteId, id));
      if (data.servicioIds.length > 0) {
        await db.insert(paqueteServicios).values(
          data.servicioIds.map((servicioId) => ({
            paqueteId: id,
            servicioId,
          }))
        );
      }
    }

    revalidateTag("paquetes", { expire: 3600 });
    revalidatePath("/paquetes");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar paquete:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar el paquete") };
  }
}

export async function togglePaqueteStatus(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "paquetes", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [existing] = await db
      .select({ activo: paquetes.activo })
      .from(paquetes)
      .where(and(eq(paquetes.id, id), eq(paquetes.sucursalId, sucursalId)))
      .limit(1);

    if (!existing) throw new Error("Paquete no encontrado");

    await db
      .update(paquetes)
      .set({ activo: !existing.activo })
      .where(eq(paquetes.id, id));

    revalidateTag("paquetes", { expire: 3600 });
    revalidatePath("/paquetes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al cambiar estado del paquete:", error);
    return { success: false, error: getErrorMessage(error, "Error al cambiar estado") };
  }
}

export async function deletePaquete(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "paquetes", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    await db
      .update(paquetes)
      .set({ activo: false })
      .where(and(eq(paquetes.id, id), eq(paquetes.sucursalId, sucursalId)));

    revalidateTag("paquetes", { expire: 3600 });
    revalidatePath("/paquetes");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al eliminar paquete:", error);
    return { success: false, error: getErrorMessage(error, "Error al eliminar el paquete") };
  }
}
