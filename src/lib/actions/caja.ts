"use server";

import { db } from "@/lib/db";
import { turnosCaja, pagos, usuarios, ordenes, vehiculos, categoriasServicio, servicios, ordenServicios, cuponesUsos, cuentas, puntosFidelidad, egresosCaja } from "@/lib/db/schema";
import { eq, and, desc, sql, or } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath, revalidateTag } from "next/cache";
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

    // Obtener ventas por categoría de servicio en este turno (solo de órdenes cobradas)
    const categoryStats = await db
      .select({
        categoria: categoriasServicio.nombre,
        total: sql<string>`sum(${ordenServicios.subtotal})`,
      })
      .from(ordenServicios)
      .innerJoin(servicios, eq(ordenServicios.servicioId, servicios.id))
      .innerJoin(categoriasServicio, eq(servicios.categoriaId, categoriasServicio.id))
      .innerJoin(ordenes, eq(ordenServicios.ordenId, ordenes.id))
      .where(
        and(
          eq(ordenes.turnoId, activeTurno.id),
          eq(ordenes.estado, "cobrado")
        )
      )
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
      .groupBy(pagos.id, pagos.monto, pagos.metodo, pagos.createdAt, ordenes.nroTicket)
      .orderBy(desc(pagos.createdAt));

    const transaccionesDetalladas = txns.map((t) => ({
      id: t.id,
      monto: parseFloat(t.monto) || 0,
      metodo: t.metodo as "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro",
      createdAt: t.createdAt || new Date(),
      nroTicket: t.nroTicket,
      servicios: t.serviciosConcat || "Servicio General",
    }));

    // Obtener egresos registrados en este turno
    const egresosList = await db
      .select({
        id: egresosCaja.id,
        monto: egresosCaja.monto,
        motivo: egresosCaja.motivo,
        categoria: egresosCaja.categoria,
        comprobanteNum: egresosCaja.comprobanteNum,
        createdAt: egresosCaja.createdAt,
        registradoPor: usuarios.nombre,
      })
      .from(egresosCaja)
      .leftJoin(usuarios, eq(egresosCaja.registradoPorId, usuarios.id))
      .where(eq(egresosCaja.turnoId, activeTurno.id))
      .orderBy(desc(egresosCaja.createdAt));

    const totalEgresos = egresosList.reduce(
      (sum, e) => sum + (parseFloat(e.monto) || 0),
      0
    );

    return {
      ...activeTurno,
      pagos: pagosTurno.map((p) => ({
        metodo: p.metodo,
        total: parseFloat(p.total) || 0,
      })),
      ventasPorCategoria,
      ventasPorHora,
      transaccionesDetalladas,
      totalEgresos,
      egresosList: egresosList.map((e) => ({
        ...e,
        monto: parseFloat(e.monto) || 0,
      })),
    };
  } catch (error) {
    console.error("Error al obtener turno activo:", error);
    return null;
  }
}

// Obtener detalles detallados para el cierre de caja
export async function getDetalleCierreCaja() {
  try {
    await getSessionOrThrow({ modulo: "caja", accion: "cerrar" });

    // 1. Obtener turno activo
    const turno = await getTurnoActivo();
    if (!turno) return null;

    // 2. Calcular estadísticas del resumen operativo (solo órdenes cobradas/pagadas)
    const [resumenStats] = await db
      .select({
        totalServicios: sql<string>`count(${ordenes.id})`,
        ventasBrutas: sql<string>`sum(${ordenes.subtotal})`,
        descuentos: sql<string>`sum(${ordenes.descuento})`,
        ingresosNetos: sql<string>`sum(${ordenes.total})`,
      })
      .from(ordenes)
      .where(
        and(
          eq(ordenes.turnoId, turno.id),
          eq(ordenes.estado, "cobrado")
        )
      );

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

    revalidateTag("caja", { expire: 300 });
    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/caja");
    revalidatePath("/dashboard");
    return { success: true, data: newTurno };
  } catch (error: unknown) {
    console.error("Error al abrir caja:", error);
    return { success: false, error: getErrorMessage(error, "Error al abrir la caja") };
  }
}

// Registrar un pago asociado al turno de caja actual
async function _registrarPago(ordenId: string, metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro", monto: string, referencia?: string) {
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
  puntosACanjear?: number;
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

    // Obtener detalles de la orden para validación y cálculos
    const [orden] = await db
      .select({
        total: ordenes.total,
        descuento: ordenes.descuento,
        nroTicket: ordenes.nroTicket,
        vehiculoId: ordenes.vehiculoId,
      })
      .from(ordenes)
      .where(eq(ordenes.id, data.ordenId))
      .limit(1);

    if (!orden) {
      throw new Error("Orden no encontrada.");
    }

    // Buscar cliente asociado al vehículo de la orden
    const [vehiculo] = await db
      .select({ clienteId: vehiculos.clienteId })
      .from(vehiculos)
      .where(eq(vehiculos.id, orden.vehiculoId))
      .limit(1);

    const clienteId = vehiculo?.clienteId;
    let totalActualizado = parseFloat(orden.total || "0");
    let descuentoActualizado = parseFloat(orden.descuento || "0");

    // 2. Procesar Canje de Puntos de Fidelidad
    if (data.puntosACanjear && data.puntosACanjear > 0 && clienteId) {
      const [puntosRow] = await db
        .select({
          totalPuntos: sql<number>`coalesce(sum(${puntosFidelidad.puntos})::int, 0)`,
        })
        .from(puntosFidelidad)
        .where(eq(puntosFidelidad.clienteId, clienteId));

      const totalPuntos = puntosRow?.totalPuntos || 0;
      if (totalPuntos < data.puntosACanjear) {
        throw new Error(`El cliente no cuenta con saldo de puntos suficiente (disponible: ${totalPuntos}, requerido: ${data.puntosACanjear}).`);
      }

      // Calcular descuento (S/ 0.20 por punto)
      const descuentoPuntos = data.puntosACanjear * 0.20;

      // Registrar débito de puntos
      await db.insert(puntosFidelidad).values({
        clienteId,
        ordenId: data.ordenId,
        puntos: -data.puntosACanjear,
        tipo: "canjeado",
        descripcion: `Canje de ${data.puntosACanjear} puntos por descuento de S/ ${descuentoPuntos.toFixed(2)} en orden ${orden.nroTicket || ""}`,
      });

      descuentoActualizado += descuentoPuntos;
      totalActualizado = Math.max(0, totalActualizado - descuentoPuntos);
    }

    // 3. Registrar Puntos Ganados por consumo (S/ 10 = 1 punto)
    if (clienteId && totalActualizado > 0) {
      const puntosGanados = Math.floor(totalActualizado / 10);
      if (puntosGanados > 0) {
        await db.insert(puntosFidelidad).values({
          clienteId,
          ordenId: data.ordenId,
          puntos: puntosGanados,
          tipo: "ganado",
          descripcion: `Puntos ganados por consumo en orden ${orden.nroTicket || ""}`,
        });
      }
    }

    // 4. Insertar registro en la tabla de pagos con el monto neto final
    const [newPago] = await db
      .insert(pagos)
      .values({
        ordenId: data.ordenId,
        turnoId: activeTurno.id,
        metodo: data.metodo,
        monto: totalActualizado.toFixed(2),
        referencia: data.referencia || null,
        cajeroId,
      })
      .returning();

    // 5. Actualizar la orden a 'cobrado', su descuento y su total neto
    await db
      .update(ordenes)
      .set({
        estado: "cobrado",
        turnoId: activeTurno.id,
        descuento: descuentoActualizado.toFixed(2),
        total: totalActualizado.toFixed(2),
        updatedAt: new Date(),
      })
      .where(and(eq(ordenes.id, data.ordenId), eq(ordenes.sucursalId, sucursalId)));

    // 6. Registrar uso del cupón si aplica
    if (data.cuponId && clienteId) {
      await db.insert(cuponesUsos).values({
        cuponId: data.cuponId,
        clienteId,
        ordenId: data.ordenId,
      });
    }

    revalidateTag("caja", { expire: 300 });
    revalidateTag("dashboard", { expire: 300 });
    revalidatePath("/caja");
    revalidatePath("/ordenes");
    revalidatePath("/dashboard");
    revalidatePath("/clientes");

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

    revalidateTag("caja", { expire: 300 });
    revalidateTag("dashboard", { expire: 300 });
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

// Verificar autorización de supervisor para cierres descuadrados
export async function verificarAutorizacionSupervisor(email: string, contrasena: string) {
  try {
    // Validar sesión antes de proceder
    await getSessionOrThrow();

    // 1. Buscar al usuario por email
    const [user] = await db
      .select({
        id: usuarios.id,
        nombre: usuarios.nombre,
        apellido: usuarios.apellido,
        rol: usuarios.rol,
        activo: usuarios.activo,
      })
      .from(usuarios)
      .where(eq(usuarios.email, email))
      .limit(1);

    if (!user) {
      return { success: false, error: "Usuario no encontrado." };
    }

    if (!user.activo) {
      return { success: false, error: "La cuenta del supervisor está desactivada." };
    }

    // 2. Verificar que tenga rol de supervisor o superior
    const rolesAutorizados = ["supervisor", "admin", "superadmin"];
    if (!rolesAutorizados.includes(user.rol)) {
      return { success: false, error: "El usuario no tiene privilegios de supervisor." };
    }

    // 3. Obtener el hash de la contraseña de la tabla cuentas
    const [account] = await db
      .select({
        password: cuentas.password,
      })
      .from(cuentas)
      .where(
        and(
          eq(cuentas.userId, user.id),
          or(
            eq(cuentas.providerId, "email"),
            eq(cuentas.providerId, "credential")
          )
        )
      )
      .limit(1);

    if (!account || !account.password) {
      return { success: false, error: "El usuario no cuenta con una contraseña local registrada." };
    }

    // 4. Importar verifyPassword de forma dinámica para evitar problemas en SSR
    const { verifyPassword } = await import("better-auth/crypto");

    // 5. Comparar contraseñas
    const match = await verifyPassword({
      hash: account.password,
      password: contrasena,
    });

    if (!match) {
      return { success: false, error: "Contraseña incorrecta." };
    }

    const nombreCompleto = `${user.nombre} ${user.apellido || ""}`.trim();
    return { 
      success: true, 
      supervisor: { 
        id: user.id, 
        nombre: nombreCompleto, 
        email: email,
        rol: user.rol
      } 
    };
  } catch (error) {
    console.error("Error al verificar autorización de supervisor:", error);
    return { success: false, error: getErrorMessage(error) };
  }
}

// Registrar salida de dinero / egreso de caja chica
export async function registrarEgresoCaja(data: {
  monto: string;
  motivo: string;
  categoria?: string;
  comprobanteNum?: string;
}) {
  try {
    const session = await getSessionOrThrow({ modulo: "caja", accion: "abrir" });
    const sucursalId = session.user.sucursalId!;
    const montoNum = parseFloat(data.monto);

    if (isNaN(montoNum) || montoNum <= 0) {
      return { success: false, error: "El monto del egreso debe ser mayor a S/ 0.00" };
    }
    if (!data.motivo.trim()) {
      return { success: false, error: "Por favor especifique el motivo del egreso." };
    }

    const turno = await getTurnoActivo();
    if (!turno) {
      return { success: false, error: "No hay un turno de caja abierto en esta sucursal." };
    }

    const [nuevoEgreso] = await db
      .insert(egresosCaja)
      .values({
        sucursalId,
        turnoId: turno.id,
        monto: data.monto,
        motivo: data.motivo.trim(),
        categoria: data.categoria || "otro",
        comprobanteNum: data.comprobanteNum?.trim() || null,
        registradoPorId: session.user.id,
      })
      .returning();

    revalidatePath("/caja");
    revalidatePath("/caja/cierre");
    revalidatePath("/dashboard");
    revalidateTag("caja", { expire: 300 });

    return { success: true, data: nuevoEgreso };
  } catch (error) {
    return { success: false, error: getErrorMessage(error) };
  }
}
