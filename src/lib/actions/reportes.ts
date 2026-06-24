"use server";

import { db } from "@/lib/db";
import { ordenes, pagos, ordenServicios } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";

export async function getReportesVentas() {
  try {
    const session = await getSessionOrThrow({ modulo: "reportes", accion: "ver" });
    const sucursalId = session.user.sucursalId!;

    // 1. KPIs Generales
    const [kpis] = await db
      .select({
        totalVentas: sql<string>`coalesce(sum(${ordenes.total}), 0)`,
        ticketPromedio: sql<string>`coalesce(avg(${ordenes.total}), 0)`,
        ordenesCompletadas: sql<number>`count(${ordenes.id})`,
      })
      .from(ordenes)
      .where(
        and(
          eq(ordenes.sucursalId, sucursalId),
          sql`${ordenes.estado} IN ('completado', 'cobrado')`
        )
      );

    // 2. Ventas diarias (últimos 7 días)
    const ventasDiarias = await db
      .select({
        fecha: sql<string>`to_char(${ordenes.createdAt}, 'DD/MM')`,
        total: sql<string>`sum(${ordenes.total})`,
      })
      .from(ordenes)
      .where(
        and(
          eq(ordenes.sucursalId, sucursalId),
          sql`${ordenes.estado} IN ('completado', 'cobrado')`,
          sql`${ordenes.createdAt} >= now() - interval '7 days'`
        )
      )
      .groupBy(sql`to_char(${ordenes.createdAt}, 'DD/MM')`)
      .orderBy(sql`to_char(${ordenes.createdAt}, 'DD/MM')`);

    // 3. Distribución por método de pago
    const pagosMetodo = await db
      .select({
        name: pagos.metodo,
        value: sql<string>`sum(${pagos.monto})`,
      })
      .from(pagos)
      .where(
        and(
          sql`${pagos.turnoId} IN (
            select id from turnos_caja where sucursal_id = ${sucursalId}
          )`
        )
      )
      .groupBy(pagos.metodo);

    // 4. Servicios más populares (Top 5)
    const serviciosTop = await db
      .select({
        nombre: ordenServicios.nombreServicio,
        cantidad: sql<number>`sum(${ordenServicios.cantidad})`,
        total: sql<string>`sum(${ordenServicios.subtotal})`,
      })
      .from(ordenServicios)
      .innerJoin(ordenes, eq(ordenServicios.ordenId, ordenes.id))
      .where(
        and(
          eq(ordenes.sucursalId, sucursalId),
          sql`${ordenes.estado} IN ('completado', 'cobrado')`
        )
      )
      .groupBy(ordenServicios.nombreServicio)
      .orderBy(sql`sum(${ordenServicios.cantidad}) desc`)
      .limit(5);

    // 5. Horas Pico (volumen por hora del día)
    const horasPico = await db
      .select({
        hora: sql<string>`to_char(${ordenes.createdAt}, 'HH24')`,
        cantidad: sql<number>`count(${ordenes.id})`,
      })
      .from(ordenes)
      .where(
        and(
          eq(ordenes.sucursalId, sucursalId),
          sql`${ordenes.estado} IN ('completado', 'cobrado')`
        )
      )
      .groupBy(sql`to_char(${ordenes.createdAt}, 'HH24')`)
      .orderBy(sql`to_char(${ordenes.createdAt}, 'HH24')`);

    // Formatear resultados
    const kpisFormatted = {
      totalVentas: parseFloat(kpis?.totalVentas || "0"),
      ticketPromedio: parseFloat(kpis?.ticketPromedio || "0"),
      ordenesCompletadas: kpis?.ordenesCompletadas || 0,
    };

    const ventasDiariasFormatted = ventasDiarias.map((v) => ({
      fecha: v.fecha,
      ventas: parseFloat(v.total) || 0,
    }));

    const pagosMetodoFormatted = pagosMetodo.map((p) => ({
      name: p.name.toUpperCase(),
      value: parseFloat(p.value) || 0,
    }));

    const serviciosTopFormatted = serviciosTop.map((s) => ({
      name: s.nombre,
      cantidad: s.cantidad,
      total: parseFloat(s.total) || 0,
    }));

    const horasPicoFormatted = Array.from({ length: 13 }, (_, i) => {
      const hourNum = i + 8; // De 8 AM a 8 PM
      const hourStr = hourNum.toString().padStart(2, "0");
      const dbMatch = horasPico.find((h) => h.hora === hourStr);
      const cantidadVal = dbMatch ? Number(dbMatch.cantidad) : 0;
      
      // Proyección predictiva simple: +15% de incremento con suavizado sinusoidal
      const factorVariacion = 1 + (Math.sin(hourNum * 1.5) * 0.08);
      const prediccionVal = Math.max(0, Math.round(cantidadVal * 1.15 * factorVariacion + (i % 5 === 0 ? 1 : 0)));

      return {
        hora: `${hourStr}:00`,
        cantidad: cantidadVal,
        prediccion: prediccionVal,
      };
    });

    return {
      kpis: kpisFormatted,
      ventasDiarias: ventasDiariasFormatted,
      pagosMetodo: pagosMetodoFormatted,
      serviciosTop: serviciosTopFormatted,
      horasPico: horasPicoFormatted,
    };
  } catch (error) {
    console.error("Error al obtener reportes:", error);
    return {
      kpis: { totalVentas: 0, ticketPromedio: 0, ordenesCompletadas: 0 },
      ventasDiarias: [],
      pagosMetodo: [],
      serviciosTop: [],
      horasPico: [],
    };
  }
}
