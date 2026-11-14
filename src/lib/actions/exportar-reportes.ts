"use server";

import ExcelJS from "exceljs";
import { db } from "@/lib/db";
import { ordenes, pagos, ordenServicios, vehiculos, clientes, sucursales } from "@/lib/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";

function _csvEscape(val: unknown): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function _toCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(_csvEscape).join(",");
  const bodyLines = rows.map((row) => row.map(_csvEscape).join(","));
  return [headerLine, ...bodyLines, ""].join("\n");
}

const RANGO_LABELS: Record<string, string> = {
  hoy: "Hoy",
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  mes: "Este mes",
  todo: "Histórico consolidado",
};

/**
 * Exportador oficial a Excel (.xlsx) con ExcelJS v4.4.0
 * Genera un libro de trabajo ejecutivo con diseño institucional, fórmulas,
 * celdas estilizadas, paleta Slate/Sky, formateo de moneda PEN y múltiples hojas.
 */
export async function exportarReporteExcel(
  tipo: "completo" | "ventas" | "servicios" | "pagos" = "completo",
  rango: string = "7d"
) {
  try {
    const session = await getSessionOrThrow({ modulo: "reportes", accion: "exportar" });
    const sucursalId = session.user.sucursalId;

    const getDateFilter = () => {
      switch (rango) {
        case "hoy":
          return sql`${ordenes.createdAt} >= date_trunc('day', now())`;
        case "30d":
          return sql`${ordenes.createdAt} >= now() - interval '30 days'`;
        case "mes":
          return sql`${ordenes.createdAt} >= date_trunc('month', now())`;
        case "todo":
          return sql`1 = 1`;
        case "7d":
        default:
          return sql`${ordenes.createdAt} >= now() - interval '7 days'`;
      }
    };

    const [sucursalData] = sucursalId
      ? await db
          .select({ nombre: sucursales.nombre, direccion: sucursales.direccion })
          .from(sucursales)
          .where(eq(sucursales.id, sucursalId))
      : [{ nombre: "Sucursal Principal", direccion: "Lima, Perú" }];

    // Consultas optimizadas en paralelo
    const [ventasRows, serviciosRows, pagosRows] = await Promise.all([
      db
        .select({
          ticket: ordenes.nroTicket,
          fecha: ordenes.createdAt,
          subtotal: ordenes.subtotal,
          descuento: ordenes.descuento,
          total: ordenes.total,
          estado: ordenes.estado,
          comprobanteTipo: ordenes.comprobanteTipo,
          placa: vehiculos.placa,
          tipoVehiculo: vehiculos.tipo,
          marca: vehiculos.marca,
          modelo: vehiculos.modelo,
          cliente: clientes.nombre,
          telefono: clientes.telefono,
        })
        .from(ordenes)
        .leftJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
        .leftJoin(clientes, eq(vehiculos.clienteId, clientes.id))
        .where(
          and(
            sucursalId ? eq(ordenes.sucursalId, sucursalId) : sql`1 = 1`,
            sql`${ordenes.estado} IN ('completado', 'cobrado')`,
            getDateFilter()
          )
        )
        .orderBy(sql`${ordenes.createdAt} desc`),

      db
        .select({
          nombre: ordenServicios.nombreServicio,
          cantidad: sql<number>`sum(${ordenServicios.cantidad})`,
          total: sql<string>`sum(${ordenServicios.subtotal})`,
        })
        .from(ordenServicios)
        .innerJoin(ordenes, eq(ordenServicios.ordenId, ordenes.id))
        .where(
          and(
            sucursalId ? eq(ordenes.sucursalId, sucursalId) : sql`1 = 1`,
            sql`${ordenes.estado} IN ('completado', 'cobrado')`,
            getDateFilter()
          )
        )
        .groupBy(ordenServicios.nombreServicio)
        .orderBy(sql`sum(${ordenServicios.subtotal}) desc`),

      db
        .select({
          ticket: ordenes.nroTicket,
          metodo: pagos.metodo,
          monto: pagos.monto,
          referencia: pagos.referencia,
          fecha: pagos.createdAt,
        })
        .from(pagos)
        .innerJoin(ordenes, eq(pagos.ordenId, ordenes.id))
        .where(
          and(
            sucursalId ? eq(ordenes.sucursalId, sucursalId) : sql`1 = 1`,
            getDateFilter()
          )
        )
        .orderBy(sql`${pagos.createdAt} desc`),
    ]);

    // Métricas clave calculadas
    const totalFacturado = ventasRows.reduce((acc, v) => acc + (parseFloat(v.total || "0") || 0), 0);
    const totalOrdenes = ventasRows.length;
    const ticketPromedio = totalOrdenes > 0 ? totalFacturado / totalOrdenes : 0;
    // eslint-disable-next-line security/detect-object-injection
    const rangoLabel = RANGO_LABELS[rango] || "Período personalizado";

    // Inicializar libro ExcelJS
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Car Wash Pro Perú";
    workbook.lastModifiedBy = session.user.name || "Sistema";
    workbook.created = new Date();
    workbook.modified = new Date();

    // Estilos base
    const fontPrimary = "Segoe UI";
    const headerFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0F172A" }, // Slate 900
    };
    const titleFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF0284C7" }, // Sky 600
    };
    const subHeaderFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1E293B" }, // Slate 800
    };
    const zebraFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFF8FAFC" }, // Slate 50
    };
    const totalFill: ExcelJS.Fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE2E8F0" }, // Slate 200
    };
    const thinBorder: Partial<ExcelJS.Borders> = {
      top: { style: "thin", color: { argb: "FFE2E8F0" } },
      bottom: { style: "thin", color: { argb: "FFE2E8F0" } },
      left: { style: "thin", color: { argb: "FFE2E8F0" } },
      right: { style: "thin", color: { argb: "FFE2E8F0" } },
    };

    // ──────────────────────────────────────────────────────────────────────────
    // HOJA 1: RESUMEN EJECUTIVO (Solo si tipo === "completo")
    // ──────────────────────────────────────────────────────────────────────────
    if (tipo === "completo") {
      const ws = workbook.addWorksheet("Resumen Ejecutivo", {
        views: [{ showGridLines: true }],
      });

      // Título principal
      ws.mergeCells("A1:E2");
      const titleCell = ws.getCell("A1");
      titleCell.value = "CAR WASH PRO PERÚ — INFORME GERENCIAL CONSOLIDADO";
      titleCell.fill = titleFill;
      titleCell.font = { name: fontPrimary, size: 14, bold: true, color: { argb: "FFFFFFFF" } };
      titleCell.alignment = { vertical: "middle", horizontal: "center" };

      // Metadatos
      ws.getCell("A4").value = "Sucursal:";
      ws.getCell("B4").value = sucursalData?.nombre || "San Isidro";
      ws.getCell("A5").value = "Período:";
      ws.getCell("B5").value = rangoLabel;
      ws.getCell("D4").value = "Fecha de Emisión:";
      ws.getCell("E4").value = new Date().toLocaleString("es-PE");
      ws.getCell("D5").value = "Generado por:";
      ws.getCell("E5").value = session.user.name || session.user.email;

      ["A4", "A5", "D4", "D5"].forEach((cellRef) => {
        const cell = ws.getCell(cellRef);
        cell.font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FF64748B" } };
      });
      ["B4", "B5", "E4", "E5"].forEach((cellRef) => {
        const cell = ws.getCell(cellRef);
        cell.font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FF0F172A" } };
      });

      // Sección KPIs
      ws.getCell("A7").value = "INDICADORES CLAVE DE DESEMPEÑO (KPIs)";
      ws.getCell("A7").font = { name: fontPrimary, size: 11, bold: true, color: { argb: "FF0284C7" } };

      const kpiHeaders = ["Métrica", "Valor"];
      ws.addRow(kpiHeaders);
      const kpiHeaderRow = ws.getRow(8);
      kpiHeaderRow.font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      kpiHeaderRow.eachCell((c) => {
        c.fill = subHeaderFill;
      });

      ws.addRow(["Facturación Total Registrada", totalFacturado]);
      ws.addRow(["Ticket Promedio por Servicio", ticketPromedio]);
      ws.addRow(["Total de Órdenes Atendidas y Cobradas", totalOrdenes]);

      ws.getCell("B9").numFmt = '"S/" #,##0.00';
      ws.getCell("B10").numFmt = '"S/" #,##0.00';
      ws.getCell("B11").numFmt = "#,##0";

      // Formato para celdas de KPIs
      [9, 10, 11].forEach((r) => {
        const row = ws.getRow(r);
        row.font = { name: fontPrimary, size: 10, bold: false };
        row.getCell(1).border = thinBorder;
        row.getCell(2).border = thinBorder;
        row.getCell(2).font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FF0F172A" } };
      });

      // Resumen Métodos de Pago
      ws.getCell("A14").value = "DISTRIBUCIÓN POR MÉTODO DE PAGO";
      ws.getCell("A14").font = { name: fontPrimary, size: 11, bold: true, color: { argb: "FF0284C7" } };

      const pagosGrouped: Record<string, number> = {};
      pagosRows.forEach((p) => {
        const met = p.metodo.toUpperCase();
        const amt = parseFloat(p.monto || "0") || 0;
        // eslint-disable-next-line security/detect-object-injection
        pagosGrouped[met] = (pagosGrouped[met] || 0) + amt;
      });

      const pagosHeaderRow = ws.addRow(["Canal de Pago", "Monto Total (S/)", "% Participación"]);
      pagosHeaderRow.font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      pagosHeaderRow.eachCell((c) => {
        c.fill = subHeaderFill;
      });

      Object.entries(pagosGrouped).forEach(([met, amt]) => {
        const pct = totalFacturado > 0 ? amt / totalFacturado : 0;
        const row = ws.addRow([met, amt, pct]);
        row.font = { name: fontPrimary, size: 10 };
        row.getCell(1).border = thinBorder;
        row.getCell(2).border = thinBorder;
        row.getCell(3).border = thinBorder;
        row.getCell(2).numFmt = '"S/" #,##0.00';
        row.getCell(3).numFmt = "0.0%";
      });

      // Fila total métodos
      const totalPayRow = ws.addRow(["TOTAL CONSOLIDADO", totalFacturado, 1.0]);
      totalPayRow.font = { name: fontPrimary, size: 10, bold: true };
      totalPayRow.eachCell((c) => {
        c.fill = totalFill;
        c.border = {
          top: { style: "thin" },
          bottom: { style: "double" },
        };
      });
      totalPayRow.getCell(2).numFmt = '"S/" #,##0.00';
      totalPayRow.getCell(3).numFmt = "0.0%";

      // Anchos de columna Hoja 1
      ws.getColumn("A").width = 36;
      ws.getColumn("B").width = 24;
      ws.getColumn("C").width = 20;
      ws.getColumn("D").width = 24;
      ws.getColumn("E").width = 28;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HOJA 2: DETALLE DE VENTAS (si tipo === "completo" || tipo === "ventas")
    // ──────────────────────────────────────────────────────────────────────────
    if (tipo === "completo" || tipo === "ventas") {
      const wsVentas = workbook.addWorksheet("Detalle de Ventas", {
        views: [{ state: "frozen", ySplit: 3, showGridLines: true }],
      });

      // Banner superior
      wsVentas.mergeCells("A1:J1");
      const bCell = wsVentas.getCell("A1");
      bCell.value = `REPORTE DETALLADO DE VENTAS — ${sucursalData?.nombre || "SUCURSAL"} (${rangoLabel.toUpperCase()})`;
      bCell.fill = headerFill;
      bCell.font = { name: fontPrimary, size: 12, bold: true, color: { argb: "FFFFFFFF" } };
      bCell.alignment = { vertical: "middle", horizontal: "center" };
      wsVentas.getRow(1).height = 28;

      // Encabezados de tabla
      const cols = [
        "N° Ticket",
        "Fecha y Hora",
        "Placa",
        "Vehículo",
        "Tipo",
        "Cliente",
        "Teléfono",
        "Subtotal (S/)",
        "Descuento (S/)",
        "Total (S/)",
      ];
      const headerRow = wsVentas.addRow(cols);
      headerRow.height = 24;
      headerRow.font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.eachCell((c) => {
        c.fill = subHeaderFill;
        c.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Datos
      ventasRows.forEach((v, idx) => {
        const vehiculoDesc = [v.marca, v.modelo].filter(Boolean).join(" ") || "Vehículo sin modelo";
        const rowData = [
          v.ticket || "S/N",
          v.fecha ? new Date(v.fecha).toLocaleString("es-PE") : "—",
          v.placa || "—",
          vehiculoDesc,
          (v.tipoVehiculo || "SEDÁN").toUpperCase(),
          v.cliente || "Cliente General",
          v.telefono || "—",
          parseFloat(v.subtotal || "0") || 0,
          parseFloat(v.descuento || "0") || 0,
          parseFloat(v.total || "0") || 0,
        ];

        const row = wsVentas.addRow(rowData);
        row.font = { name: fontPrimary, size: 9.5 };

        // Zebra striping
        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = zebraFill;
          });
        }

        row.eachCell((c) => {
          c.border = thinBorder;
        });

        // Formatos específicos
        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(3).alignment = { horizontal: "center" };
        row.getCell(5).alignment = { horizontal: "center" };
        row.getCell(8).numFmt = '"S/" #,##0.00';
        row.getCell(9).numFmt = '"S/" #,##0.00';
        row.getCell(10).numFmt = '"S/" #,##0.00';
        row.getCell(10).font = { name: fontPrimary, size: 9.5, bold: true };
      });

      // Fila de totales
      const totalVentasRow = wsVentas.addRow([
        "TOTALES",
        "",
        "",
        "",
        "",
        "",
        `${ventasRows.length} órdenes`,
        { formula: `SUM(H3:H${ventasRows.length + 2})` },
        { formula: `SUM(I3:I${ventasRows.length + 2})` },
        { formula: `SUM(J3:J${ventasRows.length + 2})` },
      ]);
      totalVentasRow.height = 24;
      totalVentasRow.font = { name: fontPrimary, size: 10, bold: true };
      totalVentasRow.eachCell((c) => {
        c.fill = totalFill;
        c.border = { top: { style: "thin" }, bottom: { style: "double" } };
      });
      totalVentasRow.getCell(8).numFmt = '"S/" #,##0.00';
      totalVentasRow.getCell(9).numFmt = '"S/" #,##0.00';
      totalVentasRow.getCell(10).numFmt = '"S/" #,##0.00';

      // Ajuste de anchos
      wsVentas.getColumn("A").width = 16;
      wsVentas.getColumn("B").width = 20;
      wsVentas.getColumn("C").width = 14;
      wsVentas.getColumn("D").width = 22;
      wsVentas.getColumn("E").width = 16;
      wsVentas.getColumn("F").width = 26;
      wsVentas.getColumn("G").width = 16;
      wsVentas.getColumn("H").width = 16;
      wsVentas.getColumn("I").width = 16;
      wsVentas.getColumn("J").width = 18;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HOJA 3: SERVICIOS TOP (si tipo === "completo" || tipo === "servicios")
    // ──────────────────────────────────────────────────────────────────────────
    if (tipo === "completo" || tipo === "servicios") {
      const wsServicios = workbook.addWorksheet("Ranking de Servicios", {
        views: [{ state: "frozen", ySplit: 2, showGridLines: true }],
      });

      // Encabezado
      const sCols = [
        "Puesto",
        "Servicio de Lavado / Mantenimiento",
        "Atenciones Realizadas",
        "Facturación Total (S/)",
        "% Recaudación",
      ];
      const sHeaderRow = wsServicios.addRow(sCols);
      sHeaderRow.height = 24;
      sHeaderRow.font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      sHeaderRow.eachCell((c) => {
        c.fill = subHeaderFill;
        c.alignment = { vertical: "middle", horizontal: "center" };
      });

      const totalServiciosMonto = serviciosRows.reduce(
        (acc, s) => acc + (parseFloat(s.total || "0") || 0),
        0
      );

      serviciosRows.forEach((s, idx) => {
        const amt = parseFloat(s.total || "0") || 0;
        const pct = totalServiciosMonto > 0 ? amt / totalServiciosMonto : 0;

        const row = wsServicios.addRow([
          `# ${idx + 1}`,
          s.nombre,
          s.cantidad,
          amt,
          pct,
        ]);
        row.font = { name: fontPrimary, size: 9.5 };

        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = zebraFill;
          });
        }
        row.eachCell((c) => {
          c.border = thinBorder;
        });

        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(3).alignment = { horizontal: "center" };
        row.getCell(4).numFmt = '"S/" #,##0.00';
        row.getCell(4).font = { name: fontPrimary, size: 9.5, bold: true };
        row.getCell(5).numFmt = "0.0%";
      });

      // Total fila
      const totalServRow = wsServicios.addRow([
        "TOTAL",
        "",
        { formula: `SUM(C2:C${serviciosRows.length + 1})` },
        totalServiciosMonto,
        1.0,
      ]);
      totalServRow.font = { name: fontPrimary, size: 10, bold: true };
      totalServRow.eachCell((c) => {
        c.fill = totalFill;
        c.border = { top: { style: "thin" }, bottom: { style: "double" } };
      });
      totalServRow.getCell(4).numFmt = '"S/" #,##0.00';
      totalServRow.getCell(5).numFmt = "0.0%";

      wsServicios.getColumn("A").width = 12;
      wsServicios.getColumn("B").width = 36;
      wsServicios.getColumn("C").width = 24;
      wsServicios.getColumn("D").width = 24;
      wsServicios.getColumn("E").width = 20;
    }

    // ──────────────────────────────────────────────────────────────────────────
    // HOJA 4: DESGLOSE DE PAGOS (si tipo === "completo" || tipo === "pagos")
    // ──────────────────────────────────────────────────────────────────────────
    if (tipo === "completo" || tipo === "pagos") {
      const wsPagos = workbook.addWorksheet("Flujo de Pagos", {
        views: [{ state: "frozen", ySplit: 2, showGridLines: true }],
      });

      const pCols = [
        "N° Ticket",
        "Canal de Cobro",
        "Referencia / Operación",
        "Monto Cobrado (S/)",
        "Fecha y Hora",
      ];
      const pHeaderRow = wsPagos.addRow(pCols);
      pHeaderRow.height = 24;
      pHeaderRow.font = { name: fontPrimary, size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      pHeaderRow.eachCell((c) => {
        c.fill = subHeaderFill;
        c.alignment = { vertical: "middle", horizontal: "center" };
      });

      pagosRows.forEach((p, idx) => {
        const amt = parseFloat(p.monto || "0") || 0;
        const row = wsPagos.addRow([
          p.ticket || "—",
          p.metodo.toUpperCase(),
          p.referencia || "Sin referencia",
          amt,
          p.fecha ? new Date(p.fecha).toLocaleString("es-PE") : "—",
        ]);
        row.font = { name: fontPrimary, size: 9.5 };

        if (idx % 2 === 1) {
          row.eachCell((c) => {
            c.fill = zebraFill;
          });
        }
        row.eachCell((c) => {
          c.border = thinBorder;
        });

        row.getCell(1).alignment = { horizontal: "center" };
        row.getCell(2).alignment = { horizontal: "center" };
        row.getCell(4).numFmt = '"S/" #,##0.00';
        row.getCell(4).font = { name: fontPrimary, size: 9.5, bold: true };
        row.getCell(5).alignment = { horizontal: "center" };
      });

      // Total pagos
      const totalPagosMonto = pagosRows.reduce((acc, p) => acc + (parseFloat(p.monto || "0") || 0), 0);
      const totalPagRow = wsPagos.addRow([
        "TOTAL",
        "",
        `${pagosRows.length} cobros`,
        totalPagosMonto,
        "",
      ]);
      totalPagRow.font = { name: fontPrimary, size: 10, bold: true };
      totalPagRow.eachCell((c) => {
        c.fill = totalFill;
        c.border = { top: { style: "thin" }, bottom: { style: "double" } };
      });
      totalPagRow.getCell(4).numFmt = '"S/" #,##0.00';

      wsPagos.getColumn("A").width = 18;
      wsPagos.getColumn("B").width = 22;
      wsPagos.getColumn("C").width = 28;
      wsPagos.getColumn("D").width = 22;
      wsPagos.getColumn("E").width = 24;
    }

    // Generar buffer XLSX en memoria con ExcelJS
    const buffer = await workbook.xlsx.writeBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const dateStamp = new Date().toISOString().split("T")[0];

    const filename =
      tipo === "completo"
        ? `Reporte-Ejecutivo-${rango}-${dateStamp}.xlsx`
        : `Reporte-${tipo}-${rango}-${dateStamp}.xlsx`;

    return {
      success: true,
      base64,
      filename,
    };
  } catch (error) {
    console.error("Error al exportar a Excel con ExcelJS:", error);
    return {
      success: false,
      error: "Ocurrió un error al generar el libro de Excel.",
    };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// EXPORTADORES CSV RETROCOMPATIBLES
// ────────────────────────────────────────────────────────────────────────────

export async function exportarVentasCSV() {
  try {
    await getSessionOrThrow({ modulo: "reportes", accion: "exportar" });

    const rows = await db
      .select({
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        total: ordenes.total,
        createdAt: ordenes.createdAt,
      })
      .from(ordenes)
      .where(sql`${ordenes.estado} IN ('completado', 'cobrado')`)
      .orderBy(sql`${ordenes.createdAt} desc`);

    const headers = ["Ticket", "Estado", "Total", "Fecha"];
    const data = rows.map((r) => [
      r.nroTicket || "",
      r.estado,
      r.total || "0",
      r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "",
    ]);

    return {
      success: true,
      csv: _toCSV(headers, data),
      filename: `ventas-${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error) {
    console.error("Error al exportar ventas:", error);
    return { success: false, error: "Error al exportar ventas" };
  }
}

export async function exportarServiciosCSV() {
  try {
    await getSessionOrThrow({ modulo: "reportes", accion: "exportar" });

    const rows = await db
      .select({
        nombre: ordenServicios.nombreServicio,
        cantidad: sql<number>`sum(${ordenServicios.cantidad})`,
        subtotal: sql<string>`sum(${ordenServicios.subtotal})`,
      })
      .from(ordenServicios)
      .innerJoin(ordenes, eq(ordenServicios.ordenId, ordenes.id))
      .where(sql`${ordenes.estado} IN ('completado', 'cobrado')`)
      .groupBy(ordenServicios.nombreServicio)
      .orderBy(sql`sum(${ordenServicios.cantidad}) desc`);

    const headers = ["Servicio", "Cantidad", "Total"];
    const data = rows.map((r) => [
      r.nombre,
      String(r.cantidad),
      r.subtotal || "0",
    ]);

    return {
      success: true,
      csv: _toCSV(headers, data),
      filename: `servicios-${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error) {
    console.error("Error al exportar servicios:", error);
    return { success: false, error: "Error al exportar servicios" };
  }
}

export async function exportarPagosCSV() {
  try {
    await getSessionOrThrow({ modulo: "reportes", accion: "exportar" });

    const rows = await db
      .select({
        metodo: pagos.metodo,
        monto: pagos.monto,
        createdAt: pagos.createdAt,
      })
      .from(pagos)
      .orderBy(sql`${pagos.createdAt} desc`);

    const headers = ["Método", "Monto", "Fecha"];
    const data = rows.map((r) => [
      r.metodo,
      r.monto || "0",
      r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "",
    ]);

    return {
      success: true,
      csv: _toCSV(headers, data),
      filename: `pagos-${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error) {
    console.error("Error al exportar pagos:", error);
    return { success: false, error: "Error al exportar pagos" };
  }
}
