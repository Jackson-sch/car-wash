import {
  Car,
  TrendingUp,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/formats";

interface KpiGridProps {
  kpis: {
    ventasHoy: number;
    ordenesActivas: number;
    ordenesEnProceso: number;
    ordenesEnEspera: number;
    ticketPromedio: number;
    insumosBajoStock: number;
  };
}

interface KPI {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
  icon: any;
  iconColor: string;
  iconBg: string;
}

export function KpiGrid({ kpis }: KpiGridProps) {
  const kpiList: KPI[] = [
    {
      title: "Ventas de Hoy",
      value: formatCurrency(kpis.ventasHoy),
      change: "En tiempo real",
      trend: "neutral",
      icon: TrendingUp,
      iconColor: "text-secondary",
      iconBg: "bg-secondary/10",
    },
    {
      title: "Órdenes Activas",
      value: kpis.ordenesActivas.toString(),
      change: `${kpis.ordenesEnProceso} en proceso, ${kpis.ordenesEnEspera} en espera`,
      trend: "neutral",
      icon: Clock,
      iconColor: "text-amber-600 dark:text-amber-400",
      iconBg: "bg-amber-500/10",
    },
    {
      title: "Ticket Promedio",
      value: formatCurrency(kpis.ticketPromedio),
      change: "Servicios cobrados",
      trend: "neutral",
      icon: Car,
      iconColor: "text-indigo-600 dark:text-indigo-400",
      iconBg: "bg-indigo-500/10",
    },
    {
      title: "Alertas de Insumos",
      value: `${kpis.insumosBajoStock} ítems`,
      change: kpis.insumosBajoStock > 0 ? "Bajo stock mínimo" : "Stock al día",
      trend: kpis.insumosBajoStock > 0 ? "down" : "neutral",
      icon: AlertTriangle,
      iconColor: kpis.insumosBajoStock > 0 ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400",
      iconBg: kpis.insumosBajoStock > 0 ? "bg-rose-500/10" : "bg-emerald-500/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpiList.map((kpi, i) => {
        const Icon = kpi.icon;
        return (
          <div
            key={i}
            className="p-6 rounded-lg border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] hover:border-secondary transition-all duration-300 flex flex-col justify-between h-32 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
                {kpi.title}
              </span>
              <div className={`p-2 rounded-md ${kpi.iconBg} ${kpi.iconColor} transition-transform duration-300 group-hover:scale-110`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>
            <div className="mt-2">
              <span className="text-2xl font-black text-foreground tracking-tight">
                {kpi.value}
              </span>
              <p className={`text-[10px] mt-1 font-medium ${kpi.trend === "down" ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`}>
                {kpi.change}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
