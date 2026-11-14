"use server";

import { db } from "@/lib/db";
import { vehiculos, clientes, ordenes, ordenServicios, sucursales } from "@/lib/db/schema";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { getErrorMessage } from "./action-utils";
import ExcelJS from "exceljs";

export async function getVehiculos(search?: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const conditions = and(
      eq(clientes.sucursalId, sucursalId),
      eq(clientes.activo, true),
      eq(vehiculos.activo, true),
      search
        ? or(
            ilike(vehiculos.placa, `%${search}%`),
            ilike(vehiculos.marca, `%${search}%`),
            ilike(vehiculos.modelo, `%${search}%`),
            ilike(clientes.nombre, `%${search}%`),
          )
        : undefined,
    );

    const rows = await db
      .select({
        id: vehiculos.id,
        placa: vehiculos.placa,
        tipo: vehiculos.tipo,
        marca: vehiculos.marca,
        modelo: vehiculos.modelo,
        anio: vehiculos.anio,
        color: vehiculos.color,
        clienteId: clientes.id,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        totalOrdenes: sql<number>`COALESCE(COUNT(${ordenes.id}), 0)::int`,
      })
      .from(vehiculos)
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(ordenes, eq(ordenes.vehiculoId, vehiculos.id))
      .where(conditions)
      .groupBy(vehiculos.id, clientes.id)
      .orderBy(desc(vehiculos.createdAt));

    return rows;
  } catch (error) {
    console.error("Error al obtener vehículos:", error);
    return [];
  }
}

export async function getVehiculoById(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [vehiculo] = await db
      .select({
        id: vehiculos.id,
        placa: vehiculos.placa,
        tipo: vehiculos.tipo,
        marca: vehiculos.marca,
        modelo: vehiculos.modelo,
        anio: vehiculos.anio,
        color: vehiculos.color,
        notas: vehiculos.notas,
        activo: vehiculos.activo,
        createdAt: vehiculos.createdAt,
        clienteId: clientes.id,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        clienteEmail: clientes.email,
      })
      .from(vehiculos)
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .where(and(eq(vehiculos.id, id), eq(clientes.sucursalId, sucursalId)))
      .limit(1);

    if (!vehiculo) throw new Error("Vehículo no encontrado");

    const ordenesList = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        total: ordenes.total,
        prioridad: ordenes.prioridad,
        notas: ordenes.notas,
        createdAt: ordenes.createdAt,
        servicios: sql<string>`
          COALESCE(
            (SELECT STRING_AGG(${ordenServicios.nombreServicio}, ', ')
             FROM ${ordenServicios}
             WHERE ${ordenServicios.ordenId} = ${ordenes.id}),
            ''
          )
        `,
      })
      .from(ordenes)
      .where(eq(ordenes.vehiculoId, id))
      .orderBy(desc(ordenes.createdAt))
      .limit(20);

    return { vehiculo, ordenes: ordenesList };
  } catch (error) {
    console.error("Error al obtener vehículo:", error);
    return null;
  }
}

export async function updateVehiculo(
  id: string,
  data: {
    marca?: string;
    modelo?: string;
    anio?: number | null;
    color?: string;
    tipo?: string;
    notas?: string;
  }
) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "editar" });
    const sucursalId = session.user.sucursalId!;

    const [existing] = await db
      .select({ id: vehiculos.id })
      .from(vehiculos)
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .where(and(eq(vehiculos.id, id), eq(clientes.sucursalId, sucursalId)))
      .limit(1);

    if (!existing) throw new Error("Vehículo no encontrado");

    const [updated] = await db
      .update(vehiculos)
      .set({
        ...(data.marca !== undefined && { marca: data.marca || null }),
        ...(data.modelo !== undefined && { modelo: data.modelo || null }),
        ...(data.anio !== undefined && { anio: data.anio }),
        ...(data.color !== undefined && { color: data.color || null }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ...(data.tipo !== undefined && { tipo: data.tipo as any }),
        ...(data.notas !== undefined && { notas: data.notas || null }),
      })
      .where(eq(vehiculos.id, id))
      .returning();

    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar vehículo:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar el vehículo") };
  }
}

// Exportar Registro de Vehículos a Excel (.xlsx) con ExcelJS v4.4.0
export async function exportarVehiculosExcelAction() {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [sucursalData] = await db
      .select({
        nombre: sucursales.nombre,
        direccion: sucursales.direccion,
        ruc: sucursales.ruc,
      })
      .from(sucursales)
      .where(eq(sucursales.id, sucursalId));

    const rows = await db
      .select({
        id: vehiculos.id,
        placa: vehiculos.placa,
        tipo: vehiculos.tipo,
        marca: vehiculos.marca,
        modelo: vehiculos.modelo,
        anio: vehiculos.anio,
        color: vehiculos.color,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        totalOrdenes: sql<number>`COALESCE(COUNT(${ordenes.id}), 0)::int`,
      })
      .from(vehiculos)
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(ordenes, eq(ordenes.vehiculoId, vehiculos.id))
      .where(and(eq(clientes.sucursalId, sucursalId), eq(clientes.activo, true), eq(vehiculos.activo, true)))
      .groupBy(vehiculos.id, clientes.id)
      .orderBy(desc(vehiculos.createdAt));

    const wb = new ExcelJS.Workbook();
    wb.creator = "WashMaster Pro - Sistema de Car Wash";
    wb.created = new Date();

    const ws = wb.addWorksheet("Flota de Vehículos", {
      views: [{ showGridLines: true }],
    });

    const NAVY_HEADER = "0F172A";
    const PRIMARY_BLUE = "0284C7";
    const ZEBRA_ROW = "F8FAFC";
    const BORDER_COLOR = "E2E8F0";

    // 1. Banner
    ws.mergeCells("A1:K1");
    const banner = ws.getCell("A1");
    banner.value = "CAR WASH PRO PERÚ — REGISTRO GENERAL DE VEHÍCULOS & FLOTA";
    banner.font = { name: "Segoe UI", size: 14, bold: true, color: { argb: "FFFFFFFF" } };
    banner.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY_HEADER } };
    banner.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(1).height = 36;

    // 2. Metadata
    ws.mergeCells("A2:K2");
    const meta = ws.getCell("A2");
    meta.value = `Sucursal: ${sucursalData?.nombre || "Principal"} | RUC: ${sucursalData?.ruc || "20123456789"} | Generado: ${new Date().toLocaleString("es-PE", { timeZone: "America/Lima" })} | Total Unidades: ${rows.length} | Usuario: ${session.user.name || session.user.email}`;
    meta.font = { name: "Segoe UI", size: 9, italic: true, color: { argb: "FF475569" } };
    meta.alignment = { horizontal: "center", vertical: "middle" };
    ws.getRow(2).height = 20;

    // 3. Espaciador
    ws.getRow(3).height = 10;

    // 4. Headers
    const headers = [
      "#",
      "Placa (Perú)",
      "Categoría / Tipo",
      "Marca",
      "Modelo",
      "Año",
      "Color",
      "Propietario / Cliente",
      "Celular / WhatsApp",
      "Servicios Atendidos",
      "Estado Flota",
    ];

    const headerRow = ws.getRow(4);
    headerRow.values = headers;
    headerRow.height = 26;

    headers.forEach((_, idx) => {
      const cell = headerRow.getCell(idx + 1);
      cell.font = { name: "Segoe UI", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: PRIMARY_BLUE } };
      cell.alignment = {
        horizontal: idx === 1 ? "center" : idx === 3 || idx === 4 || idx === 7 ? "left" : idx === 9 ? "right" : "center",
        vertical: "middle",
      };
      cell.border = {
        top: { style: "thin", color: { argb: BORDER_COLOR } },
        bottom: { style: "medium", color: { argb: "FF0369A1" } },
      };
    });

    const TIPO_MAP: Record<string, string> = {
      sedan: "Sedán",
      suv: "SUV",
      pickup: "Pick-up",
      moto: "Moto",
      camion: "Camión",
      furgon: "Furgón",
      otro: "Otro",
    };

    // 5. Filas de datos
    rows.forEach((v, index) => {
      const rowIdx = index + 5;
      const row = ws.getRow(rowIdx);
      const isZebra = index % 2 === 1;

      const tipoStr = TIPO_MAP[v.tipo || ""] || v.tipo?.toUpperCase() || "SEDÁN";
      const clienteStr = `${v.clienteNombre} ${v.clienteApellido || ""}`.trim();
      const estadoStr = v.totalOrdenes > 0 ? "Activo c/ Órdenes" : "Registrado s/ Órdenes";

      row.values = [
        index + 1,
        v.placa?.toUpperCase(),
        tipoStr,
        v.marca || "—",
        v.modelo || "—",
        v.anio || "—",
        v.color || "—",
        clienteStr,
        v.clienteTelefono || "—",
        v.totalOrdenes,
        estadoStr,
      ];
      row.height = 22;

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
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (col === 3 || col === 6 || col === 7) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
        } else if (col === 4 || col === 5 || col === 8) {
          cell.alignment = { horizontal: "left", vertical: "middle" };
        } else if (col === 9) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Consolas", size: 9.5 };
        } else if (col === 10) {
          cell.alignment = { horizontal: "right", vertical: "middle" };
          cell.font = { name: "Consolas", size: 10, bold: true };
          cell.numFmt = "#,##0";
        } else if (col === 11) {
          cell.alignment = { horizontal: "center", vertical: "middle" };
          cell.font = { name: "Segoe UI", size: 9, bold: true };
          if (v.totalOrdenes > 0) {
            cell.font = { ...cell.font, color: { argb: "FF166534" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDCFCE7" } };
          } else {
            cell.font = { ...cell.font, color: { argb: "FF475569" } };
            cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
          }
        }
      }
    });

    // 6. Fila de Totales
    const totalRowIdx = rows.length + 5;
    const totalRow = ws.getRow(totalRowIdx);
    totalRow.height = 24;

    totalRow.getCell(2).value = "TOTAL FLOTA REGISTRADA";
    totalRow.getCell(2).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: NAVY_HEADER } };
    totalRow.getCell(2).alignment = { horizontal: "left", vertical: "middle" };

    totalRow.getCell(10).value = { formula: `SUM(J5:J${totalRowIdx - 1})` };
    totalRow.getCell(10).font = { name: "Consolas", size: 10, bold: true, color: { argb: NAVY_HEADER } };
    totalRow.getCell(10).numFmt = "#,##0";
    totalRow.getCell(10).alignment = { horizontal: "right", vertical: "middle" };

    for (let c = 1; c <= headers.length; c++) {
      const cell = totalRow.getCell(c);
      cell.border = {
        top: { style: "double", color: { argb: NAVY_HEADER } },
        bottom: { style: "thin", color: { argb: NAVY_HEADER } },
      };
      if (c !== 2 && c !== 10) {
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
      }
    }

    // 7. Anchos de Columna
    ws.columns = [
      { width: 6 },   // #
      { width: 16 },  // Placa
      { width: 18 },  // Categoría
      { width: 16 },  // Marca
      { width: 18 },  // Modelo
      { width: 10 },  // Año
      { width: 14 },  // Color
      { width: 28 },  // Propietario
      { width: 20 },  // Celular
      { width: 20 },  // Servicios Atendidos
      { width: 24 },  // Estado Flota
    ];

    const buffer = await wb.xlsx.writeBuffer();
    const dateStamp = new Date().toISOString().split("T")[0];

    return {
      success: true,
      base64: Buffer.from(buffer).toString("base64"),
      filename: `Reporte_Vehiculos_${sucursalData?.nombre?.replace(/\s+/g, "_") || "Sucursal"}_${dateStamp}.xlsx`,
    };
  } catch (error) {
    console.error("Error al exportar vehículos a Excel:", error);
    return { success: false, error: "No se pudo generar el reporte de vehículos en Excel." };
  }
}
