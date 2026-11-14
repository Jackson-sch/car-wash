"use server";

import { db } from "@/lib/db";
import { clientes, vehiculos, puntosFidelidad, ordenes, sucursales } from "@/lib/db/schema";
import { eq, and, desc, sql, inArray, ilike } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "./action-utils";
import ExcelJS from "exceljs";

// Buscar vehículo por placa y devolver datos del cliente asociado
export async function buscarVehiculoPorPlaca(placa: string) {
  try {
    const session = await getSessionOrThrow();
    const sucursalId = session.user.sucursalId!;

    const results = await db
      .select({
        vehiculoId: vehiculos.id,
        placa: vehiculos.placa,
        tipo: vehiculos.tipo,
        marca: vehiculos.marca,
        modelo: vehiculos.modelo,
        color: vehiculos.color,
        clienteId: clientes.id,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        clienteEmail: clientes.email,
        puntosAcumulados: sql<number>`coalesce((
          select sum(${puntosFidelidad.puntos})::int
          from ${puntosFidelidad}
          where ${puntosFidelidad.clienteId} = ${clientes.id}
        ), 0)`,
      })
      .from(vehiculos)
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .where(
        and(
          ilike(vehiculos.placa, placa.trim()),
          eq(clientes.sucursalId, sucursalId),
          eq(clientes.activo, true),
          eq(vehiculos.activo, true)
        )
      )
      .limit(1);

    if (results.length === 0) return null;
    return results[0];
  } catch {
    return null;
  }
}

// Obtener todos los clientes con su total de puntos y cantidad de vehículos
async function _getClientes() {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const result = await db
      .select({
        id: clientes.id,
        nombre: clientes.nombre,
        apellido: clientes.apellido,
        telefono: clientes.telefono,
        email: clientes.email,
        tipoDoc: clientes.tipoDoc,
        nroDoc: clientes.nroDoc,
        notas: clientes.notas,
        createdAt: clientes.createdAt,
        totalVehiculos: sql<number>`(
          SELECT COALESCE(COUNT(*), 0)::int
          FROM ${vehiculos}
          WHERE ${vehiculos.clienteId} = clientes.id
        )`,
        totalPuntos: sql<number>`(
          SELECT COALESCE(SUM(${puntosFidelidad.puntos}), 0)::int
          FROM ${puntosFidelidad}
          WHERE ${puntosFidelidad.clienteId} = clientes.id
        )`,
      })
      .from(clientes)
      .where(and(eq(clientes.sucursalId, sucursalId), eq(clientes.activo, true)))
      .orderBy(clientes.nombre);

    return result;
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
}

// Crear un cliente manualmente
export async function createCliente(data: {
  nombre: string;
  apellido?: string | null;
  telefono?: string | null;
  email?: string | null;
  tipoDoc?: "DNI" | "RUC" | "CE" | "PASAPORTE" | null;
  nroDoc?: string | null;
  notas?: string | null;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "crear" });
    const sucursalId = session.user.sucursalId!;

    const [newCliente] = await db
      .insert(clientes)
      .values({
        sucursalId,
        nombre: data.nombre,
        apellido: data.apellido || null,
        telefono: data.telefono || null,
        email: data.email || null,
        tipoDoc: data.tipoDoc || null,
        nroDoc: data.nroDoc || null,
        notas: data.notas || null,
        activo: true,
      })
      .returning();

    revalidateTag("clientes", { expire: 600 });
    revalidatePath("/clientes");
    return { success: true, data: newCliente };
  } catch (error: unknown) {
    console.error("Error al crear cliente:", error);
    return { success: false, error: getErrorMessage(error, "Error al crear el cliente") };
  }
}

// Obtener clientes inactivos sin lavados recientes para campañas de WhatsApp
async function getClientesInactivos(diasInactividad = 30) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const result = await db
      .select({
        id: clientes.id,
        nombre: clientes.nombre,
        apellido: clientes.apellido,
        telefono: clientes.telefono,
        email: clientes.email,
        ultimoLavadoAt: sql<string>`max(${ordenes.createdAt})`,
      })
      .from(clientes)
      .leftJoin(vehiculos, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(ordenes, eq(ordenes.vehiculoId, vehiculos.id))
      .where(eq(clientes.sucursalId, sucursalId))
      .groupBy(clientes.id, clientes.nombre, clientes.apellido, clientes.telefono, clientes.email)
      .limit(50);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error al obtener clientes inactivos:", error);
    return { success: false, data: [] };
  }
}


// Obtener el historial completo de un cliente
export async function getClienteHistorial(clienteId: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [cliente] = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(and(eq(clientes.id, clienteId), eq(clientes.sucursalId, sucursalId)));

    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }

    // 1. Obtener vehículos del cliente
    const clienteVehiculos = await db
      .select()
      .from(vehiculos)
      .where(eq(vehiculos.clienteId, clienteId));

    // 2. Obtener historial de puntos
    const puntosLogs = await db
      .select()
      .from(puntosFidelidad)
      .where(eq(puntosFidelidad.clienteId, clienteId))
      .orderBy(desc(puntosFidelidad.createdAt));

    // 3. Obtener historial de órdenes realizadas por sus vehículos
    const vehiculoIds = clienteVehiculos.map((v) => v.id);
    let ordersList: {
      id: string;
      nroTicket: string | null;
      estado: string;
      total: string | null;
      createdAt: Date | null;
      placa: string;
      marca: string | null;
      modelo: string | null;
    }[] = [];

    if (vehiculoIds.length > 0) {
      ordersList = await db
        .select({
          id: ordenes.id,
          nroTicket: ordenes.nroTicket,
          estado: ordenes.estado,
          total: ordenes.total,
          createdAt: ordenes.createdAt,
          placa: vehiculos.placa,
          marca: vehiculos.marca,
          modelo: vehiculos.modelo,
        })
        .from(ordenes)
        .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
        .where(and(eq(ordenes.sucursalId, sucursalId), inArray(ordenes.vehiculoId, vehiculoIds)))
        .orderBy(desc(ordenes.createdAt));
    }

    return {
      vehiculos: clienteVehiculos,
      puntos: puntosLogs,
      ordenes: ordersList,
    };
  } catch (error) {
    console.error("Error al obtener historial del cliente:", error);
    return null;
  }
}

// Registrar un ajuste manual de puntos de lealtad
export async function ajustarPuntosCliente(data: {
  clienteId: string;
  puntos: number;
  tipo: "ganado" | "canjeado" | "ajuste";
  descripcion: string;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "editar" });
    const sucursalId = session.user.sucursalId!;

    const [cliente] = await db
      .select({ id: clientes.id })
      .from(clientes)
      .where(and(eq(clientes.id, data.clienteId), eq(clientes.sucursalId, sucursalId)));

    if (!cliente) {
      throw new Error("Cliente no encontrado.");
    }

    const [newLog] = await db
      .insert(puntosFidelidad)
      .values({
        clienteId: data.clienteId,
        puntos: data.puntos,
        tipo: data.tipo,
        descripcion: data.descripcion,
      })
      .returning();

    revalidateTag("clientes", { expire: 600 });
    revalidatePath("/clientes");
    return { success: true, data: newLog };
  } catch (error: unknown) {
    console.error("Error al ajustar puntos:", error);
    return { success: false, error: getErrorMessage(error, "Error al ajustar puntos") };
  }
}

// Obtener los puntos de lealtad de un cliente asociado a una orden
export async function getClientePuntosByOrdenId(ordenId: string) {
  try {
    const session = await getSessionOrThrow();
    const sucursalId = session.user.sucursalId!;

    const [row] = await db
      .select({
        clienteId: clientes.id,
        nombre: clientes.nombre,
        apellido: clientes.apellido,
        totalPuntos: sql<number>`coalesce((
          select sum(${puntosFidelidad.puntos})::int
          from ${puntosFidelidad}
          where ${puntosFidelidad.clienteId} = clientes.id
        ), 0)`,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .where(and(eq(ordenes.id, ordenId), eq(clientes.sucursalId, sucursalId)))
      .limit(1);

    return row || null;
  } catch (error) {
    console.error("Error al obtener puntos del cliente por orden:", error);
    return null;
  }
}

// Exportar Directorio de Clientes y Fidelización a Excel (.xlsx) con formato corporativo
export async function exportarClientesExcelAction() {
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

    // Obtener clientes con conteo de vehículos y puntos acumulados
    const rows = await db
      .select({
        id: clientes.id,
        nombre: clientes.nombre,
        apellido: clientes.apellido,
        telefono: clientes.telefono,
        email: clientes.email,
        tipoDoc: clientes.tipoDoc,
        nroDoc: clientes.nroDoc,
        createdAt: clientes.createdAt,
        totalVehiculos: sql<number>`coalesce(count(distinct ${vehiculos.id}), 0)::int`,
        totalPuntos: sql<number>`coalesce((
          select sum(${puntosFidelidad.puntos})::int
          from ${puntosFidelidad}
          where ${puntosFidelidad.clienteId} = ${clientes.id}
        ), 0)`,
      })
      .from(clientes)
      .leftJoin(vehiculos, and(eq(vehiculos.clienteId, clientes.id), eq(vehiculos.activo, true)))
      .where(and(eq(clientes.sucursalId, sucursalId), eq(clientes.activo, true)))
      .groupBy(clientes.id)
      .orderBy(clientes.nombre);

    const wb = new ExcelJS.Workbook();
    wb.creator = "WashMaster Pro - Sistema de Car Wash";
    wb.created = new Date();

    const ws = wb.addWorksheet("Directorio de Clientes", {
      views: [{ showGridLines: true }],
    });

    const NAVY_HEADER = "0F172A";
    const PRIMARY_BLUE = "0284C7";
    const ZEBRA_ROW = "F8FAFC";
    const BORDER_COLOR = "E2E8F0";

    // 1. Banner
    ws.mergeCells("A1:J1");
    const banner = ws.getCell("A1");
    banner.value = "CAR WASH PRO PERÚ — DIRECTORIO OFICIAL DE CLIENTES & FIDELIZACIÓN";
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
      "Cliente / Titular",
      "Celular / WhatsApp",
      "Correo Electrónico",
      "Documento (DNI/RUC)",
      "Autos Registrados",
      "Puntos de Lealtad",
      "Equivalente en Soles",
      "Nivel de Cliente",
      "Fecha de Registro",
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
    rows.forEach((c, idx) => {
      const nombreCompleto = `${c.nombre} ${c.apellido || ""}`.trim();
      const puntos = c.totalPuntos || 0;
      const valorSoles = puntos * 0.20; // 1 pt = S/ 0.20

      let nivel = "Estándar";
      if (puntos >= 100) nivel = "VIP Gold";
      else if (puntos >= 50) nivel = "Silver";

      const fechaReg = c.createdAt
        ? new Date(c.createdAt).toLocaleDateString("es-PE", { timeZone: "America/Lima" })
        : "—";

      const row = ws.getRow(rowIndex);
      row.values = [
        idx + 1,
        nombreCompleto,
        c.telefono || "—",
        c.email || "—",
        c.tipoDoc && c.nroDoc ? `${c.tipoDoc}: ${c.nroDoc}` : "—",
        c.totalVehiculos,
        puntos,
        { formula: `G${rowIndex}*0.2`, result: valorSoles },
        nivel,
        fechaReg,
      ];

      row.getCell(1).alignment = { horizontal: "center" };
      row.getCell(3).alignment = { horizontal: "center" };
      row.getCell(5).alignment = { horizontal: "center" };
      row.getCell(6).alignment = { horizontal: "center" };
      row.getCell(7).alignment = { horizontal: "center" };
      row.getCell(7).numFmt = "#,##0";
      row.getCell(8).numFmt = '"S/ "#,##0.00';
      row.getCell(9).alignment = { horizontal: "center" };
      row.getCell(10).alignment = { horizontal: "center" };

      // Nivel badge coloring
      const nivelCell = row.getCell(9);
      nivelCell.font = { name: "Segoe UI", size: 9, bold: true };
      if (nivel === "VIP Gold") {
        nivelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        nivelCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FFB45309" } };
      } else if (nivel === "Silver") {
        nivelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE2E8F0" } };
        nivelCell.font = { name: "Segoe UI", size: 9, bold: true, color: { argb: "FF475569" } };
      } else {
        nivelCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
        nivelCell.font = { name: "Segoe UI", size: 9, color: { argb: "FF64748B" } };
      }

      if (idx % 2 === 1) {
        row.eachCell((cell, colNum) => {
          if (colNum !== 9) {
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
      `TOTAL CLIENTES: ${rows.length}`,
      "",
      "",
      "",
      { formula: `SUM(F5:F${rowIndex - 1})` },
      { formula: `SUM(G5:G${rowIndex - 1})` },
      { formula: `SUM(H5:H${rowIndex - 1})` },
      "",
      "",
    ];
    totalRow.height = 26;
    totalRow.getCell(2).font = { name: "Segoe UI", size: 10, bold: true, color: { argb: NAVY_HEADER } };
    totalRow.getCell(6).alignment = { horizontal: "center" };
    totalRow.getCell(6).font = { name: "Segoe UI", size: 10, bold: true };
    totalRow.getCell(7).alignment = { horizontal: "center" };
    totalRow.getCell(7).font = { name: "Segoe UI", size: 10, bold: true };
    totalRow.getCell(7).numFmt = "#,##0";
    totalRow.getCell(8).font = { name: "Segoe UI", size: 11, bold: true, color: { argb: "FF0369A1" } };
    totalRow.getCell(8).numFmt = '"S/ "#,##0.00';
    totalRow.eachCell((cell) => {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
      cell.border = {
        top: { style: "medium", color: { argb: PRIMARY_BLUE } },
        bottom: { style: "double", color: { argb: NAVY_HEADER } },
      };
    });

    ws.columns = [
      { width: 6 },
      { width: 32 },
      { width: 20 },
      { width: 28 },
      { width: 20 },
      { width: 18 },
      { width: 18 },
      { width: 22 },
      { width: 16 },
      { width: 18 },
    ];

    const buffer = await wb.xlsx.writeBuffer();
    const dateStr = new Date().toISOString().split("T")[0];

    return {
      success: true,
      base64: Buffer.from(buffer).toString("base64"),
      filename: `Directorio_Clientes_WashMaster_${dateStr}.xlsx`,
    };
  } catch (error) {
    console.error("Error al exportar clientes a Excel:", error);
    return { success: false, error: "No se pudo generar el archivo Excel de clientes." };
  }
}

// Obtener cliente por ID con ficha completa (vehículos, puntos, órdenes y estadísticas)
export async function getClienteById(clienteId: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [cliente] = await db
      .select()
      .from(clientes)
      .where(and(eq(clientes.id, clienteId), eq(clientes.sucursalId, sucursalId)));

    if (!cliente) return null;

    // 1. Obtener vehículos del cliente
    const vehiculosList = await db
      .select()
      .from(vehiculos)
      .where(and(eq(vehiculos.clienteId, clienteId), eq(vehiculos.activo, true)))
      .orderBy(vehiculos.placa);

    // 2. Obtener historial de puntos
    const puntosLogs = await db
      .select()
      .from(puntosFidelidad)
      .where(eq(puntosFidelidad.clienteId, clienteId))
      .orderBy(desc(puntosFidelidad.createdAt));

    const totalPuntos = puntosLogs.reduce((acc, p) => acc + p.puntos, 0);

    // 3. Obtener órdenes realizadas por sus vehículos
    const vehiculoIds = vehiculosList.map((v) => v.id);
    let ordersList: {
      id: string;
      nroTicket: string | null;
      estado: string;
      total: string | null;
      subtotal: string | null;
      igv: string | null;
      descuento: string | null;
      createdAt: Date | null;
      vehiculoId: string | null;
      placa: string;
      marca: string | null;
      modelo: string | null;
      tipo: string | null;
    }[] = [];

    if (vehiculoIds.length > 0) {
      ordersList = await db
        .select({
          id: ordenes.id,
          nroTicket: ordenes.nroTicket,
          estado: ordenes.estado,
          total: ordenes.total,
          subtotal: ordenes.subtotal,
          igv: ordenes.igv,
          descuento: ordenes.descuento,
          createdAt: ordenes.createdAt,
          vehiculoId: ordenes.vehiculoId,
          placa: vehiculos.placa,
          marca: vehiculos.marca,
          modelo: vehiculos.modelo,
          tipo: vehiculos.tipo,
        })
        .from(ordenes)
        .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
        .where(and(eq(ordenes.sucursalId, sucursalId), inArray(ordenes.vehiculoId, vehiculoIds)))
        .orderBy(desc(ordenes.createdAt));
    }

    const totalGastado = ordersList.reduce((acc, o) => {
      if (o.estado === "completado" || o.estado === "cobrado") {
        return acc + (o.total ? parseFloat(o.total) : 0);
      }
      return acc;
    }, 0);

    const ordenesCompletadas = ordersList.filter(
      (o) => o.estado === "completado" || o.estado === "cobrado"
    ).length;

    return {
      cliente: {
        ...cliente,
        totalPuntos,
      },
      vehiculos: vehiculosList,
      puntos: puntosLogs,
      ordenes: ordersList,
      stats: {
        totalGastado,
        totalOrdenes: ordersList.length,
        ordenesCompletadas,
        totalVehiculos: vehiculosList.length,
        totalPuntos,
        valorPuntosSoles: totalPuntos * 0.20,
      },
    };
  } catch (error) {
    console.error("Error al obtener cliente por ID:", error);
    return null;
  }
}

// Actualizar datos de un cliente
export async function updateClienteAction(data: {
  id: string;
  nombre: string;
  apellido?: string | null;
  telefono?: string | null;
  email?: string | null;
  tipoDoc?: "DNI" | "RUC" | "CE" | "PASAPORTE" | null;
  nroDoc?: string | null;
  notas?: string | null;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "clientes", accion: "editar" });
    const sucursalId = session.user.sucursalId!;

    const [updated] = await db
      .update(clientes)
      .set({
        nombre: data.nombre.trim(),
        apellido: data.apellido ? data.apellido.trim() : null,
        telefono: data.telefono ? data.telefono.trim() : null,
        email: data.email ? data.email.trim() : null,
        tipoDoc: data.tipoDoc || null,
        nroDoc: data.nroDoc ? data.nroDoc.trim() : null,
        notas: data.notas ? data.notas.trim() : null,
        updatedAt: new Date(),
      })
      .where(and(eq(clientes.id, data.id), eq(clientes.sucursalId, sucursalId)))
      .returning();

    if (!updated) {
      return { success: false, error: "Cliente no encontrado." };
    }

    revalidateTag("clientes", { expire: 600 });
    revalidatePath("/clientes");
    revalidatePath(`/clientes/${data.id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error al actualizar cliente:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar cliente") };
  }
}
