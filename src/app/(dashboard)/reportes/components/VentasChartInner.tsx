"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useRecharts } from "@/lib/hooks/useRecharts";
import type { VentaDiaria } from "./types";

interface VentasChartProps {
  ventasDiarias: VentaDiaria[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value?: number | string }[]; label?: string }) => {
  if (active && payload && payload.length) {
    const rawVal = parseFloat(String(payload[0].value ?? 0));
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-muted-foreground">{label}</p>
        <p className="font-mono font-black text-secondary text-sm">
          S/ {rawVal.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export function VentasChartInner({ ventasDiarias }: VentasChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const Recharts = useRecharts();

  const totalPeriodo = ventasDiarias.reduce((acc, curr) => acc + curr.ventas, 0);

  if (!Recharts) return <ChartSkeleton className="lg:col-span-2" />;

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } = Recharts;

  return (
    <Card className="p-5 sm:p-6 border-border bg-card shadow-sm lg:col-span-2 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-secondary" />
          Tendencia de Ingresos Diarios
        </h3>
        {ventasDiarias.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Subtotal:</span>
            <span className="font-mono font-black text-sm text-foreground">
              S/ {totalPeriodo.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        )}
      </div>
      <div className="h-80 w-full">
        {ventasDiarias.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            Falta acumular datos de ventas reales para graficar.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={ventasDiarias}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              onMouseMove={(e: { activeTooltipIndex?: number }) => {
                if (e.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null) {
                  setHoveredIndex(Number(e.activeTooltipIndex));
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="fecha" stroke="var(--muted-foreground)" fontSize={9} fontWeight="bold" tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={9} fontWeight="bold" tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Area
                type="monotone"
                dataKey="ventas"
                stroke="var(--color-chart-1)"
                strokeWidth={hoveredIndex !== null ? 4 : 3}
                fillOpacity={1}
                fill="url(#colorSales)"
                className="transition-colors duration-300"
                activeDot={{
                  r: hoveredIndex !== null ? 7 : 5,
                  fill: "var(--color-chart-1)",
                  stroke: "var(--background)",
                  strokeWidth: 3,
                  className: "transition-colors duration-300",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
