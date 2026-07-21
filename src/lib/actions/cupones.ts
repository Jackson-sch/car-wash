"use server";

import { eq, and, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { cupones, cuponServicios, cuponesUsos, ordenes, vehiculos } from "@/lib/db/schema";
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

export interface CuponData {
  codigo: string;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: number;
  compraMinima?: number | null;
  fechaInicio?: Date | null;
  fechaFin?: Date | null;
  limiteTotal?: number | null;
  limitePorCliente?: number | null;
  servicios: string[]; // array de IDs de servicios
}

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
  } catch (error: unknown) {
    console.error("Error al crear cupón:", error);
    // Verificar si es un error de código único
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505") {
      return { success: false, error: "El código del cupón ya existe en esta sucursal." };
    }
    return { success: false, error: "Error al crear el cupón." };
  }
}

export async function updateCupon(id: string, data: CuponData) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    await db
      .update(cupones)
      .set({
        codigo: data.codigo.toUpperCase(),
        tipoDescuento: data.tipoDescuento,
        valorDescuento: data.valorDescuento.toString(),
        compraMinima: data.compraMinima ? data.compraMinima.toString() : null,
        fechaInicio: data.fechaInicio,
        fechaFin: data.fechaFin,
        limiteTotal: data.limiteTotal,
        limitePorCliente: data.limitePorCliente ?? 1,
      })
      .where(and(eq(cupones.id, id), eq(cupones.sucursalId, sucursalId)));

    await db.delete(cuponServicios).where(eq(cuponServicios.cuponId, id));

    if (data.servicios && data.servicios.length > 0) {
      await db.insert(cuponServicios).values(
        data.servicios.map((servicioId) => ({
          cuponId: id,
          servicioId,
        }))
      );
    }

    revalidatePath("/cupones");
    return { success: true };
  } catch (error: unknown) {
    console.error("Error al actualizar cupón:", error);
    if (typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505") {
      return { success: false, error: "El código del cupón ya existe en esta sucursal." };
    }
    return { success: false, error: "Error al actualizar el cupón." };
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

type ValidarCuponResult =
  | { success: true; cuponId: string; tipoDescuento: "porcentaje" | "fijo"; valorDescuento: number; compraMinima: number | null }
  | { success: false; error: string };

export async function validarCupon(codigo: string, ordenId: string): Promise<ValidarCuponResult> {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "abrir" });
    const sucursalId = session.user.sucursalId!;

    const [cupon] = await db
      .select()
      .from(cupones)
      .where(and(eq(cupones.codigo, codigo.toUpperCase()), eq(cupones.sucursalId, sucursalId)));

    if (!cupon) return { success: false, error: "Cupón no encontrado." };
    if (!cupon.activo) return { success: false, error: "Este cupón está desactivado." };

    const now = new Date();
    if (cupon.fechaInicio && now < cupon.fechaInicio) {
      return { success: false, error: "Este cupón aún no está vigente." };
    }
    if (cupon.fechaFin && now > cupon.fechaFin) {
      return { success: false, error: "Este cupón ya ha expirado." };
    }

    // Obtener el cliente de la orden (orden → vehiculo → cliente)
    const [orden] = await db
      .select({ clienteId: vehiculos.clienteId })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .where(eq(ordenes.id, ordenId));

    if (!orden) return { success: false, error: "Orden no encontrada." };

    // Contar usos totales del cupón
    const [totalUsos] = await db
      .select({ count: count() })
      .from(cuponesUsos)
      .where(eq(cuponesUsos.cuponId, cupon.id));

    if (cupon.limiteTotal && totalUsos.count >= cupon.limiteTotal) {
      return { success: false, error: "Este cupón ha alcanzado su límite de usos." };
    }

    // Contar usos por cliente
    if (orden.clienteId) {
      const [usosCliente] = await db
        .select({ count: count() })
        .from(cuponesUsos)
        .where(and(eq(cuponesUsos.cuponId, cupon.id), eq(cuponesUsos.clienteId, orden.clienteId)));

      if (cupon.limitePorCliente && usosCliente.count >= cupon.limitePorCliente) {
        return { success: false, error: "Ya has usado este cupón el máximo de veces permitido." };
      }
    }

    return {
      success: true,
      cuponId: cupon.id,
      tipoDescuento: cupon.tipoDescuento,
      valorDescuento: parseFloat(cupon.valorDescuento),
      compraMinima: cupon.compraMinima ? parseFloat(cupon.compraMinima) : null,
    };
  } catch (error) {
    console.error("Error al validar cupón:", error);
    return { success: false, error: "Error al validar el cupón." };
  }
}

export async function validarCuponPrevio(
  codigo: string,
  montoSubtotal: number,
  clienteId?: string
): Promise<ValidarCuponResult> {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [cupon] = await db
      .select()
      .from(cupones)
      .where(and(eq(cupones.codigo, codigo.toUpperCase()), eq(cupones.sucursalId, sucursalId)));

    if (!cupon) return { success: false, error: "Cupón no encontrado." };
    if (!cupon.activo) return { success: false, error: "Este cupón está desactivado." };

    const now = new Date();
    if (cupon.fechaInicio && now < cupon.fechaInicio) {
      return { success: false, error: "Este cupón aún no está vigente." };
    }
    if (cupon.fechaFin && now > cupon.fechaFin) {
      return { success: false, error: "Este cupón ya ha expirado." };
    }

    const compraMin = cupon.compraMinima ? parseFloat(cupon.compraMinima) : 0;
    if (compraMin > 0 && montoSubtotal < compraMin) {
      return { success: false, error: `El monto mínimo de compra para este cupón es S/ ${compraMin.toFixed(2)}` };
    }

    // Contar usos totales
    const [totalUsos] = await db
      .select({ count: count() })
      .from(cuponesUsos)
      .where(eq(cuponesUsos.cuponId, cupon.id));

    if (cupon.limiteTotal && totalUsos.count >= cupon.limiteTotal) {
      return { success: false, error: "Este cupón ha alcanzado su límite de usos." };
    }

    // Contar usos por cliente
    if (clienteId) {
      const [usosCliente] = await db
        .select({ count: count() })
        .from(cuponesUsos)
        .where(and(eq(cuponesUsos.cuponId, cupon.id), eq(cuponesUsos.clienteId, clienteId)));

      if (cupon.limitePorCliente && usosCliente.count >= cupon.limitePorCliente) {
        return { success: false, error: "Este cliente ya ha alcanzado el límite de uso de este cupón." };
      }
    }

    return {
      success: true,
      cuponId: cupon.id,
      tipoDescuento: cupon.tipoDescuento,
      valorDescuento: parseFloat(cupon.valorDescuento),
      compraMinima: cupon.compraMinima ? parseFloat(cupon.compraMinima) : null,
    };
  } catch (error) {
    console.error("Error al validar cupón previo:", error);
    return { success: false, error: "Error al validar el cupón." };
  }
}

