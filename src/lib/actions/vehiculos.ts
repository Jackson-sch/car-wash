"use server";

import { db } from "@/lib/db";
import { vehiculos, clientes, ordenes, ordenServicios } from "@/lib/db/schema";
import { eq, and, desc, ilike, or, sql } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { getErrorMessage } from "./action-utils";

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
        totalOrdenes: sql<number>`
          (SELECT COUNT(*)::int FROM ${ordenes} WHERE ${ordenes.vehiculoId} = ${vehiculos.id})
        `,
      })
      .from(vehiculos)
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .where(conditions)
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
