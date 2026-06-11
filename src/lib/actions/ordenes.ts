"use server";

import { db } from "@/lib/db";
import {
  ordenes,
  ordenServicios,
  vehiculos,
  clientes,
  usuarios,
  servicios,
  turnosCaja,
  pagos,
} from "@/lib/db/schema";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";

// Obtener todas las órdenes de la sucursal actual
export async function getOrdenes() {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const result = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        prioridad: ordenes.prioridad,
        total: ordenes.total,
        notas: ordenes.notas,
        createdAt: ordenes.createdAt,
        placa: vehiculos.placa,
        vehiculoMarca: vehiculos.marca,
        vehiculoModelo: vehiculos.modelo,
        vehiculoTipo: vehiculos.tipo,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        lavadorNombre: usuarios.nombre,
        lavadorApellido: usuarios.apellido,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(usuarios, eq(ordenes.empleadoId, usuarios.id)) // Asignado a (lavador)
      .where(eq(ordenes.sucursalId, sucursalId))
      .orderBy(desc(ordenes.createdAt));

    return result;
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    return [];
  }
}

// Obtener lista de lavadores activos de la sucursal para asignar
export async function getEmpleadosLavadores() {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "asignar" });
    const sucursalId = session.user.sucursalId!;

    return await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
      })
      .from(usuarios)
      .where(
        and(
          eq(usuarios.sucursalId, sucursalId),
          eq(usuarios.rol, "lavador"),
          eq(usuarios.activo, true)
        )
      );
  } catch (error) {
    console.error("Error al obtener lavadores:", error);
    return [];
  }
}

// Obtener una orden detallada por su ID con sus servicios
export async function getOrdenById(id: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    const [ordenDetail] = await db
      .select({
        id: ordenes.id,
        nroTicket: ordenes.nroTicket,
        estado: ordenes.estado,
        prioridad: ordenes.prioridad,
        subtotal: ordenes.subtotal,
        descuento: ordenes.descuento,
        total: ordenes.total,
        notas: ordenes.notas,
        createdAt: ordenes.createdAt,
        placa: vehiculos.placa,
        vehiculoMarca: vehiculos.marca,
        vehiculoModelo: vehiculos.modelo,
        vehiculoColor: vehiculos.color,
        vehiculoTipo: vehiculos.tipo,
        clienteId: clientes.id,
        clienteNombre: clientes.nombre,
        clienteApellido: clientes.apellido,
        clienteTelefono: clientes.telefono,
        clienteEmail: clientes.email,
        lavadorId: usuarios.id,
        lavadorNombre: usuarios.nombre,
        lavadorApellido: usuarios.apellido,
      })
      .from(ordenes)
      .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
      .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
      .leftJoin(usuarios, eq(ordenes.empleadoId, usuarios.id))
      .where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)));

    if (!ordenDetail) return null;

    // Obtener los servicios de la orden
    const serviciosAsociados = await db
      .select()
      .from(ordenServicios)
      .where(eq(ordenServicios.ordenId, id));

    return {
      ...ordenDetail,
      servicios: serviciosAsociados,
    };
  } catch (error) {
    console.error("Error al obtener detalle de orden:", error);
    return null;
  }
}

// Crear una nueva orden con cliente/vehículo on-the-fly si es necesario
export async function createOrden(data: {
  placa: string;
  vehiculoTipo: "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro";
  vehiculoMarca?: string;
  vehiculoModelo?: string;
  vehiculoColor?: string;
  clienteNombre: string;
  clienteApellido?: string;
  clienteTelefono?: string;
  clienteEmail?: string;
  serviciosSeleccionados: { id: string; precio: string; nombre: string }[];
  empleadoId?: string | null; // lavador
  notas?: string;
  prioridad?: number;
  descuento?: string;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "crear" });
    const sucursalId = session.user.sucursalId!;
    const cajeroId = session.user.id;
    const selectedServiceIds = data.serviciosSeleccionados.map((servicio) => servicio.id);

    if (selectedServiceIds.length === 0) {
      throw new Error("Seleccione al menos un servicio.");
    }

    const serviciosSucursal = await db
      .select({
        id: servicios.id,
        nombre: servicios.nombre,
        precio: servicios.precio,
      })
      .from(servicios)
      .where(
        and(
          eq(servicios.sucursalId, sucursalId),
          eq(servicios.activo, true),
          inArray(servicios.id, selectedServiceIds)
        )
      );

    if (serviciosSucursal.length !== selectedServiceIds.length) {
      throw new Error("Uno o más servicios no pertenecen a la sucursal o están inactivos.");
    }

    const serviciosPorId = new Map(serviciosSucursal.map((servicio) => [servicio.id, servicio]));

    if (data.empleadoId) {
      const [lavador] = await db
        .select({ id: usuarios.id })
        .from(usuarios)
        .where(
          and(
            eq(usuarios.id, data.empleadoId),
            eq(usuarios.sucursalId, sucursalId),
            eq(usuarios.rol, "lavador"),
            eq(usuarios.activo, true)
          )
        );

      if (!lavador) {
        throw new Error("El lavador seleccionado no pertenece a la sucursal.");
      }
    }

    // 1. Obtener o crear Cliente
    let clienteId: string;
    const cleanTelefono = data.clienteTelefono?.trim() || "";

    const [existingCliente] = await db
      .select()
      .from(clientes)
      .where(
        and(
          eq(clientes.sucursalId, sucursalId),
          cleanTelefono !== "" ? eq(clientes.telefono, cleanTelefono) : sql`false`
        )
      );

    if (existingCliente) {
      clienteId = existingCliente.id;
    } else {
      const [newCliente] = await db
        .insert(clientes)
        .values({
          sucursalId,
          nombre: data.clienteNombre,
          apellido: data.clienteApellido || null,
          telefono: cleanTelefono || null,
          email: data.clienteEmail || null,
          activo: true,
        })
        .returning();
      clienteId = newCliente.id;
    }

    // 2. Obtener o crear Vehículo
    let vehiculoId: string;
    const cleanPlaca = data.placa.trim().toUpperCase();

    const [existingVehiculo] = await db
      .select()
      .from(vehiculos)
      .where(and(eq(vehiculos.placa, cleanPlaca), eq(vehiculos.clienteId, clienteId)));

    if (existingVehiculo) {
      vehiculoId = existingVehiculo.id;
    } else {
      const [newVehiculo] = await db
        .insert(vehiculos)
        .values({
          clienteId,
          placa: cleanPlaca,
          tipo: data.vehiculoTipo,
          marca: data.vehiculoMarca || null,
          modelo: data.vehiculoModelo || null,
          color: data.vehiculoColor || null,
          activo: true,
        })
        .returning();
      vehiculoId = newVehiculo.id;
    }

    // 3. Obtener turno de caja activo para asociar la orden
    const [activeTurno] = await db
      .select()
      .from(turnosCaja)
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NULL`))
      .orderBy(desc(turnosCaja.apertura));

    // 4. Generar número de ticket correlativo del día
    const [ordenCount] = await db
      .select({ value: count() })
      .from(ordenes)
      .where(eq(ordenes.sucursalId, sucursalId));

    const nextCorrelativo = (ordenCount.value + 1).toString().padStart(4, "0");
    const nroTicket = `T-${nextCorrelativo}`;

    // 5. Calcular totales
    let subtotalNumeric = 0;
    selectedServiceIds.forEach((servicioId) => {
      const servicio = serviciosPorId.get(servicioId);
      subtotalNumeric += parseFloat(servicio?.precio || "0");
    });

    const descuentoVal = parseFloat(data.descuento || "0") || 0;
    const totalVal = Math.max(0, subtotalNumeric - descuentoVal);

    // 6. Insertar Orden
    const [newOrden] = await db
      .insert(ordenes)
      .values({
        sucursalId,
        turnoId: activeTurno?.id || null,
        vehiculoId,
        empleadoId: data.empleadoId || null,
        cajeroId,
        estado: "pendiente",
        prioridad: data.prioridad ?? 0,
        subtotal: subtotalNumeric.toString(),
        descuento: descuentoVal.toString(),
        total: totalVal.toString(),
        notas: data.notas || null,
        nroTicket,
      })
      .returning();

    // 7. Insertar Servicios Detallados de la Orden
    for (const servicioId of selectedServiceIds) {
      const servicio = serviciosPorId.get(servicioId);
      if (!servicio) continue;

      await db.insert(ordenServicios).values({
        ordenId: newOrden.id,
        servicioId,
        nombreServicio: servicio.nombre,
        precioUnitario: servicio.precio,
        cantidad: 1,
        subtotal: servicio.precio,
      });
    }

    revalidatePath("/ordenes");
    revalidatePath("/dashboard");
    return { success: true, data: newOrden };
  } catch (error: unknown) {
    console.error("Error al registrar orden:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar la orden") };
  }
}

// Actualizar el estado de lavado de una orden
export async function updateOrdenEstado(id: string, nuevoEstado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado") {
  try {
    const session = await getSessionOrThrow({
      modulo: "ordenes",
      accion: nuevoEstado === "cancelado" ? "cancelar" : "cambiarEstado",
    });
    const sucursalId = session.user.sucursalId!;

    // 1. Obtener la orden actual para verificar su estado previo
    const [existing] = await db
      .select({ estado: ordenes.estado })
      .from(ordenes)
      .where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)));

    if (existing && existing.estado === "cobrado" && nuevoEstado === "cancelado") {
      // Reconciliar en caja: borrar transacciones de pago asociadas
      await db.delete(pagos).where(eq(pagos.ordenId, id));
      console.log(`Reconciliación de caja: se eliminaron los pagos asociados a la orden cancelada ${id}`);
    }

    const [updated] = await db
      .update(ordenes)
      .set({
        estado: nuevoEstado,
        // Si se cancela, remover la asociación al turno de caja si existía
        ...(nuevoEstado === "cancelado" ? { turnoId: null } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)))
      .returning();

    revalidatePath("/ordenes");
    revalidatePath("/caja");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al actualizar estado de orden:", error);
    return { success: false, error: getErrorMessage(error, "Error al actualizar estado") };
  }
}

// Asignar lavador a una orden
export async function asignarLavadorAOrden(id: string, empleadoId: string | null) {
  try {
    const session = await getSessionOrThrow({ modulo: "ordenes", accion: "asignar" });
    const sucursalId = session.user.sucursalId!;

    if (empleadoId) {
      const [lavador] = await db
        .select({ id: usuarios.id })
        .from(usuarios)
        .where(
          and(
            eq(usuarios.id, empleadoId),
            eq(usuarios.sucursalId, sucursalId),
            eq(usuarios.rol, "lavador"),
            eq(usuarios.activo, true)
          )
        );

      if (!lavador) {
        throw new Error("El lavador seleccionado no pertenece a la sucursal.");
      }
    }

    const [updated] = await db
      .update(ordenes)
      .set({
        empleadoId: empleadoId || null,
        updatedAt: new Date(),
      })
      .where(and(eq(ordenes.id, id), eq(ordenes.sucursalId, sucursalId)))
      .returning();

    revalidatePath("/ordenes");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al asignar lavador:", error);
    return { success: false, error: getErrorMessage(error, "Error al asignar") };
  }
}
