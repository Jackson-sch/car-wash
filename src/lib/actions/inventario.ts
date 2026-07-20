"use server";

import { db } from "@/lib/db";
import { inventario, inventarioMovimientos } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "./action-utils";

// Obtener catálogo de insumos de inventario
async function getInventario() {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    return await db
      .select()
      .from(inventario)
      .where(and(eq(inventario.sucursalId, sucursalId), eq(inventario.activo, true)))
      .orderBy(inventario.nombre);
  } catch (error) {
    console.error("Error al obtener inventario:", error);
    return [];
  }
}

// Crear un nuevo insumo
export async function registrarItemInventario(data: {
  nombre: string;
  descripcion?: string | null;
  unidad?: string;
  stockMinimo?: string;
  precioCompra?: string;
  proveedor?: string | null;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [newItem] = await db
      .insert(inventario)
      .values({
        sucursalId,
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        unidad: data.unidad || "unidad",
        stock: "0", // Inicia en 0 stock hasta registrar entrada
        stockMinimo: data.stockMinimo || "0",
        precioCompra: data.precioCompra || null,
        proveedor: data.proveedor || null,
        activo: true,
      })
      .returning();

    revalidateTag("inventario", { expire: 600 });
    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/inventario");
    return { success: true, data: newItem };
  } catch (error: unknown) {
    console.error("Error al registrar insumo:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar el insumo") };
  }
}

// Registrar movimiento de stock (Entrada / Salida / Ajuste)
export async function registrarMovimientoStock(data: {
  itemId: string;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: string; // numeric as string
  motivo?: string | null;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;
    const usuarioId = session.user.id;

    // 1. Obtener item actual para ver stock
    const [item] = await db
      .select({ stock: inventario.stock })
      .from(inventario)
      .where(and(eq(inventario.id, data.itemId), eq(inventario.sucursalId, sucursalId)));

    if (!item) throw new Error("Insumo no encontrado");

    const currentStockVal = parseFloat(item.stock || "0");
    const delta = parseFloat(data.cantidad) || 0;

    let newStockVal = currentStockVal;
    if (data.tipo === "entrada") {
      newStockVal += delta;
    } else if (data.tipo === "salida") {
      newStockVal = Math.max(0, currentStockVal - delta);
    } else {
      // Ajuste directo
      newStockVal = delta;
    }

    // 2. Grabar Movimiento
    await db.insert(inventarioMovimientos).values({
      itemId: data.itemId,
      tipo: data.tipo,
      cantidad: data.cantidad,
      motivo: data.motivo || null,
      usuarioId,
    });

    // 3. Actualizar Stock en Inventario
    const [updated] = await db
      .update(inventario)
      .set({
        stock: newStockVal.toFixed(3),
        updatedAt: new Date(),
      })
      .where(and(eq(inventario.id, data.itemId), eq(inventario.sucursalId, sucursalId)))
      .returning();

    revalidateTag("inventario", { expire: 600 });
    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/inventario");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al registrar movimiento:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar el movimiento") };
  }
}
