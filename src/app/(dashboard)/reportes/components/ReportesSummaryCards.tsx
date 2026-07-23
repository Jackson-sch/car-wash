import { Coins, TrendingUp, ClipboardCheck } from "lucide-react";
import type { KPIStats } from "./types";

interface ReportesSummaryCardsProps {
  kpis: KPIStats;
}

export function ReportesSummaryCards({ kpis }: ReportesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Facturación */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-secondary/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Facturación Acumulada
            </span>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              S/ {kpis.totalVentas.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110 duration-300">
            <Coins className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          <span>Ingresos brutos registrados</span>
        </div>
        {/* Subtle gradient glow */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card 2: Ticket Promedio */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-emerald-500/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Ticket Promedio
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-500 tracking-tight">
              S/ {kpis.ticketPromedio.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110 duration-300">
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Valor promedio de ticket de venta</span>
        </div>
        {/* Subtle gradient glow */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card 3: Servicios Atendidos */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-blue-500/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Servicios Atendidos
            </span>
            <h3 className="text-3xl font-extrabold text-blue-500 tracking-tight">
              {kpis.ordenesCompletadas} <span className="text-sm font-medium text-muted-foreground">órdenes</span>
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110 duration-300">
            <ClipboardCheck className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Servicios finalizados con éxito</span>
        </div>
        {/* Subtle gradient glow */}
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}
