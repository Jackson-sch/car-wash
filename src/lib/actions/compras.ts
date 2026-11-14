"use server";

import { db } from "@/lib/db";
import {
  compras,
  comprasDetalles,
  inventario,
  inventarioMovimientos,
  proveedores,
  sucursales,
} from "@/lib/db/schema";
import { eq, and, desc, sql, ilike } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "./action-utils";
import ExcelJS from "exceljs";

export interface ItemCompraInput {
  insumoId: string;
  descripcion: string;
  cantidad: number;
  costoUnitario: number;
  subtotal: number;
}

export interface RegistrarCompraInput {
  proveedorId?: string;
  proveedorNombre: string;
  proveedorRuc?: string;
  proveedorTelefono?: string;
  proveedorDireccion?: string;
  tipoComprobante: string; // 'factura', 'boleta', 'guia', 'nota'
  numeroComprobante: string;
  fechaEmision: string; // ISO or YYYY-MM-DD
  metodoPago: string; // 'efectivo', 'transferencia', 'tarjeta', 'credito'
  subtotal: number;
  igv: number;
  total: number;
  observaciones?: string;
  detalles: ItemCompraInput[];
}

export async function getCompraByIdAction(compraId: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const compra = await db.query.compras.findFirst({
      where: and(eq(compras.id, compraId), eq(compras.sucursalId, sucursalId)),
      with: {
        usuario: {
          columns: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        detalles: {
          with: {
            insumo: {
              columns: {
                id: true,
                nombre: true,
                unidad: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    if (!compra) {
      return { success: false, error: "Comprobante de compra no encontrado.", data: null };
    }

    return { success: true, data: compra };
  } catch (error: unknown) {
    console.error("Error al obtener detalle de compra:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error al cargar el detalle de la compra"),
      data: null,
    };
  }
}

export async function getInsumosParaCompraAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    const insumosDisponibles = await db
      .select({
        id: inventario.id,
        nombre: inventario.nombre,
        unidad: inventario.unidad,
        stock: inventario.stock,
        precioCompra: inventario.precioCompra,
        proveedor: inventario.proveedor,
      })
      .from(inventario)
      .where(and(eq(inventario.sucursalId, sucursalId), eq(inventario.activo, true)))
      .orderBy(inventario.nombre);

    return { success: true, data: insumosDisponibles };
  } catch (error: unknown) {
    console.error("Error al obtener insumos para compra:", error);
    return { success: false, error: getErrorMessage(error, "Error al cargar insumos"), data: [] };
  }
}

export async function getComprasAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    // 1. Obtener lista de compras
    const comprasList = await db.query.compras.findMany({
      where: eq(compras.sucursalId, sucursalId),
      orderBy: [desc(compras.fechaEmision), desc(compras.createdAt)],
      with: {
        usuario: {
          columns: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        detalles: {
          with: {
            insumo: {
              columns: {
                id: true,
                nombre: true,
                unidad: true,
                stock: true,
              },
            },
          },
        },
      },
    });

    // 2. Obtener insumos disponibles de la sucursal para el formulario
    const insumosDisponibles = await db
      .select({
        id: inventario.id,
        nombre: inventario.nombre,
        unidad: inventario.unidad,
        stock: inventario.stock,
        precioCompra: inventario.precioCompra,
        proveedor: inventario.proveedor,
      })
      .from(inventario)
      .where(and(eq(inventario.sucursalId, sucursalId), eq(inventario.activo, true)))
      .orderBy(inventario.nombre);

    return {
      success: true,
      data: {
        compras: comprasList,
        insumos: insumosDisponibles,
      },
    };
  } catch (error: unknown) {
    console.error("Error al obtener compras:", error);
    return {
      success: false,
      error: getErrorMessage(error, "Error al cargar el historial de compras"),
      data: { compras: [], insumos: [] },
    };
  }
}

export async function registrarCompraAction(data: RegistrarCompraInput) {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;
    const usuarioId = session.user.id;

    if (!data.proveedorNombre?.trim()) {
      return { success: false, error: "El nombre del proveedor es obligatorio." };
    }
    if (!data.numeroComprobante?.trim()) {
      return { success: false, error: "El número de factura/boleta es obligatorio." };
    }
    if (!data.detalles || data.detalles.length === 0) {
      return { success: false, error: "Debes agregar al menos un insumo a la compra." };
    }

    const result = await db.transaction(async (tx) => {
      // 0. Resolver o registrar proveedor automáticamente en la base de datos
      const nombreTrim = data.proveedorNombre.trim();
      const rucTrim = data.proveedorRuc?.trim() || null;
      const telTrim = data.proveedorTelefono?.trim() || null;
      const dirTrim = data.proveedorDireccion?.trim() || null;

      let resolvedProveedorId = data.proveedorId || null;

      if (!resolvedProveedorId) {
        if (rucTrim) {
          const [existingByRuc] = await tx
            .select({ id: proveedores.id })
            .from(proveedores)
            .where(and(eq(proveedores.sucursalId, sucursalId), eq(proveedores.ruc, rucTrim)))
            .limit(1);
          if (existingByRuc) {
            resolvedProveedorId = existingByRuc.id;
          }
        } else {
          const [existingByName] = await tx
            .select({ id: proveedores.id })
            .from(proveedores)
            .where(and(eq(proveedores.sucursalId, sucursalId), ilike(proveedores.razonSocial, nombreTrim)))
            .limit(1);
          if (existingByName) {
            resolvedProveedorId = existingByName.id;
          }
        }
      }

      if (!resolvedProveedorId) {
        const [nuevoProveedor] = await tx
          .insert(proveedores)
          .values({
            sucursalId,
            ruc: rucTrim,
            razonSocial: nombreTrim,
            telefono: telTrim,
            direccion: dirTrim,
            activo: true,
          })
          .returning();
        resolvedProveedorId = nuevoProveedor.id;
      } else {
        // Actualizar datos opcionales si fueron provistos y el proveedor ya existe
        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (telTrim) updateData.telefono = telTrim;
        if (dirTrim) updateData.direccion = dirTrim;
        await tx
          .update(proveedores)
          .set(updateData)
          .where(eq(proveedores.id, resolvedProveedorId));
      }

      // 1. Insertar Cabecera de Compra
      const [nuevaCompra] = await tx
        .insert(compras)
        .values({
          sucursalId,
          usuarioId,
          proveedorId: resolvedProveedorId,
          proveedorNombre: nombreTrim,
          proveedorRuc: rucTrim,
          tipoComprobante: data.tipoComprobante || "factura",
          numeroComprobante: data.numeroComprobante.trim().toUpperCase(),
          fechaEmision: new Date(data.fechaEmision || Date.now()),
          metodoPago: data.metodoPago || "transferencia",
          estado: "completada",
          subtotal: data.subtotal.toFixed(2),
          igv: data.igv.toFixed(2),
          total: data.total.toFixed(2),
          observaciones: data.observaciones?.trim() || null,
        })
        .returning();

      // 2. Procesar cada detalle
      for (const item of data.detalles) {
        // Insertar detalle
        await tx.insert(comprasDetalles).values({
          compraId: nuevaCompra.id,
          insumoId: item.insumoId,
          descripcion: item.descripcion,
          cantidad: item.cantidad.toFixed(3),
          costoUnitario: item.costoUnitario.toFixed(2),
          subtotal: item.subtotal.toFixed(2),
        });

        // Obtener stock actual del insumo
        const [insumoActual] = await tx
          .select({
            stock: inventario.stock,
            precioCompra: inventario.precioCompra,
          })
          .from(inventario)
          .where(and(eq(inventario.id, item.insumoId), eq(inventario.sucursalId, sucursalId)));

        const stockAnterior = parseFloat(insumoActual?.stock || "0");
        const nuevoStock = stockAnterior + item.cantidad;

        // Actualizar stock y último costo en inventario
        await tx
          .update(inventario)
          .set({
            stock: nuevoStock.toFixed(3),
            precioCompra: item.costoUnitario.toFixed(2),
            proveedor: data.proveedorNombre.trim(),
            updatedAt: new Date(),
          })
          .where(eq(inventario.id, item.insumoId));

        // Registrar movimiento tipo 'entrada' en Kardex
        await tx.insert(inventarioMovimientos).values({
          itemId: item.insumoId,
          tipo: "entrada",
          cantidad: item.cantidad.toFixed(3),
          motivo: `Compra ${nuevaCompra.tipoComprobante.toUpperCase()} N° ${nuevaCompra.numeroComprobante} - Proveedor: ${nuevaCompra.proveedorNombre}`,
          usuarioId,
        });
      }

      return nuevaCompra;
    });

    revalidateTag("inventario", { expire: 600 });
    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/compras");
    revalidatePath("/compras/proveedores");
    revalidatePath("/compras/nueva");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");

    return { success: true, data: result };
  } catch (error: unknown) {
    console.error("Error al registrar compra:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar la compra") };
  }
}

export async function anularCompraAction(compraId: string, motivo: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;
    const usuarioId = session.user.id;

    if (!motivo?.trim()) {
      return { success: false, error: "Debes ingresar el motivo de anulación." };
    }

    await db.transaction(async (tx) => {
      // 1. Obtener la compra
      const [compra] = await tx
        .select()
        .from(compras)
        .where(and(eq(compras.id, compraId), eq(compras.sucursalId, sucursalId)));

      if (!compra) throw new Error("Compra no encontrada.");
      if (compra.estado === "anulada") throw new Error("La compra ya se encuentra anulada.");

      // 2. Obtener los detalles
      const detalles = await tx
        .select()
        .from(comprasDetalles)
        .where(eq(comprasDetalles.compraId, compraId));

      // 3. Revertir el stock y generar movimientos de salida compensatorios
      for (const item of detalles) {
        const [insumo] = await tx
          .select({ stock: inventario.stock })
          .from(inventario)
          .where(eq(inventario.id, item.insumoId));

        const stockActual = parseFloat(insumo?.stock || "0");
        const cantidadRevertir = parseFloat(item.cantidad || "0");
        const stockAjustado = Math.max(0, stockActual - cantidadRevertir);

        await tx
          .update(inventario)
          .set({
            stock: stockAjustado.toFixed(3),
            updatedAt: new Date(),
          })
          .where(eq(inventario.id, item.insumoId));

        // Registrar movimiento tipo 'salida' por anulación
        await tx.insert(inventarioMovimientos).values({
          itemId: item.insumoId,
          tipo: "salida",
          cantidad: cantidadRevertir.toFixed(3),
          motivo: `Anulación Compra N° ${compra.numeroComprobante} - Motivo: ${motivo.trim()}`,
          usuarioId,
        });
      }

      // 4. Marcar compra como anulada
      await tx
        .update(compras)
        .set({
          estado: "anulada",
          observaciones: compra.observaciones
            ? `${compra.observaciones} | [ANULADA: ${motivo.trim()}]`
            : `[ANULADA: ${motivo.trim()}]`,
          updatedAt: new Date(),
        })
        .where(eq(compras.id, compraId));
    });

    revalidateTag("inventario", { expire: 600 });
    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/compras");
    revalidatePath("/compras/proveedores");
    revalidatePath("/compras/nueva");
    revalidatePath("/inventario");
    revalidatePath("/dashboard");

    return { success: true };
  } catch (error: unknown) {
    console.error("Error al anular compra:", error);
    return { success: false, error: getErrorMessage(error, "Error al anular la compra") };
  }
}

export async function exportarComprasExcelAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "compras", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [sucursal] = await db
      .select({ nombre: sucursales.nombre })
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId));

    const sucursalNombre = sucursal?.nombre || "San Isidro";

    const comprasList = await db.query.compras.findMany({
      where: eq(compras.sucursalId, sucursalId),
      orderBy: [desc(compras.fechaEmision)],
      with: {
        usuario: {
          columns: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        detalles: true,
      },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Car Wash Pro Perú";
    workbook.created = new Date();

    const sheet = workbook.addWorksheet("Registro de Compras", {
      views: [{ showGridLines: true }],
    });

    // 1. Banner corporativo
    sheet.mergeCells("A1:I2");
    const titleCell = sheet.getCell("A1");
    titleCell.value = `REGISTRO DE COMPRAS & FACTURAS DE PROVEEDORES — ${sucursalNombre.toUpperCase()}`;
    titleCell.font = { name: "Calibri", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" },
    };

    // 2. Metadatos
    sheet.getCell("A3").value = "Generado el:";
    sheet.getCell("B3").value = new Date().toLocaleString("es-PE");
    sheet.getCell("A4").value = "Total Comprobantes:";
    sheet.getCell("B4").value = comprasList.length;
    sheet.getCell("A3").font = { bold: true, size: 9 };
    sheet.getCell("A4").font = { bold: true, size: 9 };

    // 3. Encabezados
    const headers = [
      "FECHA EMISIÓN",
      "TIPO DOC.",
      "N° COMPROBANTE",
      "PROVEEDOR",
      "RUC",
      "MÉTODO PAGO",
      "ESTADO",
      "TOTAL (S/)",
      "REGISTRADO POR",
    ];

    sheet.getRow(6).values = headers;
    const headerRow = sheet.getRow(6);
    headerRow.height = 24;
    headerRow.eachCell((cell) => {
      cell.font = { name: "Calibri", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF1E293B" },
      };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.border = {
        top: { style: "thin", color: { argb: "FF334155" } },
        bottom: { style: "medium", color: { argb: "FF38BDF8" } },
      };
    });

    let rowIndex = 7;
    comprasList.forEach((c) => {
      const row = sheet.getRow(rowIndex);
      const fecha = c.fechaEmision ? new Date(c.fechaEmision).toLocaleDateString("es-PE") : "—";
      const totalNum = parseFloat(c.total || "0");
      const usuarioNombre = c.usuario
        ? `${c.usuario.nombre || ""} ${c.usuario.apellido || ""}`.trim()
        : "Sistema";

      row.values = [
        fecha,
        c.tipoComprobante.toUpperCase(),
        c.numeroComprobante,
        c.proveedorNombre,
        c.proveedorRuc || "—",
        c.metodoPago.toUpperCase(),
        c.estado.toUpperCase(),
        totalNum,
        usuarioNombre,
      ];

      row.height = 20;

      // Colores y formatos
      row.getCell(8).numFmt = '"S/ " #,##0.00';
      row.getCell(8).font = { bold: true };

      const estadoCell = row.getCell(7);
      if (c.estado === "completada") {
        estadoCell.font = { color: { argb: "FF059669" }, bold: true };
      } else {
        estadoCell.font = { color: { argb: "FFE11D48" }, bold: true };
      }

      rowIndex++;
    });

    // Fila total
    const totalRow = sheet.getRow(rowIndex + 1);
    totalRow.getCell(7).value = "TOTAL COMPRAS:";
    totalRow.getCell(7).font = { bold: true };
    totalRow.getCell(7).alignment = { horizontal: "right" };
    totalRow.getCell(8).value = { formula: `SUM(H7:H${rowIndex - 1})` };
    totalRow.getCell(8).numFmt = '"S/ " #,##0.00';
    totalRow.getCell(8).font = { bold: true, size: 11 };

    sheet.columns = [
      { width: 15 },
      { width: 14 },
      { width: 18 },
      { width: 30 },
      { width: 15 },
      { width: 16 },
      { width: 14 },
      { width: 16 },
      { width: 22 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const filename = `Compras_${sucursalNombre.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`;

    return {
      success: true,
      data: {
        base64,
        filename,
      },
    };
  } catch (error: unknown) {
    console.error("Error al exportar compras:", error);
    return { success: false, error: getErrorMessage(error, "Error al generar archivo Excel") };
  }
}
