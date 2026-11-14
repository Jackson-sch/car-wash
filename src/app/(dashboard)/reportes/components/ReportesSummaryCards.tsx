import { Coins, TrendingUp, ClipboardCheck, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { KPIStats, ServicioTop } from "./types";

interface ReportesSummaryCardsProps {
  kpis: KPIStats;
  currentRango?: string;
  serviciosTop?: ServicioTop[];
}

const RANGO_LABELS: Record<string, string> = {
  hoy: "Hoy",
  "7d": "Últimos 7 días",
  "30d": "Últimos 30 días",
  mes: "Este mes",
  todo: "Histórico",
};

export function ReportesSummaryCards({
  kpis,
  currentRango = "7d",
  serviciosTop = [],
}: ReportesSummaryCardsProps) {
  // eslint-disable-next-line security/detect-object-injection
  const rangoLabel = RANGO_LABELS[currentRango] || "Período actual";
  const topServicio = serviciosTop[0];

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
        {/* 1. Facturación Acumulada */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Coins className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Facturación ({rangoLabel})
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {formatCurrency(kpis.totalVentas)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                bruto
              </span>
            </div>
          </div>
        </div>

        {/* 2. Ticket Promedio */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors border-l border-border/50 lg:border-l-0">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <TrendingUp className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Ticket Promedio
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(kpis.ticketPromedio)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                por vehículo
              </span>
            </div>
          </div>
        </div>

        {/* 3. Servicios Atendidos */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <ClipboardCheck className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Órdenes Finalizadas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {kpis.ordenesCompletadas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                100% cobradas
              </span>
            </div>
          </div>
        </div>

        {/* 4. Servicio Estrella */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors border-l border-border/50 lg:border-l-0">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Servicio Estrella
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-black text-foreground leading-none truncate max-w-[140px]">
                {topServicio ? topServicio.name : "Sin datos"}
              </span>
              {topServicio && (
                <span className="text-[10px] text-muted-foreground font-mono font-bold shrink-0">
                  ({topServicio.cantidad})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
