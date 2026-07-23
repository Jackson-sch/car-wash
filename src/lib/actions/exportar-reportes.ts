"use server";

import { db } from "@/lib/db";
import { ordenes, pagos, ordenServicios } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
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

async function exportarComisionesCSV() {
  try {
    await getSessionOrThrow({ modulo: "reportes", accion: "exportar" });
    const { usuarios } = await import("@/lib/db/schema");

    const rows = await db
      .select({
        lavador: sql<string>`CONCAT(${usuarios.nombre}, ' ', COALESCE(${usuarios.apellido}, ''))`,
        totalOrdenes: sql<number>`count(${ordenes.id})`,
        totalRecaudado: sql<string>`sum(${ordenes.total})`,
        comisionEstimada: sql<string>`sum(${ordenes.total}) * 0.15`,
      })
      .from(ordenes)
      .innerJoin(usuarios, eq(ordenes.empleadoId, usuarios.id))
      .where(sql`${ordenes.estado} IN ('completado', 'cobrado')`)
      .groupBy(usuarios.id, usuarios.nombre, usuarios.apellido);

    const headers = ["Lavador / Operario", "Autos Lavados", "Total Recaudado (S/)", "Comisión Estimada (S/)"];
    const data = rows.map((r) => [
      r.lavador,
      String(r.totalOrdenes),
      parseFloat(r.totalRecaudado || "0").toFixed(2),
      parseFloat(r.comisionEstimada || "0").toFixed(2),
    ]);

    return {
      success: true,
      csv: _toCSV(headers, data),
      filename: `comisiones-lavadores-${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error) {
    console.error("Error al exportar comisiones:", error);
    return { success: false, error: "Error al exportar comisiones" };
  }
}

async function exportarMargenNetoCSV() {
  try {
    await getSessionOrThrow({ modulo: "reportes", accion: "exportar" });

    const rows = await db
      .select({
        nroTicket: ordenes.nroTicket,
        totalIngreso: ordenes.total,
        descuento: ordenes.descuento,
        comisionEstimada: sql<string>`${ordenes.total} * 0.15`,
        margenEstimado: sql<string>`${ordenes.total} * 0.85`,
        createdAt: ordenes.createdAt,
      })
      .from(ordenes)
      .where(sql`${ordenes.estado} IN ('completado', 'cobrado')`)
      .orderBy(sql`${ordenes.createdAt} desc`);

    const headers = ["Ticket", "Ingreso Total (S/)", "Descuento (S/)", "Comisión Operario (S/)", "Margen Neto (S/)", "Fecha"];
    const data = rows.map((r) => [
      r.nroTicket || "",
      parseFloat(r.totalIngreso || "0").toFixed(2),
      parseFloat(r.descuento || "0").toFixed(2),
      parseFloat(r.comisionEstimada || "0").toFixed(2),
      parseFloat(r.margenEstimado || "0").toFixed(2),
      r.createdAt ? new Date(r.createdAt).toISOString().split("T")[0] : "",
    ]);

    return {
      success: true,
      csv: _toCSV(headers, data),
      filename: `margen-neto-${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error) {
    console.error("Error al exportar margen neto:", error);
    return { success: false, error: "Error al exportar margen neto" };
  }
}


