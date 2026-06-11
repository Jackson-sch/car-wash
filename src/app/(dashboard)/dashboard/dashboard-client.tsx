"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KpiGrid } from "./components/KpiGrid";
import { SalesTrendChart } from "./components/SalesTrendChart";
import { OrdenesColaTable } from "./components/OrdenesColaTable";
import { TurnoCajaPanel } from "./components/TurnoCajaPanel";
import { DashboardViewSelector } from "./components/DashboardViewSelector";
import { BranchSummaryTable } from "./components/BranchSummaryTable";

interface OrdenCola {
  ticket: string;
  placa: string;
  vehiculo: string;
  servicios: string[];
  empleado: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  total: number;
  hora: string;
}

interface TurnoCajaSimple {
  id: string;
  montoInicial: string;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  totalVentasEfectivo: number;
  totalVentasEstimado: number;
}

interface SucursalInfo {
  id: string;
  nombre: string;
}

interface SucursalResumen {
  id: string;
  nombre: string;
  ventasHoy: number;
  ordenesActivas: number;
  ticketPromedio: number;
}

interface DashboardClientProps {
  kpis: {
    ventasHoy: number;
    ordenesActivas: number;
    ordenesEnProceso: number;
    ordenesEnEspera: number;
    ticketPromedio: number;
    insumosBajoStock: number;
  };
  salesTrendData: { day: string; ventas: number }[];
  ordenesEnCola: OrdenCola[];
  turnoActivo: TurnoCajaSimple | null;
  vista: "todas" | "sucursal";
  sucursalesResumen?: SucursalResumen[];
  sucursales?: SucursalInfo[];
  currentBranch?: SucursalInfo | null;
}

export function DashboardClient({
  kpis,
  salesTrendData,
  ordenesEnCola,
  turnoActivo,
  vista,
  sucursalesResumen,
  sucursales,
  currentBranch,
}: DashboardClientProps) {
  return (
    <div className="space-y-6 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              {vista === "todas" ? "Resumen Global" : "Resumen Operativo"}
            </h1>
            {vista === "todas" && sucursales && sucursales.length > 1 && (
              <span className="px-2 py-0.5 rounded-full bg-secondary/10 text-secondary text-[10px] font-bold border border-secondary/20">
                {sucursales.length} sucursales
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {vista === "todas"
              ? "Panorama consolidado de todas las sucursales."
              : `Revisión del estado del autolavado en tiempo real.`}
            {vista === "sucursal" && currentBranch && (
              <span className="font-semibold text-secondary"> {currentBranch.nombre}</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardViewSelector currentView={vista} />
          <Link href="/ordenes/nueva" passHref>
            <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-4">
              <Plus className="h-4.5 w-4.5" />
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <KpiGrid kpis={kpis} />

      {/* Branch Summary Table (solo vista "todas" y si hay varias sucursales) */}
      {vista === "todas" && sucursalesResumen && sucursalesResumen.length > 1 && (
        <BranchSummaryTable sucursales={sucursalesResumen} />
      )}

      {/* Sales Trend Chart */}
      <SalesTrendChart data={salesTrendData} />

      {/* Orders Queue + Cash Register */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrdenesColaTable ordenes={ordenesEnCola} />
        <TurnoCajaPanel turnoActivo={turnoActivo} />
      </div>
    </div>
  );
}
