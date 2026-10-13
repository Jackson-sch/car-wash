"use server";

import { db } from "@/lib/db";
import { ordenes, vehiculos, clientes, usuarios, servicios, ordenServicios } from "@/lib/db/schema";
import { eq, sql, and, desc, inArray } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";

export interface ReservaItem {
  id: string;
  nroTicket: string | null;
  placa: string | null;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoTipo: string | null;
  clienteNombre: string | null;
  clienteApellido: string | null;
  clienteTelefono: string | null;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  prioridad: number | null;
  notas: string | null;
  createdAt: Date | string | null;
  total: string | null;
  lavadorNombre: string | null;
  lavadorApellido: string | null;
}

export interface CrearReservaInput {
  clienteNombre: string;
  clienteApellido?: string;
  clienteTelefono?: string;
  placa: string;
  vehiculoTipo?: string;
  vehiculoMarca?: string;
  vehiculoModelo?: string;
  servicioId?: string;
  fecha: string; // YYYY-MM-DD
  hora: string;  // HH:MM
  prioridad?: number;
  notas?: string;
}

export async function getReservasDelDia(fecha?: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;
    const targetDate = fecha || new Date().toISOString().split("T")[0];

    const result = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        placa: vehiculos.placa,
        vehiculoMarca: vehiculos.marca,
        vehiculoModelo: vehiculos.modelo,
        vehiculoTipo: vehiculos.tipo,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        estado: ordenes.estado,
        prioridad: ordenes.prioridad,
        notas: ordenes.notas,
        createdAt: ordenes.createdAt,
        total: ordenes.total,
        lavadorNombre: usuarios.nombre,
        lavadorApellido: usuarios.apellido,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .leftJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(usuarios, eq(ordenes.empleadoId, usuarios.id))
      .where(
        and(
          eq(ordenes.sucursalId, sucursalId),
          sql`DATE(${ordenes.createdAt}) = ${targetDate}`
        )
      )
      .orderBy(sql`${ordenes.createdAt} asc`);

    return { success: true, data: result as ReservaItem[] };
  } catch (error) {
    console.error("Error al obtener reservas:", error);
    return { success: false, data: [] };
  }
}

export async function getServiciosParaReservas() {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const list = await db
      .select({
        id: servicios.id,
        nombre: servicios.nombre,
        precio: servicios.precio,
        duracionMin: servicios.duracionMin,
      })
      .from(servicios)
      .where(and(eq(servicios.sucursalId, sucursalId), eq(servicios.activo, true)))
      .orderBy(servicios.nombre);

    return list;
  } catch (error) {
    console.error("Error al obtener servicios para reservas:", error);
    return [];
  }
}

export async function crearReservaAction(data: CrearReservaInput) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "crear" });
    const sucursalId = session.user.sucursalId!;
    const userId = session.user.id;

    const cleanPlaca = data.placa.trim().toUpperCase();
    const cleanTelefono = data.clienteTelefono?.trim() || "";

    if (!cleanPlaca || !data.clienteNombre.trim()) {
      return { success: false, error: "La placa y el nombre del cliente son obligatorios." };
    }

    // 1. Cliente: buscar o crear
    let clienteId: string;
    const [existingCliente] = cleanTelefono
      ? await db
          .select({ id: clientes.id })
          .from(clientes)
          .where(and(eq(clientes.sucursalId, sucursalId), eq(clientes.telefono, cleanTelefono)))
      : [];

    if (existingCliente) {
      clienteId = existingCliente.id;
    } else {
      const [newCliente] = await db
        .insert(clientes)
        .values({
          sucursalId,
          nombre: data.clienteNombre.trim(),
          apellido: data.clienteApellido?.trim() || null,
          telefono: cleanTelefono || null,
        })
        .returning({ id: clientes.id });
      clienteId = newCliente.id;
    }

    // 2. Vehículo: buscar o crear
    let vehiculoId: string;
    const [existingVehiculo] = await db
      .select({ id: vehiculos.id })
      .from(vehiculos)
      .where(eq(vehiculos.placa, cleanPlaca));

    if (existingVehiculo) {
      vehiculoId = existingVehiculo.id;
      // Actualizar clienteId si estaba huérfano
      await db
        .update(vehiculos)
        .set({ clienteId })
        .where(eq(vehiculos.id, vehiculoId));
    } else {
      const validTipo = (["sedan", "suv", "pickup", "moto", "camion", "furgon", "otro"].includes(data.vehiculoTipo || "")
        ? data.vehiculoTipo
        : "sedan") as "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro";

      const [newVehiculo] = await db
        .insert(vehiculos)
        .values({
          clienteId,
          placa: cleanPlaca,
          tipo: validTipo,
          marca: data.vehiculoMarca?.trim() || null,
          modelo: data.vehiculoModelo?.trim() || null,
        })
        .returning({ id: vehiculos.id });
      vehiculoId = newVehiculo.id;
    }

    // 3. Servicio (opcional)
    let totalPrecio = "0.00";
    let selectedServicio: { id: string; nombre: string; precio: string } | null = null;
    if (data.servicioId) {
      const [foundServicio] = await db
        .select({ id: servicios.id, nombre: servicios.nombre, precio: servicios.precio })
        .from(servicios)
        .where(and(eq(servicios.id, data.servicioId), eq(servicios.sucursalId, sucursalId)));
      if (foundServicio) {
        selectedServicio = foundServicio;
        totalPrecio = foundServicio.precio;
      }
    }

    // 4. Ticket correlativo
    const randomTicket = `RES-${Math.floor(1000 + Math.random() * 9000)}`;

    // Fecha y hora programada
    const scheduledDateTime = new Date(`${data.fecha}T${data.hora || "09:00"}:00`);

    // 5. Insertar orden en estado 'pendiente'
    const [newOrden] = await db
      .insert(ordenes)
      .values({
        sucursalId,
        vehiculoId,
        cajeroId: userId,
        estado: "pendiente",
        prioridad: data.prioridad ?? 0,
        subtotal: totalPrecio,
        total: totalPrecio,
        notas: data.notas ? `[CITA AGENDADA] ${data.notas}` : "[CITA AGENDADA]",
        nroTicket: randomTicket,
        createdAt: scheduledDateTime,
      })
      .returning();

    // 6. Insertar detalle de servicio si se eligió
    if (selectedServicio) {
      await db.insert(ordenServicios).values({
        ordenId: newOrden.id,
        servicioId: selectedServicio.id,
        nombreServicio: selectedServicio.nombre,
        precioUnitario: selectedServicio.precio,
        cantidad: 1,
        subtotal: selectedServicio.precio,
      });
    }

    revalidatePath("/reservas");
    revalidatePath("/ordenes");
    revalidatePath("/patio");

    return {
      success: true,
      data: {
        id: newOrden.id,
        nroTicket: newOrden.nroTicket,
        placa: cleanPlaca,
        vehiculoMarca: data.vehiculoMarca || null,
        vehiculoModelo: data.vehiculoModelo || null,
        vehiculoTipo: data.vehiculoTipo || "sedan",
        clienteNombre: data.clienteNombre,
        clienteApellido: data.clienteApellido || null,
        clienteTelefono: cleanTelefono || null,
        estado: "pendiente" as const,
        prioridad: data.prioridad ?? 0,
        notas: newOrden.notas,
        createdAt: scheduledDateTime,
        total: totalPrecio,
        lavadorNombre: null,
        lavadorApellido: null,
      },
    };
  } catch (error) {
    console.error("Error al crear reserva:", error);
    return { success: false, error: "Error al guardar la cita en el sistema." };
  }
}

export async function cambiarEstadoReservaAction(
  ordenId: string,
  nuevoEstado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado"
) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "editar" });
    const sucursalId = session.user.sucursalId!;

    await db
      .update(ordenes)
      .set({ estado: nuevoEstado, updatedAt: new Date() })
      .where(and(eq(ordenes.id, ordenId), eq(ordenes.sucursalId, sucursalId)));

    revalidatePath("/reservas");
    revalidatePath("/ordenes");
    revalidatePath("/patio");
    return { success: true };
  } catch (error) {
    console.error("Error al cambiar estado de reserva:", error);
    return { success: false, error: "No se pudo actualizar el estado de la cita." };
  }
}
