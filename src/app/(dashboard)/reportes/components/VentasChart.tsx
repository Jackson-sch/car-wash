"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { VentaDiaria } from "./types";

interface VentasChartProps {
  ventasDiarias: VentaDiaria[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-muted-foreground mb-1">{label}</p>
        <p className="font-black text-secondary text-sm">
          S/ {parseFloat(payload[0].value || "0").toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function VentasChart({ ventasDiarias }: VentasChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Card className="p-6 border-border bg-card shadow-sm lg:col-span-2 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-secondary" />
          Tendencia de Ingresos Diarios
        </h3>
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
              onMouseMove={(e) => {
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
                className="transition-all duration-300"
                activeDot={{
                  r: hoveredIndex !== null ? 7 : 5,
                  fill: "var(--color-chart-1)",
                  stroke: "var(--background)",
                  strokeWidth: 3,
                  className: "transition-all duration-300",
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
