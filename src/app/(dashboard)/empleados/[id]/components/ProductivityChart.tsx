"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/formats";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ProductivityChartProps {
  data: { fecha: string; cantidad: number; total: number }[];
  rol: string;
}

const CustomTooltip = ({ active, payload, label, mode }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-muted-foreground mb-1">Día {label}</p>
        <p className="font-extrabold text-secondary text-sm">
          {mode === "revenue" ? formatCurrency(value) : `${value} servicios`}
        </p>
      </div>
    );
  }
  return null;
};

export function ProductivityChart({ data, rol }: ProductivityChartProps) {
  const [chartMode, setChartMode] = useState<"services" | "revenue">("services");

  return (
    <Card className="p-6 border border-border bg-card shadow-sm hover:border-zinc-350 transition-colors duration-300 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
            Tendencia de Rendimiento (Últimos 30 días)
          </h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {chartMode === "services" 
              ? "Cantidad de servicios/órdenes completadas por día" 
              : "Ingresos totales generados por día"}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            size="xs"
            variant={chartMode === "services" ? "secondary" : "outline"}
            onClick={() => setChartMode("services")}
            className="text-[10px] font-bold px-2 py-1 h-7 rounded-md cursor-pointer"
          >
            Servicios
          </Button>
          <Button
            size="xs"
            variant={chartMode === "revenue" ? "secondary" : "outline"}
            onClick={() => setChartMode("revenue")}
            className="text-[10px] font-bold px-2 py-1 h-7 rounded-md cursor-pointer"
          >
            Facturación
          </Button>
        </div>
      </div>

      <div className="h-56 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            No hay datos de rendimiento registrados en los últimos 30 días.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="productivityColor" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
              <XAxis dataKey="fecha" stroke="currentColor" className="text-muted-foreground" fontSize={9} fontWeight="bold" tickLine={false} />
              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={9} fontWeight="bold" tickLine={false} />
              <Tooltip content={<CustomTooltip mode={chartMode} />} cursor={false} />
              <Area
                type="monotone"
                dataKey={chartMode === "services" ? "cantidad" : "total"}
                stroke="var(--secondary)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#productivityColor)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
