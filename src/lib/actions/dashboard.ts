"use server";

import { db } from "@/lib/db";
import {
  pagos,
  ordenes,
  vehiculos,
  usuarios,
  inventario,
  turnosCaja,
  ordenServicios,
  sucursales,
} from "@/lib/db/schema";
import { sql, eq, and, gte, lte, or, desc, asc, inArray } from "drizzle-orm";
import { getSessionOrThrow } from "./servicios";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface DashboardKpis {
  ventasHoy: number;
  ordenesActivas: number;
  ordenesEnProceso: number;
  ordenesEnEspera: number;
  ticketPromedio: number;
  insumosBajoStock: number;
}

export interface SalesTrendPoint {
  day: string;
  ventas: number;
}

export interface OrdenEnCola {
  ticket: string;
  placa: string;
  vehiculo: string;
  servicios: string[];
  empleado: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  total: number;
  hora: string;
}

export interface TurnoActivoData {
  id: string;
  montoInicial: string;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  totalVentasEfectivo: number;
  totalVentasEstimado: number;
}

export interface SucursalInfo {
  id: string;
  nombre: string;
}

export interface SucursalResumen {
  id: string;
  nombre: string;
  ventasHoy: number;
  ordenesActivas: number;
  ticketPromedio: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  salesTrendData: SalesTrendPoint[];
  ordenesEnCola: OrdenEnCola[];
  turnoActivo: TurnoActivoData | null;
  sucursalesResumen?: SucursalResumen[];
  sucursales?: SucursalInfo[];
  currentBranch?: SucursalInfo | null;
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

async function getEmpresaBranches(empresaId: string): Promise<{ id: string; nombre: string }[]> {
  return await db
    .select({ id: sucursales.id, nombre: sucursales.nombre })
    .from(sucursales)
    .where(and(eq(sucursales.empresaId, empresaId), eq(sucursales.activa, true)));
}

// ─── Main fetcher ───────────────────────────────────────────────────────────────

async function getDashboardData(
  vistaInput: "todas" | "sucursal" = "sucursal"
): Promise<DashboardData> {
  const session = await getSessionOrThrow();
  const userSucursalId = session.user?.sucursalId;
  const empresaId = session.user?.empresaId;
  const userRol = session.user?.rol;

  const vista = (userRol !== "admin" && userRol !== "superadmin") ? "sucursal" : vistaInput;

  let targetSucursalId: string | null = null;
  let branchIds: string[] = [];

  if (vista === "todas") {
    if (userRol === "superadmin") {
      const allBranches = await db
        .select({ id: sucursales.id, nombre: sucursales.nombre })
        .from(sucursales)
        .where(eq(sucursales.activa, true));
      branchIds = allBranches.map((b) => b.id);
    } else if (empresaId) {
      const empresaBranches = await getEmpresaBranches(empresaId);
      branchIds = empresaBranches.map((b) => b.id);
    }
  } else {
    targetSucursalId = userSucursalId ?? null;
  }

  const sucursalFilter = vista === "sucursal" && targetSucursalId
    ? eq(ordenes.sucursalId, targetSucursalId)
    : branchIds.length > 0
      ? inArray(ordenes.sucursalId, branchIds)
      : sql`TRUE`;

  const inventoryFilter = vista === "sucursal" && targetSucursalId
    ? eq(inventario.sucursalId, targetSucursalId)
    : branchIds.length > 0
      ? inArray(inventario.sucursalId, branchIds)
      : sql`TRUE`;

  const shiftFilter = vista === "sucursal" && targetSucursalId
    ? eq(turnosCaja.sucursalId, targetSucursalId)
    : branchIds.length > 0
      ? inArray(turnosCaja.sucursalId, branchIds)
      : sql`TRUE`;

  if (!targetSucursalId && branchIds.length === 0) {
    if (!userSucursalId) {
      throw new Error("No se encontró información de la sucursal asociada a su cuenta.");
    }
    targetSucursalId = userSucursalId;
  }

  // ── Date boundaries ─────────────────────────────────────────────────────────
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);

  // ── 0. Branch info ──────────────────────────────────────────────────────────
  let sucursalesInfo: SucursalInfo[] = [];
  let currentBranch: SucursalInfo | null = null;

  if (vista === "todas") {
    if (userRol === "superadmin") {
      const allBranches = await db
        .select({ id: sucursales.id, nombre: sucursales.nombre })
        .from(sucursales)
        .where(eq(sucursales.activa, true));
      sucursalesInfo = allBranches;
    } else if (empresaId) {
      sucursalesInfo = await getEmpresaBranches(empresaId);
    }
  } else if (userSucursalId) {
    const [branch] = await db
      .select({ id: sucursales.id, nombre: sucursales.nombre })
      .from(sucursales)
      .where(eq(sucursales.id, userSucursalId))
      .limit(1);
    if (branch) {
      sucursalesInfo = [branch];
      currentBranch = branch;
    }
  }

  // ── 1. KPIs de hoy ─────────────────────────────────────────────────────────

  // Ventas de hoy
  const [pagosResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${pagos.monto}), 0)` })
    .from(pagos)
    .innerJoin(ordenes, eq(pagos.ordenId, ordenes.id))
    .where(
      and(
        sucursalFilter,
        gte(pagos.createdAt, todayStart),
        lte(pagos.createdAt, todayEnd)
      )
    );
  const ventasHoy = Number(pagosResult?.total || 0);

  // Órdenes activas (En Proceso + En Espera)
  const [activeResult] = await db
    .select({
      total: sql<number>`count(*)`,
      enProceso: sql<number>`count(case when ${ordenes.estado} = 'en_proceso' then 1 end)`,
      pendiente: sql<number>`count(case when ${ordenes.estado} = 'pendiente' then 1 end)`,
    })
    .from(ordenes)
    .where(
      and(
        sucursalFilter,
        or(eq(ordenes.estado, "pendiente"), eq(ordenes.estado, "en_proceso"))
      )
    );
  const ordenesActivas = Number(activeResult?.total || 0);
  const ordenesEnProceso = Number(activeResult?.enProceso || 0);
  const ordenesEnEspera = Number(activeResult?.pendiente || 0);

  // Ticket Promedio (Órdenes Cobradas o Completadas)
  const [avgResult] = await db
    .select({ avg: sql<number>`COALESCE(AVG(${ordenes.total}), 0)` })
    .from(ordenes)
    .where(
      and(
        sucursalFilter,
        or(eq(ordenes.estado, "cobrado"), eq(ordenes.estado, "completado"))
      )
    );
  const ticketPromedio = Number(avgResult?.avg || 0);

  // Alertas de insumos bajo stock mínimo
  const [stockResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(inventario)
    .where(
      and(
        inventoryFilter,
        eq(inventario.activo, true),
        sql`${inventario.stock} <= ${inventario.stockMinimo}`
      )
    );
  const insumosBajoStock = Number(stockResult?.count || 0);

  // ── 2. Gráfico de tendencia de ingresos semanal ────────────────────────────
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const trendResult = await db
    .select({
      dia: sql<string>`TO_CHAR(${pagos.createdAt}, 'DD/MM')`,
      diaSemana: sql<string>`TO_CHAR(${pagos.createdAt}, 'Day')`,
      total: sql<number>`SUM(${pagos.monto})`,
    })
    .from(pagos)
    .innerJoin(ordenes, eq(pagos.ordenId, ordenes.id))
    .where(
      and(
        sucursalFilter,
        gte(pagos.createdAt, sevenDaysAgo)
      )
    )
    .groupBy(
      sql`TO_CHAR(${pagos.createdAt}, 'YYYY-MM-DD')`,
      sql`TO_CHAR(${pagos.createdAt}, 'DD/MM')`,
      sql`TO_CHAR(${pagos.createdAt}, 'Day')`
    )
    .orderBy(sql`TO_CHAR(${pagos.createdAt}, 'YYYY-MM-DD')`);

  const salesTrendData: SalesTrendPoint[] = trendResult.map((r) => {
    const cleanDay = r.diaSemana.trim().toLowerCase();
    let label = r.dia;
    if (cleanDay.includes("mon") || cleanDay.includes("lun")) label = "Lunes";
    else if (cleanDay.includes("tue") || cleanDay.includes("mar")) label = "Martes";
    else if (cleanDay.includes("wed") || cleanDay.includes("mie")) label = "Miércoles";
    else if (cleanDay.includes("thu") || cleanDay.includes("jue")) label = "Jueves";
    else if (cleanDay.includes("fri") || cleanDay.includes("vie")) label = "Viernes";
    else if (cleanDay.includes("sat") || cleanDay.includes("sab")) label = "Sábado";
    else if (cleanDay.includes("sun") || cleanDay.includes("dom")) label = "Domingo";

    return {
      day: label,
      ventas: Number(r.total || 0),
    };
  });

  const finalTrendData =
    salesTrendData.length > 0
      ? salesTrendData
      : [
          { day: "Lunes", ventas: 0 },
          { day: "Martes", ventas: 0 },
          { day: "Miércoles", ventas: 0 },
          { day: "Jueves", ventas: 0 },
          { day: "Viernes", ventas: 0 },
          { day: "Sábado", ventas: 0 },
          { day: "Domingo", ventas: 0 },
        ];

  // ── 3. Cola de Órdenes en Patio ────────────────────────────────────────────
  const colaResult = await db
    .select({
      id: ordenes.id,
      sucursalId: ordenes.sucursalId,
      nroTicket: ordenes.nroTicket,
      placa: vehiculos.placa,
      marca: vehiculos.marca,
      modelo: vehiculos.modelo,
      color: vehiculos.color,
      tipo: vehiculos.tipo,
      empleadoNombre: usuarios.nombre,
      empleadoApellido: usuarios.apellido,
      estado: ordenes.estado,
      total: ordenes.total,
      createdAt: ordenes.createdAt,
    })
    .from(ordenes)
    .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
    .leftJoin(usuarios, eq(ordenes.empleadoId, usuarios.id))
    .where(
      and(
        sucursalFilter,
        or(eq(ordenes.estado, "pendiente"), eq(ordenes.estado, "en_proceso"))
      )
    )
    .orderBy(desc(ordenes.prioridad), asc(ordenes.createdAt))
    .limit(10);

  const activeOrdersIds = colaResult.map((o) => o.id);
  const servicesByOrder: Record<string, string[]> = {};

  if (activeOrdersIds.length > 0) {
    const servicesResult = await db
      .select({
        ordenId: ordenServicios.ordenId,
        nombreServicio: ordenServicios.nombreServicio,
      })
      .from(ordenServicios)
      .where(inArray(ordenServicios.ordenId, activeOrdersIds));

    servicesResult.forEach((s) => {
      if (!servicesByOrder[s.ordenId]) {
        servicesByOrder[s.ordenId] = [];
      }
      servicesByOrder[s.ordenId].push(s.nombreServicio);
    });
  }

  const nowMs = todayEnd.getTime();
  const ordenesEnCola: OrdenEnCola[] = colaResult.map((o) => {
    const createdAtMs = o.createdAt?.getTime() ?? nowMs;
    const minsAgo = Math.max(1, Math.floor((nowMs - createdAtMs) / 60000));
    const hora =
      minsAgo < 60 ? `Hace ${minsAgo} min` : `Hace ${Math.floor(minsAgo / 60)} h`;

    return {
      ticket: o.nroTicket || "S/T",
      placa: o.placa,
      vehiculo: `${o.marca || ""} ${o.modelo || ""} (${o.color || ""})`.trim(),
      servicios: servicesByOrder[o.id] || [],
      empleado: o.empleadoNombre
        ? `${o.empleadoNombre} ${o.empleadoApellido || ""}`
        : "Sin Asignar",
      estado: o.estado as OrdenEnCola["estado"],
      total: Number(o.total || 0),
      hora,
    };
  });

  // ── 4. Turno de Caja Activo ────────────────────────────────────────────────
  const [activeShift] = await db
    .select({
      id: turnosCaja.id,
      sucursalId: turnosCaja.sucursalId,
      montoInicial: turnosCaja.montoInicial,
      nombreEmpleado: usuarios.nombre,
      apellidoEmpleado: usuarios.apellido,
    })
    .from(turnosCaja)
    .innerJoin(usuarios, eq(turnosCaja.empleadoId, usuarios.id))
    .where(
      and(
        shiftFilter,
        sql`${turnosCaja.cierre} IS NULL`
      )
    )
    .limit(1);

  let turnoActivo: TurnoActivoData | null = null;
  if (activeShift) {
    const [[cashVentasResult], [totalVentasResult]] = await Promise.all([
      db
        .select({ total: sql<number>`COALESCE(SUM(${pagos.monto}), 0)` })
        .from(pagos)
        .where(
          and(eq(pagos.turnoId, activeShift.id), eq(pagos.metodo, "efectivo"))
        ),
      db
        .select({ total: sql<number>`COALESCE(SUM(${pagos.monto}), 0)` })
        .from(pagos)
        .where(eq(pagos.turnoId, activeShift.id)),
    ]);

    turnoActivo = {
      id: activeShift.id,
      montoInicial: activeShift.montoInicial ?? "0",
      nombreEmpleado: activeShift.nombreEmpleado ?? "Desconocido",
      apellidoEmpleado: activeShift.apellidoEmpleado,
      totalVentasEfectivo: Number(cashVentasResult?.total || 0),
      totalVentasEstimado: Number(totalVentasResult?.total || 0),
    };
  }

  // ── 5. Sucursales Resumen (solo para vista "todas") ────────────────────────
  let sucursalesResumen: SucursalResumen[] | undefined;

  if (vista === "todas" && sucursalesInfo.length > 1) {
    const perBranchData = await Promise.all(
      sucursalesInfo.map(async (b) => {
        const branchFilter = eq(ordenes.sucursalId, b.id);

        const [ventasResult, activeResult, avgResult] = await Promise.all([
          db
            .select({ total: sql<number>`COALESCE(SUM(${pagos.monto}), 0)` })
            .from(pagos)
            .innerJoin(ordenes, eq(pagos.ordenId, ordenes.id))
            .where(
              and(
                branchFilter,
                gte(pagos.createdAt, todayStart),
                lte(pagos.createdAt, todayEnd)
              )
            ),
          db
            .select({ total: sql<number>`count(*)` })
            .from(ordenes)
            .where(
              and(
                branchFilter,
                or(eq(ordenes.estado, "pendiente"), eq(ordenes.estado, "en_proceso"))
              )
            ),
          db
            .select({ avg: sql<number>`COALESCE(AVG(${ordenes.total}), 0)` })
            .from(ordenes)
            .where(
              and(
                branchFilter,
                or(eq(ordenes.estado, "cobrado"), eq(ordenes.estado, "completado"))
              )
            ),
        ]);
        const [branchVentas] = ventasResult;
        const [branchActive] = activeResult;
        const [branchAvg] = avgResult;

        return {
          id: b.id,
          nombre: b.nombre,
          ventasHoy: Number(branchVentas?.total || 0),
          ordenesActivas: Number(branchActive?.total || 0),
          ticketPromedio: Number(branchAvg?.avg || 0),
        };
      })
    );
    sucursalesResumen = perBranchData;
  }

  return {
    kpis: {
      ventasHoy,
      ordenesActivas,
      ordenesEnProceso,
      ordenesEnEspera,
      ticketPromedio,
      insumosBajoStock,
    },
    salesTrendData: finalTrendData,
    ordenesEnCola,
    turnoActivo,
    sucursalesResumen,
    sucursales: vista === "todas" ? sucursalesInfo : undefined,
    currentBranch: vista === "sucursal" ? currentBranch : undefined,
  };
}
