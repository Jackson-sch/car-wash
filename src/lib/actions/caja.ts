"use server";

import { db } from "@/lib/db";
import { turnosCaja, pagos, usuarios, ordenes, vehiculos, categoriasServicio, servicios, ordenServicios, cuponesUsos } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";

// Obtener el turno de caja abierto actual de la sucursal
export async function getTurnoActivo() {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "abrir" });
    const sucursalId = session.user.sucursalId!;

    const [activeTurno] = await db
      .select({
        id: turnosCaja.id,
        empleadoId: turnosCaja.empleadoId,
        apertura: turnosCaja.apertura,
        montoInicial: turnosCaja.montoInicial,
        observaciones: turnosCaja.observaciones,
        nombreEmpleado: usuarios.nombre,
        apellidoEmpleado: usuarios.apellido,
      })
      .from(turnosCaja)
      .innerJoin(usuarios, eq(turnosCaja.empleadoId, usuarios.id))
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NULL`))
      .orderBy(desc(turnosCaja.apertura));

    if (!activeTurno) return null;

    // Obtener la suma de pagos registrados en este turno por método de pago
    const pagosTurno = await db
      .select({
        metodo: pagos.metodo,
        total: sql<string>`sum(${pagos.monto})`,
      })
      .from(pagos)
      .where(eq(pagos.turnoId, activeTurno.id))
      .groupBy(pagos.metodo);

    // Obtener ventas por categoría de servicio en este turno
    const categoryStats = await db
      .select({
        categoria: categoriasServicio.nombre,
        total: sql<string>`sum(${ordenServicios.subtotal})`,
      })
      .from(ordenServicios)
      .innerJoin(servicios, eq(ordenServicios.servicioId, servicios.id))
      .innerJoin(categoriasServicio, eq(servicios.categoriaId, categoriasServicio.id))
      .innerJoin(ordenes, eq(ordenServicios.ordenId, ordenes.id))
      .where(eq(ordenes.turnoId, activeTurno.id))
      .groupBy(categoriasServicio.nombre);

    const ventasPorCategoria = categoryStats.map((c) => ({
      categoria: c.categoria,
      total: parseFloat(c.total) || 0,
    }));

    // Obtener volumen por hora en este turno (Zona horaria Lima)
    const hourlyStats = await db
      .select({
        hora: sql<string>`to_char(${ordenes.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Lima', 'HH24')`,
        total: sql<string>`count(${ordenes.id})`,
      })
      .from(ordenes)
      .where(eq(ordenes.turnoId, activeTurno.id))
      .groupBy(sql`to_char(${ordenes.createdAt} AT TIME ZONE 'UTC' AT TIME ZONE 'America/Lima', 'HH24')`);

    const ventasPorHora = hourlyStats.map((h) => ({
      hora: h.hora + ":00",
      total: parseInt(h.total) || 0,
    })).sort((a, b) => a.hora.localeCompare(b.hora));

    // Obtener transacciones detalladas del turno
    const txns = await db
      .select({
        id: pagos.id,
        monto: pagos.monto,
        metodo: pagos.metodo,
        createdAt: pagos.createdAt,
        nroTicket: ordenes.nroTicket,
        serviciosConcat: sql<string>`string_agg(${ordenServicios.nombreServicio}, ', ')`,
      })
      .from(pagos)
      .innerJoin(ordenes, eq(pagos.ordenId, ordenes.id))
      .leftJoin(ordenServicios, eq(ordenes.id, ordenServicios.ordenId))
      .where(eq(pagos.turnoId, activeTurno.id))
      .groupBy(pagos.id, ordenes.nroTicket)
      .orderBy(desc(pagos.createdAt));

    const transaccionesDetalladas = txns.map((t) => ({
      id: t.id,
      monto: parseFloat(t.monto) || 0,
      metodo: t.metodo as "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro",
      createdAt: t.createdAt || new Date(),
      nroTicket: t.nroTicket,
      servicios: t.serviciosConcat || "Servicio General",
    }));

    return {
      ...activeTurno,
      pagos: pagosTurno.map((p) => ({
        metodo: p.metodo,
        total: parseFloat(p.total) || 0,
      })),
      ventasPorCategoria,
      ventasPorHora,
      transaccionesDetalladas,
    };
  } catch (error) {
    console.error("Error al obtener turno activo:", error);
    return null;
  }
}

// Obtener detalles detallados para el cierre de caja
export async function getDetalleCierreCaja() {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "cerrar" });
    const sucursalId = session.user.sucursalId!;

    // 1. Obtener turno activo
    const turno = await getTurnoActivo();
    if (!turno) return null;

    // 2. Calcular estadísticas del resumen operativo
    const [resumenStats] = await db
      .select({
        totalServicios: sql<string>`count(${ordenes.id})`,
        ventasBrutas: sql<string>`sum(${ordenes.subtotal})`,
        descuentos: sql<string>`sum(${ordenes.descuento})`,
        ingresosNetos: sql<string>`sum(${ordenes.total})`,
      })
      .from(ordenes)
      .where(eq(ordenes.turnoId, turno.id));

    const resumen = {
      totalServicios: parseInt(resumenStats?.totalServicios || "0") || 0,
      ventasBrutas: parseFloat(resumenStats?.ventasBrutas || "0") || 0,
      descuentos: parseFloat(resumenStats?.descuentos || "0") || 0,
      ingresosNetos: parseFloat(resumenStats?.ingresosNetos || "0") || 0,
    };

    // 3. Obtener últimos 10 pagos registrados en este turno
    const recentPagos = await db
      .select({
        id: pagos.id,
        monto: pagos.monto,
        metodo: pagos.metodo,
        createdAt: pagos.createdAt,
        nroTicket: ordenes.nroTicket,
      })
      .from(pagos)
      .innerJoin(ordenes, eq(pagos.ordenId, ordenes.id))
      .where(eq(pagos.turnoId, turno.id))
      .orderBy(desc(pagos.createdAt))
      .limit(10);

    const pagosRecientes = recentPagos.map((p) => ({
      id: p.id,
      monto: parseFloat(p.monto) || 0,
      metodo: p.metodo as "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro",
      createdAt: p.createdAt || new Date(),
      nroTicket: p.nroTicket,
    }));

    return {
      turno,
      resumen,
      pagosRecientes,
    };
  } catch (error) {
    console.error("Error al obtener detalle de cierre de caja:", error);
    return null;
  }
}


// Abrir un nuevo turno de caja
export async function abrirTurnoCaja(montoInicial: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "abrir" });
    const sucursalId = session.user.sucursalId!;
    const empleadoId = session.user.id;

    // Verificar si ya hay un turno activo
    const [existing] = await db
      .select()
      .from(turnosCaja)
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NULL`));

    if (existing) {
      throw new Error("Ya existe un turno de caja abierto para esta sucursal.");
    }

    const [newTurno] = await db
      .insert(turnosCaja)
      .values({
        sucursalId,
        empleadoId,
        montoInicial,
        apertura: new Date(),
      })
      .returning();

    revalidatePath("/caja");
    revalidatePath("/dashboard");
    return { success: true, data: newTurno };
  } catch (error: unknown) {
    console.error("Error al abrir caja:", error);
    return { success: false, error: getErrorMessage(error, "Error al abrir la caja") };
  }
}

// Registrar un pago asociado al turno de caja actual
export async function registrarPago(ordenId: string, metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro", monto: string, referencia?: string) {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "abrir" });
    const sucursalId = session.user.sucursalId!;
    const cajeroId = session.user.id;

    // Buscar turno activo
    const [activeTurno] = await db
      .select()
      .from(turnosCaja)
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NULL`));

    if (!activeTurno) {
      throw new Error("No hay un turno de caja abierto. Abra caja para procesar pagos.");
    }

    const [newPago] = await db
      .insert(pagos)
      .values({
        ordenId,
        turnoId: activeTurno.id,
        metodo,
        monto,
        referencia: referencia || null,
        cajeroId,
      })
      .returning();

    revalidatePath("/caja");
    return { success: true, data: newPago };
  } catch (error: unknown) {
    console.error("Error al registrar pago:", error);
    return { success: false, error: getErrorMessage(error, "Error al registrar el pago") };
  }
}

// Registrar un cobro de orden y actualizar su estado a 'cobrado'
export async function cobrarOrden(data: {
  ordenId: string;
  metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro";
  monto: string;
  referencia?: string;
  cuponId?: string;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "abrir" });
    const sucursalId = session.user.sucursalId!;
    const cajeroId = session.user.id;

    // 1. Buscar turno de caja activo para la sucursal
    const [activeTurno] = await db
      .select()
      .from(turnosCaja)
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NULL`))
      .orderBy(desc(turnosCaja.apertura));

    if (!activeTurno) {
      throw new Error("No hay un turno de caja abierto en esta sucursal. Abre caja antes de procesar cobros.");
    }

    // 2. Insertar registro en la tabla de pagos
    const [newPago] = await db
      .insert(pagos)
      .values({
        ordenId: data.ordenId,
        turnoId: activeTurno.id,
        metodo: data.metodo,
        monto: data.monto,
        referencia: data.referencia || null,
        cajeroId,
      })
      .returning();

    // 3. Actualizar la orden a 'cobrado' y asociar el turnoId
    await db
      .update(ordenes)
      .set({
        estado: "cobrado",
        turnoId: activeTurno.id,
        updatedAt: new Date(),
      })
      .where(and(eq(ordenes.id, data.ordenId), eq(ordenes.sucursalId, sucursalId)));

    // 4. Registrar uso del cupón si aplica
    if (data.cuponId) {
      const [vehiculo] = await db
        .select({ clienteId: vehiculos.clienteId })
        .from(ordenes)
        .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
        .where(eq(ordenes.id, data.ordenId));

      if (vehiculo?.clienteId) {
        await db.insert(cuponesUsos).values({
          cuponId: data.cuponId,
          clienteId: vehiculo.clienteId,
          ordenId: data.ordenId,
        });
      }
    }

    revalidatePath("/caja");
    revalidatePath("/ordenes");
    revalidatePath("/dashboard");

    return { success: true, data: newPago };
  } catch (error: unknown) {
    console.error("Error al cobrar orden:", error);
    return { success: false, error: getErrorMessage(error, "Error al procesar el cobro") };
  }
}

// Realizar el corte y cierre de caja
export async function cerrarTurnoCaja(data: {
  montoFinal: string;
  observaciones?: string;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "cerrar" });
    const sucursalId = session.user.sucursalId!;

    // Buscar turno activo
    const [activeTurno] = await db
      .select()
      .from(turnosCaja)
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NULL`));

    if (!activeTurno) {
      throw new Error("No hay ningún turno activo para cerrar.");
    }

    const [updated] = await db
      .update(turnosCaja)
      .set({
        cierre: new Date(),
        montoFinal: data.montoFinal,
        observaciones: data.observaciones || null,
      })
      .where(eq(turnosCaja.id, activeTurno.id))
      .returning();

    revalidatePath("/caja");
    revalidatePath("/dashboard");
    return { success: true, data: updated };
  } catch (error: unknown) {
    console.error("Error al cerrar caja:", error);
    return { success: false, error: getErrorMessage(error, "Error al cerrar la caja") };
  }
}

// Obtener historial de turnos de caja cerrados
export async function getTurnosHistorial() {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    return await db
      .select({
        id: turnosCaja.id,
        apertura: turnosCaja.apertura,
        cierre: turnosCaja.cierre,
        montoInicial: turnosCaja.montoInicial,
        montoFinal: turnosCaja.montoFinal,
        observaciones: turnosCaja.observaciones,
        nombreEmpleado: usuarios.nombre,
        apellidoEmpleado: usuarios.apellido,
      })
      .from(turnosCaja)
      .innerJoin(usuarios, eq(turnosCaja.empleadoId, usuarios.id))
      .where(and(eq(turnosCaja.sucursalId, sucursalId), sql`${turnosCaja.cierre} IS NOT NULL`))
      .orderBy(desc(turnosCaja.cierre));
  } catch (error) {
    console.error("Error al obtener historial de caja:", error);
    return [];
  }
}
