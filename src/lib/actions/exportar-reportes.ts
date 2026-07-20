"use server";

import { db } from "@/lib/db";
import { ordenes, pagos, ordenServicios } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";

function csvEscape(val: unknown): string {
  const str = String(val ?? "");
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCSV(headers: string[], rows: string[][]): string {
  const headerLine = headers.map(csvEscape).join(",");
  const bodyLines = rows.map((row) => row.map(csvEscape).join(","));
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
      csv: toCSV(headers, data),
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
      csv: toCSV(headers, data),
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
      csv: toCSV(headers, data),
      filename: `pagos-${new Date().toISOString().split("T")[0]}.csv`,
    };
  } catch (error) {
    console.error("Error al exportar pagos:", error);
    return { success: false, error: "Error al exportar pagos" };
  }
}
