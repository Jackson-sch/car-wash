"use server";

import { db } from "@/lib/db";
import { ordenes, vehiculos } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";

export interface ReservaParams {
  clienteNombre: string;
  clienteTelefono?: string;
  placa: string;
  vehiculoTipo?: string;
  fechaHora: string; // ISO string
  notas?: string;
}

export async function getReservasDelDia(fecha?: string) {
  try {
    await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });

    const targetDate = fecha || new Date().toISOString().split("T")[0];

    const result = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        placa: vehiculos.placa,
        estado: ordenes.estado,
        createdAt: ordenes.createdAt,
        total: ordenes.total,
      })
      .from(ordenes)
      .leftJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .where(sql`DATE(${ordenes.createdAt}) = ${targetDate}`)
      .orderBy(sql`${ordenes.createdAt} asc`);

    return { success: true, data: result };
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return { success: false, data: [] };
  }
}
