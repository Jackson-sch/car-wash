"use client";

import { useState } from "react";
import { useRecharts } from "@/lib/hooks/useRecharts";
import { formatCurrency } from "@/lib/formats";
import { 
  TrendingUp, 
  Sparkles, 
  CreditCard, 
  BarChart3,
  Calendar,
  Wallet,
  Smartphone,
  CheckCircle2
} from "lucide-react";
import type { TopServiceItem, PaymentBreakdownItem } from "@/lib/actions/dashboard";

interface SalesTrendChartProps {
  data: { day: string; ventas: number }[];
  topServicios?: TopServiceItem[];
  pagosBreakdown?: PaymentBreakdownItem[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number | string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    const value = typeof payload[0].value === "number" ? payload[0].value : parseFloat(payload[0].value || "0");
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-muted-foreground">{label}</p>
        <p className="font-black text-secondary text-base">
          {formatCurrency(value)}
        </p>
      </div>
    );
  }
  return null;
};

function ChartSkeleton() {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card/90 shadow-xs space-y-4">
      <div className="space-y-2">
        <div className="h-4 w-44 bg-muted/40 rounded animate-pulse" />
        <div className="h-3 w-56 bg-muted/30 rounded animate-pulse" />
      </div>
      <div className="h-56 w-full bg-muted/20 rounded-xl animate-pulse" />
    </div>
  );
}

export function SalesTrendChartInner({
  data,
  topServicios = [],
  pagosBreakdown = [],
}: SalesTrendChartProps) {
  const [activeTab, setActiveTab] = useState<"trend" | "services" | "payments">("trend");
  const Recharts = useRecharts();

  const totalVentasSemana = data.reduce((acc, d) => acc + d.ventas, 0);

  if (!Recharts) return <ChartSkeleton />;

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } = Recharts;

  return (
    <div className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs space-y-5 hover:border-secondary/40 transition-all duration-300">
      {/* Header with Title and Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
              <BarChart3 className="h-4.5 w-4.5 text-secondary" />
              Inteligencia Operativa & Tendencias
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/25">
              Semanal
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {activeTab === "trend" && `Total acumulado últimos 7 días: ${formatCurrency(totalVentasSemana)}`}
            {activeTab === "services" && "Servicios con mayor demanda y facturación"}
            {activeTab === "payments" && "Distribución de recaudación por canal de cobro"}
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center rounded-xl bg-muted/70 p-1 border border-border/70 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab("trend")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
              activeTab === "trend"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5 text-secondary" />
            <span>Flujo Semanal</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
              activeTab === "services"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span>Top Servicios</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
              activeTab === "payments"
                ? "bg-background text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 text-emerald-500" />
            <span>Medios de Pago</span>
          </button>
        </div>
      </div>

      {/* Content based on Active Tab */}
      {activeTab === "trend" && (
        <div className="space-y-3">
          <div className="h-56 w-full">
            {data.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
                Falta acumular datos de ventas para graficar la tendencia.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="dashboardColorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
                  <XAxis
                    dataKey="day"
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="currentColor"
                    className="text-muted-foreground"
                    fontSize={11}
                    fontWeight={600}
                    tickLine={false}
                    tickFormatter={(val: number | string) => `S/ ${val}`}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ stroke: "var(--border)", strokeWidth: 1 }} />
                  <Area
                    type="monotone"
                    dataKey="ventas"
                    stroke="var(--secondary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#dashboardColorSales)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/50 pt-3">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-secondary" />
              Ingresos de los últimos 7 días
            </span>
            <span className="font-bold text-foreground">
              Promedio diario: {formatCurrency(totalVentasSemana / 7)}
            </span>
          </div>
        </div>
      )}

      {activeTab === "services" && (
        <div className="space-y-4 py-2">
          {topServicios.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-medium">
              Aún no hay servicios registrados en la semana. Se listarán automáticamente al registrar órdenes.
            </div>
          ) : (
            <div className="space-y-3">
              {topServicios.map((srv, idx) => {
                const maxCantidad = Math.max(...topServicios.map((s) => s.cantidad), 1);
                const porcentaje = Math.round((srv.cantidad / maxCantidad) * 100);

                return (
                  <div key={srv.nombre} className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="h-7 w-7 rounded-lg bg-secondary/15 text-secondary font-black text-xs flex items-center justify-center shrink-0 border border-secondary/25">
                        #{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between text-xs font-bold text-foreground">
                          <span className="truncate">{srv.nombre}</span>
                          <span className="font-mono text-secondary ml-2">{formatCurrency(srv.total)}</span>
                        </div>
                        <div className="w-full bg-border/60 h-2 rounded-full overflow-hidden mt-1.5">
                          <div
                            className="bg-secondary h-full rounded-full transition-all duration-500"
                            style={{ width: `${porcentaje}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-foreground bg-card px-2.5 py-1 rounded-md border border-border shrink-0">
                      {srv.cantidad} {srv.cantidad === 1 ? "servicio" : "servicios"}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === "payments" && (
        <div className="space-y-4 py-2">
          {pagosBreakdown.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-xs font-medium">
              No hay pagos procesados hoy. Aparecerán desglosados en tiempo real conforme se cobren las órdenes.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {pagosBreakdown.map((pb) => {
                const isCash = pb.metodo === "efectivo";
                const isDigital = pb.metodo === "yape" || pb.metodo === "plin";

                const Icon = isCash ? Wallet : isDigital ? Smartphone : CreditCard;
                const iconColor = isCash ? "text-emerald-500" : isDigital ? "text-purple-500" : "text-sky-500";
                const bgColor = isCash ? "bg-emerald-500/10 border-emerald-500/20" : isDigital ? "bg-purple-500/10 border-purple-500/20" : "bg-sky-500/10 border-sky-500/20";

                return (
                  <div key={pb.metodo} className="p-4 rounded-xl bg-card border border-border/80 flex flex-col justify-between space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {pb.metodo}
                      </span>
                      <div className={`p-1.5 rounded-lg border ${bgColor} ${iconColor}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-xl font-black text-foreground font-mono">
                        {formatCurrency(pb.total)}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1 font-semibold">
                        <CheckCircle2 className="h-3 w-3 text-secondary" />
                        <span>{pb.porcentaje}% del total de hoy</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
