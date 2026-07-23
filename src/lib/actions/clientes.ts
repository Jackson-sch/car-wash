"use server";

import { db } from "@/lib/db";
import { clientes, vehiculos, puntosFidelidad, ordenes } from "@/lib/db/schema";
import { eq, and, desc, sql, inArray, ilike } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath, revalidateTag } from "next/cache";
import { getErrorMessage } from "./action-utils";

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
async function getClientes() {
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
export async function getClientesInactivos(diasInactividad = 30) {
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
