import { Coins, TrendingUp, ClipboardCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { KPIStats } from "./types";

interface ReportesSummaryCardsProps {
  kpis: KPIStats;
}

export function ReportesSummaryCards({ kpis }: ReportesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <Card className="p-6 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:border-zinc-350 transition-all flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
            Facturación Acumulada
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            S/ {kpis.totalVentas.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50 text-secondary">
          <Coins className="h-5 w-5" />
        </div>
      </Card>

      <Card className="p-6 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:border-zinc-350 transition-all flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
            Ticket Promedio
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            S/ {kpis.ticketPromedio.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </Card>

      <Card className="p-6 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:border-zinc-350 transition-all flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
            Servicios Atendidos
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-zinc-900">
            {kpis.ordenesCompletadas} órdenes
          </div>
        </div>
        <div className="p-3.5 rounded-xl bg-blue-50 text-blue-500">
          <ClipboardCheck className="h-5 w-5" />
        </div>
      </Card>
    </div>
  );
}
