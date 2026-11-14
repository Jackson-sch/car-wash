"use server";

import { eq, and, desc, count } from "drizzle-orm";
import { db } from "@/lib/db";
import { cupones, cuponServicios, cuponesUsos, ordenes, vehiculos, sucursales } from "@/lib/db/schema";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import { revalidatePath } from "next/cache";
import ExcelJS from "exceljs";

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

export async function deleteCupon(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "gestionar" });
    const sucursalId = session.user.sucursalId!;

    await db
      .delete(cupones)
      .where(and(eq(cupones.id, id), eq(cupones.sucursalId, sucursalId)));

    revalidatePath("/cupones");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar cupón:", error);
    return { success: false, error: "No se pudo eliminar el cupón (puede tener canjes asociados)." };
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

// Exportar Catálogo de Cupones y Promociones a Excel (.xlsx) con ExcelJS v4.4.0
export async function exportarCuponesExcelAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "configuracion", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [sucursalData] = await db
      .select({
        nombre: sucursales.nombre,
        direccion: sucursales.direccion,
        ruc: sucursales.ruc,
      })
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId));

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

    const wb = new ExcelJS.Workbook();
    wb.creator = "WashMaster Pro - Sistema de Car Wash";
    wb.created = new Date();

    const ws = wb.addWorksheet("Cupones & Promociones", {
      views: [{ showGridLines: true }],
    });

    const NAVY_HEADER = "0F172A";
    const PRIMARY_BLUE = "0284C7";
    const ZEBRA_ROW = "F8FAFC";
    const BORDER_COLOR = "E2E8F0";

    // 1. Banner Superior
    ws.mergeCells("A1:K1");
    const banner = ws.getCell("A1");
    banner.value = "CAR WASH PRO PERÚ — CATÁLOGO DE CUPONES & PROMOCIONES VIGENTES";
    banner.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_HEADER } };
    banner.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 36;

    // 2. Metadata
    ws.mergeCells("A2:K2");
    const meta = ws.getCell("A2");
    meta.value = `Sucursal: ${sucursalData?.nombre || "Principal"} | RUC: ${sucursalData?.ruc || "20123456789"} | Generado: ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })} | Usuario: ${session.user.name || session.user.email}`;
    meta.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF475569" } };
    meta.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(2).height = 20;

    // 3. Espaciador
    ws.getRow(3).height = 10;

    // 4. Cabeceras
    const headers = [
      "#",
      "Código de Cupón",
      "Tipo Beneficio",
      "Valor Descuento",
      "Compra Mínima (PEN)",
      "Cupo Máximo",
      "Canjes Realizados",
      "% Cupo Consumido",
      "Servicios Aplicables",
      "Vigencia Hasta",
      "Estado Campaña",
    ];

    const headerRow = ws.getRow(4);
    headerRow.values = headers;
    headerRow.height = 26;

    headers.forEach((_, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_BLUE } };
      cell.alignment = {
        horizontal: idx === 1 || idx === 8 ? "left" : idx === 3 || idx === 4 || idx === 5 || idx === 6 || idx === 7 ? "right" : "center",
        vertical: "middle",
      };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "medium", color: { argb: "FF0369A1" } },
      };
    });

    const now = new Date();

    // 5. Filas de Datos
    listaCupones.forEach((c, index) => {
      const rowIdx = index + 5;
      const row = ws.getRow(rowIdx);
      const isZebra = index % 2 === 1;

      const valorNum = parseFloat(c.valorDescuento) || 0;
      const compraMinNum = c.compraMinima ? parseFloat(c.compraMinima) : 0;
      const canjes = c.usos?.length || 0;
      const limite = c.limiteTotal || 0;
      const porcentajeUso = limite > 0 ? canjes / limite : 0;

      const isExpired = c.fechaFin && new Date(c.fechaFin) < now;
      const isExhausted = limite > 0 && canjes >= limite;

      let estadoStr = "Activo";
      if (!c.activo) {
        estadoStr = "Pausado";
      } else if (isExpired) {
        estadoStr = "Expirado";
      } else if (isExhausted) {
        estadoStr = "Agotado";
      }

      const serviciosStr =
        c.servicios && c.servicios.length > 0
          ? c.servicios
              .map((s) => s.servicio?.nombre)
              .filter(Boolean)
              .join(", ")
          : "Todos los servicios";

      const vigenciaStr = c.fechaFin
        ? new Date(c.fechaFin).toLocaleDateString("es-PE", { timeZone: "America/Lima" })
        : "Sin caducidad (Permanente)";

      row.values = [
        index + 1,
        c.codigo,
        c.tipoDescuento === "porcentaje" ? "Porcentaje (%)" : "Monto Fijo (S/)",
        c.tipoDescuento === "porcentaje" ? valorNum / 100 : valorNum,
        compraMinNum > 0 ? compraMinNum : "Sin mínimo",
        limite > 0 ? limite : "Ilimitado",
        canjes,
        limite > 0 ? porcentajeUso : "N/A",
        serviciosStr,
        vigenciaStr,
        estadoStr,
      ];
      row.height = 22;

      // Estilos de celdas
      for (let col = 1; col <= headers.length; col++) {
        const cell = row.getCell(col);
        cell.font = { name: "Segoe UI", size: 9.5 };

        if (isZebra) {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA_ROW } };
        }

        cell.border = {
          top: { style: "thin", color: { argb: BORDER_COLOR } },
          bottom: { style: "thin", color: { argb: BORDER_COLOR } },
          left: { style: "thin", color: { argb: BORDER_COLOR } },
          right: { style: "thin", color: { argb: BORDER_COLOR } },
        };

        if (col === 1) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { ...cell.font, color: { argb: "FF64748B" } };
        } else if (col === 2) {
          cell.font = { name: "Consolas", size: 10, bold: true, color: { argb: "FF0F172A" } };
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (col === 3) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (col === 4) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.font = { name: "Consolas", size: 10, bold: true };
          if (c.tipoDescuento === "porcentaje") {
            cell.numFmt = "0.0%";
          } else {
            cell.numFmt = '"S/" #,##0.00';
          }
        } else if (col === 5) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          if (typeof cell.value === "number") {
            cell.numFmt = '"S/" #,##0.00';
          }
        } else if (col === 6 || col === 7) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          if (typeof cell.value === "number") {
            cell.numFmt = "#,##0";
          }
        } else if (col === 8) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          if (typeof cell.value === "number") {
            cell.numFmt = "0.0%";
          }
        } else if (col === 9) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (col === 10) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (col === 11) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Segoe UI", size: 9, bold: true };
          if (estadoStr === "Activo") {
            cell.font = { ...cell.font, color: { argb: "FF166534" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
          } else if (estadoStr === "Agotado") {
            cell.font = { ...cell.font, color: { argb: "FF9A3412" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFFEDD5" } };
          } else if (estadoStr === "Expirado") {
            cell.font = { ...cell.font, color: { argb: "FF991B1B" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEE2E2" } };
          } else {
            cell.font = { ...cell.font, color: { argb: "FF475569" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
          }
        }
      }
    });

    // 6. Fila de Totales
    const totalRowIdx = listaCupones.length + 5;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.height = 24;

    totalRow.getCell(2).value = "TOTALES CONSOLIDADOS";
    totalRow.getCell(2).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: NAVY_HEADER } };
    totalRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };

    totalRow.getCell(7).value = { formula: `SUM(G5:G${totalRowIdx - 1})` };
    totalRow.getCell(7).font = { name: "Consolas", size: 10, bold: true, color: { argb: NAVY_HEADER } };
    totalRow.getCell(7).numFmt = "#,##0";
    totalRow.getCell(7).alignment = { horizontal: "right", vertical: "middle" };

    for (let c = 1; c <= headers.length; c++) {
      const cell = totalRow.getCell(c);
      cell.border = {
        top: { style: "double", color: { argb: NAVY_HEADER } },
        bottom: { style: "thin", color: { argb: NAVY_HEADER } },
      };
      if (c !== 2 && c !== 7) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
    }

    // 7. Anchos de Columna Automáticos
    ws.columns = [
      { width: 6 },   // #
      { width: 22 },  // Código
      { width: 18 },  // Tipo
      { width: 16 },  // Valor Descuento
      { width: 20 },  // Compra Mínima
      { width: 14 },  // Cupo Total
      { width: 16 },  // Canjes Realizados
      { width: 18 },  // % Consumido
      { width: 34 },  // Servicios Aplicables
      { width: 22 },  // Vigencia
      { width: 16 },  // Estado
    ];

    const buffer = await wb.xlsx.writeBuffer();
    const dateStamp = new Date().toISOString().split("T")[0];

    return {
      success: true,
      base64: Buffer.from(buffer).toString("base64"),
      filename: `Reporte_Cupones_${sucursalData?.nombre?.replace(/\s+/g, "_") || "Sucursal"}_${dateStamp}.xlsx`,
    };
  } catch (error) {
    console.error("Error al exportar cupones a Excel:", error);
    return { success: false, error: "No se pudo generar el reporte en Excel." };
  }
}

