"use server";

import { eq, and, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import { cupones, cuponServicios, cuponesUsos } from "@/lib/db/schema";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import { revalidatePath } from "next/cache";

export async function getCupones() {
  const session = await getSessionOrThrow({ modulo: "configuracion", accion: "ver" });
  const sucursalId = session.user.sucursalId!;

  // Obtenemos los cupones
  const listaCupones = await db.query.cupones.findMany({
    where: eq(cupones.sucursalId, sucursalId),
    with: {
      servicios: {
        with: {
          servicio: true,
        },
      },
      usos: true,
    },
    orderBy: [desc(cupones.createdAt)],
  });

  return listaCupones;
}

export type CuponData = {
  codigo: string;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: number;
  compraMinima?: number | null;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  limiteTotal?: number | null;
  limitePorCliente?: number | null;
  servicios: string[]; // array de IDs de servicios
};

export async function createCupon(data: CuponData) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [nuevoCupon] = await db
      .insert(cupones)
      .values({
        sucursalId,
        codigo: data.codigo.toUpperCase(),
        tipoDescuento: data.tipoDescuento,
        valorDescuento: data.valorDescuento.toString(),
        compraMinima: data.compraMinima ? data.compraMinima.toString() : null,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        limiteTotal: data.limiteTotal,
        limitePorCliente: data.limitePorCliente ?? 1,
        activo: true,
      })
      .returning();

    if (data.servicios && data.servicios.length > 0) {
      await db.insert(cuponServicios).values(
        data.servicios.map((servicioId) => ({
          cuponId: nuevoCupon.id,
          servicioId,
        }))
      );
    }

    revalidatePath("/cupones");
    return { success: true, cupon: nuevoCupon };
  } catch (error: any) {
    console.error("Error al crear cupón:", error);
    // Verificar si es un error de código único
    if (error.code === "23505") {
      return { success: false, error: "El código del cupón ya existe en esta sucursal." };
    }
    return { success: false, error: "Error al crear el cupón." };
  }
}

export async function toggleCupon(id: string, activo: boolean) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    await db
      .update(cupones)
      .set({ activo })
      .where(and(eq(cupones.id, id), eq(cupones.sucursalId, sucursalId)));

    revalidatePath("/cupones");
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar estado del cupón:", error);
    return { success: false, error: "No se pudo cambiar el estado." };
  }
}
