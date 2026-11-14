"use server";

import { db } from "@/lib/db";
import {
  inventario,
  inventarioMovimientos,
  sucursales,
  usuarios,
  servicios,
  servicioRecetas,
} from "@/lib/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "./action-utils";
import ExcelJS from "exceljs";

// Obtener catálogo de insumos de inventario
async function _getInventario() {
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

// Exportar Kardex e Inventario a Excel (.xlsx) con formato corporativo
export async function exportarInventarioExcelAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [sucursalData] = await db
      .select({
        nombre: sucursales.nombre,
        direccion: sucursales.direccion,
        ruc: sucursales.ruc,
      })
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId));

    const items = await db
      .select()
      .from(inventario)
      .where(and(eq(inventario.sucursalId, sucursalId), eq(inventario.activo, true)))
      .orderBy(inventario.nombre);

    const wb = new ExcelJS.Workbook();
    wb.creator = "WashMaster Pro - Sistema de Car Wash";
    wb.created = new Date();

    const ws = wb.addWorksheet("Kardex de Inventario", {
      views: [{ showGridLines: true }],
    });

    const NAVY_HEADER = "0F172A";
    const PRIMARY_BLUE = "0284C7";
    const ZEBRA_ROW = "F8FAFC";
    const BORDER_COLOR = "E2E8F0";

    // 1. Banner
    ws.mergeCells("A1:J1");
    const banner = ws.getCell("A1");
    banner.value = "CAR WASH PRO PERÚ — CONTROL DE INVENTARIO Y KARDEX";
    banner.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_HEADER } };
    banner.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 36;

    // 2. Metadata
    ws.mergeCells("A2:J2");
    const meta = ws.getCell("A2");
    meta.value = `Sucursal: ${sucursalData?.nombre || "Principal"} | RUC: ${sucursalData?.ruc || "20123456789"} | Generado: ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })} | Usuario: ${session.user.name || session.user.email}`;
    meta.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF475569" } };
    meta.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(2).height = 20;

    // 3. Spacing
    ws.getRow(3).height = 10;

    // 4. Headers
    const headers = [
      "#",
      "Insumo / Producto",
      "Detalle / Descripción",
      "Unidad",
      "Stock Actual",
      "Stock Mínimo",
      "Estado de Salud",
      "Proveedor",
      "Costo Unitario",
      "Valor Total",
    ];

    const headerRow = ws.getRow(4);
    headerRow.values = headers;
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_BLUE } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FF0369A1" } },
      };
    });

    let rowIndex = 5;
    items.forEach((item, idx) => {
      const st = parseFloat(item.stock || "0");
      const min = parseFloat(item.stockMinimo || "0");
      const costo = parseFloat(item.precioCompra || "0");
      const valorTotal = st * costo;

      const estado = st === 0 ? "AGOTADO" : st <= min ? "BAJO MÍNIMO" : "ÓPTIMO";

      const row = ws.getRow(rowIndex);
      row.values = [
        idx + 1,
        item.nombre,
        item.descripcion || "—",
        item.unidad || "uds",
        st,
        min,
        estado,
        item.proveedor || "—",
        costo,
        { formula: `E${rowIndex}*I${rowIndex}`, result: valorTotal },
      ];

      row.getCell(1).alignment = { horizontal: "center" };
      row.getCell(4).alignment = { horizontal: "center" };
      row.getCell(5).numFmt = "#,##0.00";
      row.getCell(6).numFmt = "#,##0.00";
      row.getCell(7).alignment = { horizontal: "center" };
      row.getCell(9).numFmt = '"S/ "#,##0.00';
      row.getCell(10).numFmt = '"S/ "#,##0.00';

      const estadoCell = row.getCell(7);
      estadoCell.font = { name: "Segoe UI", size: 9, bold: true };
      if (estado === "AGOTADO") {
        estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
        estadoCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF991B1B" } };
      } else if (estado === "BAJO MÍNIMO") {
        estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        estadoCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF92400E" } };
      } else {
        estadoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
        estadoCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF065F46" } };
      }

      if (idx % 2 === 1) {
        row.eachCell((cell, colNum) => {
          if (colNum !== 7) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_ROW } };
          }
        });
      }

      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        };
      });

      row.height = 22;
      rowIndex++;
    });

    // Total Row
    const totalRow = ws.getRow(rowIndex);
    totalRow.values = [
      "",
      "TOTAL VALORIZADO DE INVENTARIO",
      "",
      "",
      "",
      "",
      "",
      "",
      "",
      { formula: `SUM(J5:J${rowIndex - 1})` },
    ];
    totalRow.height = 26;
    totalRow.getCell(2).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: NAVY_HEADER } };
    totalRow.getCell(10).font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF0369A1" } };
    totalRow.getCell(10).numFmt = '"S/ "#,##0.00';
    totalRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
      cell.border = {
        top: { style: "medium", color: { argb: PRIMARY_BLUE } },
        bottom: { style: "double", color: { argb: NAVY_HEADER } },
      };
    });

    ws.columns = [
      { width: 6 },
      { width: 40 },
      { width: 36 },
      { width: 16 },
      { width: 15 },
      { width: 15 },
      { width: 16 },
      { width: 24 },
      { width: 18 },
      { width: 22 },
    ];

    const buffer = await wb.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().split("T")[0];

    return {
      success: true,
      base64: Buffer.from(buffer).toString("base64"),
      filename: `Kardex_Inventario_WashMaster_${dateStr}.xlsx`,
    };
  } catch (error) {
    console.error("Error al exportar inventario a Excel:", error);
    return { success: false, error: "No se pudo generar el archivo Excel de inventario." };
  }
}

// 1. Obtener historial detallado de movimientos (Kardex) de un insumo
export async function getMovimientosInsumoAction(itemId: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    // Verificar pertenencia a la sucursal
    const [item] = await db
      .select({ id: inventario.id, nombre: inventario.nombre, unidad: inventario.unidad, stock: inventario.stock })
      .from(inventario)
      .where(and(eq(inventario.id, itemId), eq(inventario.sucursalId, sucursalId)));

    if (!item) {
      return { success: false, error: "Insumo no encontrado", data: [] };
    }

    const movimientos = await db
      .select({
        id: inventarioMovimientos.id,
        tipo: inventarioMovimientos.tipo,
        cantidad: inventarioMovimientos.cantidad,
        motivo: inventarioMovimientos.motivo,
        createdAt: inventarioMovimientos.createdAt,
        usuarioNombre: usuarios.nombre,
        usuarioApellido: usuarios.apellido,
      })
      .from(inventarioMovimientos)
      .leftJoin(usuarios, eq(inventarioMovimientos.usuarioId, usuarios.id))
      .where(eq(inventarioMovimientos.itemId, itemId))
      .orderBy(desc(inventarioMovimientos.createdAt))
      .limit(100);

    return {
      success: true,
      item,
      data: movimientos.map((m) => ({
        ...m,
        usuarioResponsable: m.usuarioNombre
          ? `${m.usuarioNombre} ${m.usuarioApellido || ""}`.trim()
          : "Sistema",
      })),
    };
  } catch (error) {
    console.error("Error al obtener movimientos de insumo:", error);
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo cargar el historial de Kardex"),
      data: [],
    };
  }
}

// 2. Editar información de un insumo existente
export async function actualizarItemInventarioAction(data: {
  id: string;
  nombre: string;
  descripcion?: string | null;
  unidad?: string;
  stockMinimo?: string;
  precioCompra?: string | null;
  proveedor?: string | null;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [updated] = await db
      .update(inventario)
      .set({
        nombre: data.nombre.trim(),
        descripcion: data.descripcion ? data.descripcion.trim() : null,
        unidad: data.unidad || "unidad",
        stockMinimo: data.stockMinimo ? parseFloat(data.stockMinimo).toFixed(3) : "0.000",
        precioCompra: data.precioCompra && parseFloat(data.precioCompra) > 0
          ? parseFloat(data.precioCompra).toFixed(2)
          : null,
        proveedor: data.proveedor ? data.proveedor.trim() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(inventario.id, data.id), eq(inventario.sucursalId, sucursalId)))
      .returning();

    if (!updated) {
      return { success: false, error: "El insumo no existe o no pertenece a tu sucursal." };
    }

    revalidateTag("inventario", { expire: 600 });
    revalidatePath("/inventario");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar insumo:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar el insumo") };
  }
}

// 3. Desactivar / Reactivar un insumo (Baja lógica)
export async function cambiarEstadoInsumoAction(id: string, activo: boolean) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const [updated] = await db
      .update(inventario)
      .set({
        activo,
        updatedAt: new Date(),
      })
      .where(and(eq(inventario.id, id), eq(inventario.sucursalId, sucursalId)))
      .returning();

    if (!updated) {
      return { success: false, error: "Insumo no encontrado." };
    }

    revalidateTag("inventario", { expire: 600 });
    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/inventario");
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al cambiar estado de insumo:", error);
    return { success: false, error: getErrorMessage(error, "No se pudo cambiar el estado del insumo") };
  }
}

// 4. Obtener todos los servicios con sus recetas de insumos configuradas
export async function getServiciosConRecetasAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    // Obtener servicios activos de la sucursal
    const serviciosList = await db
      .select({
        id: servicios.id,
        nombre: servicios.nombre,
        precio: servicios.precio,
        duracionMin: servicios.duracionMin,
      })
      .from(servicios)
      .where(and(eq(servicios.sucursalId, sucursalId), eq(servicios.activo, true)))
      .orderBy(servicios.nombre);

    // Obtener todas las recetas asociadas
    const recetasRaw = await db
      .select({
        id: servicioRecetas.id,
        servicioId: servicioRecetas.servicioId,
        itemId: servicioRecetas.itemId,
        cantidadConsumo: servicioRecetas.cantidadConsumo,
        itemNombre: inventario.nombre,
        unidad: inventario.unidad,
        costoUnitario: inventario.precioCompra,
      })
      .from(servicioRecetas)
      .innerJoin(inventario, eq(servicioRecetas.itemId, inventario.id))
      .where(eq(inventario.sucursalId, sucursalId));

    // Agrupar recetas por servicio
    const result = serviciosList.map((srv) => {
      const items = recetasRaw.filter((r) => r.servicioId === srv.id);
      const costoInsumosTotal = items.reduce((acc, curr) => {
        const cant = parseFloat(curr.cantidadConsumo || "0");
        const costo = parseFloat(curr.costoUnitario || "0");
        return acc + cant * costo;
      }, 0);

      return {
        ...srv,
        recetas: items,
        costoInsumosTotal,
      };
    });

    return { success: true, data: result };
  } catch (error) {
    console.error("Error al obtener servicios con recetas:", error);
    return { success: false, error: getErrorMessage(error, "Error al cargar recetas de servicios"), data: [] };
  }
}

// 5. Guardar/Actualizar receta de consumo de insumos para un servicio
export async function guardarRecetaServicioAction(
  servicioId: string,
  items: { itemId: string; cantidadConsumo: string }[]
) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    // Verificar que el servicio pertenezca a la sucursal
    const [srv] = await db
      .select({ id: servicios.id })
      .from(servicios)
      .where(and(eq(servicios.id, servicioId), eq(servicios.sucursalId, sucursalId)));

    if (!srv) {
      return { success: false, error: "Servicio no válido." };
    }

    // 1. Limpiar receta anterior
    await db.delete(servicioRecetas).where(eq(servicioRecetas.servicioId, servicioId));

    // 2. Insertar nuevos consumos
    const validItems = items.filter(
      (i) => i.itemId && parseFloat(i.cantidadConsumo) > 0
    );

    if (validItems.length > 0) {
      await db.insert(servicioRecetas).values(
        validItems.map((i) => ({
          servicioId,
          itemId: i.itemId,
          cantidadConsumo: parseFloat(i.cantidadConsumo).toFixed(3),
        }))
      );
    }

    revalidateTag("servicios", { expire: 3600 });
    revalidateTag("inventario", { expire: 600 });
    revalidatePath("/inventario");
    revalidatePath("/servicios");

    return { success: true };
  } catch (error) {
    console.error("Error al guardar receta de servicio:", error);
    return { success: false, error: getErrorMessage(error, "Error al guardar la receta de consumo") };
  }
}

export interface KardexFiltros {
  insumoId?: string;
  tipo?: "entrada" | "salida" | "ajuste" | "todos";
  fechaDesde?: string;
  fechaHasta?: string;
}

// 6. Obtener movimientos globales de Kardex para la página dedicada
export async function getKardexGlobalAction(filtros?: KardexFiltros) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    // 1. Obtener lista de insumos de la sucursal para los filtros
    const insumosList = await db
      .select({
        id: inventario.id,
        nombre: inventario.nombre,
        unidad: inventario.unidad,
        stock: inventario.stock,
      })
      .from(inventario)
      .where(and(eq(inventario.sucursalId, sucursalId), eq(inventario.activo, true)))
      .orderBy(inventario.nombre);

    // 2. Construir condiciones
    const conditions = [eq(inventario.sucursalId, sucursalId)];

    if (filtros?.insumoId && filtros.insumoId !== "todos") {
      conditions.push(eq(inventario.id, filtros.insumoId));
    }

    if (filtros?.tipo && filtros.tipo !== "todos") {
      conditions.push(eq(inventarioMovimientos.tipo, filtros.tipo));
    }

    if (filtros?.fechaDesde) {
      conditions.push(gte(inventarioMovimientos.createdAt, new Date(filtros.fechaDesde)));
    }

    if (filtros?.fechaHasta) {
      const hasta = new Date(filtros.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      conditions.push(lte(inventarioMovimientos.createdAt, hasta));
    }

    // 3. Consultar movimientos
    const rows = await db
      .select({
        id: inventarioMovimientos.id,
        tipo: inventarioMovimientos.tipo,
        cantidad: inventarioMovimientos.cantidad,
        motivo: inventarioMovimientos.motivo,
        createdAt: inventarioMovimientos.createdAt,
        insumoId: inventario.id,
        insumoNombre: inventario.nombre,
        insumoUnidad: inventario.unidad,
        insumoCosto: inventario.precioCompra,
        usuarioNombre: usuarios.nombre,
        usuarioApellido: usuarios.apellido,
      })
      .from(inventarioMovimientos)
      .innerJoin(inventario, eq(inventarioMovimientos.itemId, inventario.id))
      .leftJoin(usuarios, eq(inventarioMovimientos.usuarioId, usuarios.id))
      .where(and(...conditions))
      .orderBy(desc(inventarioMovimientos.createdAt))
      .limit(300);

    const movimientos = rows.map((r) => {
      const costoUnit = parseFloat(r.insumoCosto || "0");
      const cant = parseFloat(r.cantidad || "0");
      return {
        id: r.id,
        tipo: r.tipo,
        cantidad: cant,
        motivo: r.motivo || "Sin motivo especificado",
        createdAt: r.createdAt ? r.createdAt.toISOString() : null,
        insumoId: r.insumoId,
        insumoNombre: r.insumoNombre,
        insumoUnidad: r.insumoUnidad || "uds",
        costoUnitario: costoUnit,
        valorizadoAprox: cant * costoUnit,
        usuarioResponsable: r.usuarioNombre
          ? `${r.usuarioNombre} ${r.usuarioApellido || ""}`.trim()
          : "Sistema",
      };
    });

    return {
      success: true,
      data: {
        movimientos,
        insumos: insumosList,
      },
    };
  } catch (error) {
    console.error("Error al obtener Kardex global:", error);
    return {
      success: false,
      error: getErrorMessage(error, "No se pudo cargar el Kardex global"),
      data: { movimientos: [], insumos: [] },
    };
  }
}

// 7. Exportar reporte de movimientos de Kardex a Excel (.xlsx)
export async function exportarKardexMovimientosExcelAction(filtros?: KardexFiltros) {
  try {
    const session = await getSessionOrThrow({ modulo: "inventario", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [sucursalData] = await db
      .select({
        nombre: sucursales.nombre,
        direccion: sucursales.direccion,
        ruc: sucursales.ruc,
      })
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId));

    const conditions = [eq(inventario.sucursalId, sucursalId)];

    if (filtros?.insumoId && filtros.insumoId !== "todos") {
      conditions.push(eq(inventario.id, filtros.insumoId));
    }
    if (filtros?.tipo && filtros.tipo !== "todos") {
      conditions.push(eq(inventarioMovimientos.tipo, filtros.tipo));
    }
    if (filtros?.fechaDesde) {
      conditions.push(gte(inventarioMovimientos.createdAt, new Date(filtros.fechaDesde)));
    }
    if (filtros?.fechaHasta) {
      const hasta = new Date(filtros.fechaHasta);
      hasta.setHours(23, 59, 59, 999);
      conditions.push(lte(inventarioMovimientos.createdAt, hasta));
    }

    const rows = await db
      .select({
        id: inventarioMovimientos.id,
        tipo: inventarioMovimientos.tipo,
        cantidad: inventarioMovimientos.cantidad,
        motivo: inventarioMovimientos.motivo,
        createdAt: inventarioMovimientos.createdAt,
        insumoNombre: inventario.nombre,
        insumoUnidad: inventario.unidad,
        insumoCosto: inventario.precioCompra,
        usuarioNombre: usuarios.nombre,
        usuarioApellido: usuarios.apellido,
      })
      .from(inventarioMovimientos)
      .innerJoin(inventario, eq(inventarioMovimientos.itemId, inventario.id))
      .leftJoin(usuarios, eq(inventarioMovimientos.usuarioId, usuarios.id))
      .where(and(...conditions))
      .orderBy(desc(inventarioMovimientos.createdAt));

    const wb = new ExcelJS.Workbook();
    wb.creator = "WashMaster Pro - Sistema de Car Wash";
    wb.created = new Date();

    const ws = wb.addWorksheet("Libro Kardex", {
      views: [{ showGridLines: true }],
    });

    const NAVY_HEADER = "0F172A";
    const PRIMARY_BLUE = "0284C7";
    const ZEBRA_ROW = "F8FAFC";
    const BORDER_COLOR = "E2E8F0";

    // 1. Banner
    ws.mergeCells("A1:J1");
    const banner = ws.getCell("A1");
    banner.value = "CAR WASH PRO PERÚ — LIBRO KARDEX DE MOVIMIENTOS";
    banner.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_HEADER } };
    banner.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 36;

    // 2. Metadata
    ws.mergeCells("A2:J2");
    const meta = ws.getCell("A2");
    meta.value = `Sucursal: ${sucursalData?.nombre || "Principal"} | RUC: ${sucursalData?.ruc || "20123456789"} | Total Registros: ${rows.length} | Generado: ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })}`;
    meta.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF475569" } };
    meta.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(2).height = 20;

    // 3. Spacing
    ws.getRow(3).height = 10;

    // 4. Headers
    const headers = [
      "#",
      "Fecha & Hora",
      "Tipo Movimiento",
      "Insumo / Producto",
      "Cantidad",
      "Unidad",
      "Costo Unitario",
      "Valorizado (S/)",
      "Motivo / Referencia Comprobante",
      "Responsable",
    ];

    const headerRow = ws.getRow(4);
    headerRow.values = headers;
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_BLUE } };
      cell.alignment = { horizontal: "center", vertical: "middle" };
      cell.border = {
        bottom: { style: "medium", color: { argb: "FF0369A1" } },
      };
    });

    let rowIndex = 5;
    rows.forEach((r, idx) => {
      const cant = parseFloat(r.cantidad || "0");
      const costo = parseFloat(r.insumoCosto || "0");
      const valorTotal = cant * costo;
      const dateFormatted = r.createdAt
        ? new Date(r.createdAt).toLocaleString("es-PE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : "—";

      const usuario = r.usuarioNombre
        ? `${r.usuarioNombre} ${r.usuarioApellido || ""}`.trim()
        : "Sistema";

      const row = ws.getRow(rowIndex);
      row.values = [
        idx + 1,
        dateFormatted,
        r.tipo.toUpperCase(),
        r.insumoNombre,
        cant,
        r.insumoUnidad || "uds",
        costo,
        valorTotal,
        r.motivo || "—",
        usuario,
      ];

      row.getCell(1).alignment = { horizontal: "center" };
      row.getCell(2).alignment = { horizontal: "center" };
      row.getCell(3).alignment = { horizontal: "center" };
      row.getCell(5).numFmt = "#,##0.00";
      row.getCell(6).alignment = { horizontal: "center" };
      row.getCell(7).numFmt = '"S/ "#,##0.00';
      row.getCell(8).numFmt = '"S/ "#,##0.00';

      const tipoCell = row.getCell(3);
      tipoCell.font = { name: "Segoe UI", size: 9, bold: true };
      if (r.tipo === "entrada") {
        tipoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFD1FAE5" } };
        tipoCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF065F46" } };
      } else if (r.tipo === "salida") {
        tipoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
        tipoCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF991B1B" } };
      } else {
        tipoCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        tipoCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF92400E" } };
      }

      if (idx % 2 === 1) {
        row.eachCell((cell, colNum) => {
          if (colNum !== 3) {
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_ROW } };
          }
        });
      }

      row.eachCell((cell) => {
        cell.border = {
          bottom: { style: "thin", color: { argb: BORDER_COLOR } },
        };
      });

      row.height = 22;
      rowIndex++;
    });

    ws.columns = [
      { width: 6 },
      { width: 20 },
      { width: 18 },
      { width: 36 },
      { width: 14 },
      { width: 12 },
      { width: 16 },
      { width: 16 },
      { width: 44 },
      { width: 22 },
    ];

    const buffer = await wb.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().split("T")[0];

    return {
      success: true,
      base64: Buffer.from(buffer).toString("base64"),
      filename: `Libro_Kardex_WashMaster_${dateStr}.xlsx`,
    };
  } catch (error) {
    console.error("Error al exportar Kardex a Excel:", error);
    return { success: false, error: "No se pudo generar el archivo Excel de Kardex." };
  }
}
