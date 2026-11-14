"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, RefreshCw, Tv } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { KpiGrid } from "./components/KpiGrid";
import dynamic from "next/dynamic";

const SalesTrendChart = dynamic(
  () => import("./components/SalesTrendChart").then((m) => ({ default: m.SalesTrendChart })),
  { ssr: false }
);

import { OrdenesColaTable } from "./components/OrdenesColaTable";
import { TurnoCajaPanel } from "./components/TurnoCajaPanel";
import { DashboardViewSelector } from "./components/DashboardViewSelector";
import { BranchSummaryTable } from "./components/BranchSummaryTable";
import { QuickActionsBar } from "./components/QuickActionsBar";
import { useSession } from "@/lib/auth-client";
import type { TopServiceItem, PaymentBreakdownItem } from "@/lib/actions/dashboard";

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
    ordenesCompletadasHoy?: number;
    efectivoHoy?: number;
    digitalHoy?: number;
  };
  salesTrendData: { day: string; ventas: number }[];
  ordenesEnCola: OrdenCola[];
  turnoActivo: TurnoCajaSimple | null;
  vista: "todas" | "sucursal";
  sucursalesResumen?: SucursalResumen[];
  sucursales?: SucursalInfo[];
  currentBranch?: SucursalInfo | null;
  userRol?: string;
  topServicios?: TopServiceItem[];
  pagosBreakdown?: PaymentBreakdownItem[];
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
  userRol: serverUserRol,
  topServicios = [],
  pagosBreakdown = [],
}: DashboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const userRol = serverUserRol || session?.user?.rol;
  const showSelector = userRol === "admin" || userRol === "superadmin";

  const handleRefresh = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  const saldoCaja = turnoActivo 
    ? parseFloat(turnoActivo.montoInicial || "0") + (turnoActivo.totalVentasEfectivo || 0)
    : 0;

  return (
    <div className="space-y-6 sm:space-y-7 md:space-y-8 text-foreground pb-8">
      {/* 1. HEADER OPERATIVO */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {vista === "todas" ? "Resumen Global Multisede" : "Resumen Operativo en Vivo"}
            </h1>
            {vista === "todas" && sucursales && sucursales.length > 1 ? (
              <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-black border border-secondary/30">
                {sucursales.length} Sedes Activas
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Operación en Vivo
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1.5 flex-wrap">
            <span>
              {vista === "todas"
                ? "Consolidado empresarial de todas las sucursales de la red."
                : "Monitoreo integral de patio, bahías y rendimiento de caja."}
            </span>
            {vista === "sucursal" && currentBranch && (
              <>
                <span>•</span>
                <span className="font-extrabold text-secondary"> {currentBranch.nombre}</span>
              </>
            )}
          </p>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {showSelector && <DashboardViewSelector currentView={vista} />}

          {/* Sincronizar Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPending}
            className="h-10 px-3 rounded-xl border-border text-xs font-bold hover:bg-muted/80 cursor-pointer text-foreground flex items-center gap-1.5"
            title="Recargar datos operativos ahora"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-secondary ${isPending ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{isPending ? "Sincronizando..." : "Actualizar"}</span>
          </Button>

          {/* Quick TV Link */}
          <Link href="/kiosco" passHref>
            <Button
              variant="outline"
              className="h-10 px-3.5 rounded-xl border-border/80 hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary text-xs font-bold gap-1.5 cursor-pointer shadow-xs"
              title="Abrir vista de TV para la sala de espera"
            >
              <Tv className="h-4 w-4 text-sky-500" />
              <span className="hidden sm:inline">Modo TV</span>
            </Button>
          </Link>

          {/* Nueva Orden POS Button */}
          <Link href="/ordenes/nueva" passHref>
            <Button className="h-10 px-4 rounded-xl bg-secondary hover:bg-sky-400 text-slate-950 font-black text-xs gap-2 cursor-pointer shadow-md shadow-secondary/25 transition-all">
              <Plus className="h-4 w-4 text-slate-950" />
              <span>Nueva Orden</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. ACCIONES RÁPIDAS DEL DÍA */}
      <QuickActionsBar 
        cajaAbierta={!!turnoActivo}
        saldoCaja={saldoCaja}
        activasCount={kpis.ordenesActivas}
      />

      {/* 3. KPI CARDS */}
      <KpiGrid kpis={kpis} />

      {/* 4. RESUMEN POR SUCURSAL (si vista 'todas') */}
      {vista === "todas" && sucursalesResumen && sucursalesResumen.length > 1 && (
        <BranchSummaryTable sucursales={sucursalesResumen} />
      )}

      {/* 5. INTELIGENCIA OPERATIVA & TENDENCIAS (Tabs de Flujo, Top Servicios, Medios de Pago) */}
      <SalesTrendChart 
        data={salesTrendData} 
        topServicios={topServicios}
        pagosBreakdown={pagosBreakdown}
      />

      {/* 6. COLA DE PATIO + ESTADO DE CAJA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <OrdenesColaTable ordenes={ordenesEnCola} />
        <TurnoCajaPanel turnoActivo={turnoActivo} />
      </div>
    </div>
  );
}
