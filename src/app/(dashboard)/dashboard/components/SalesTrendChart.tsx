"use client";

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

interface SalesTrendChartProps {
  data: { day: string; ventas: number }[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = typeof payload[0].value === "number" ? payload[0].value : parseFloat(payload[0].value || "0");
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-medium text-muted-foreground mb-1">{label}</p>
        <p className="font-extrabold text-secondary text-sm">
          {formatCurrency(value)}
        </p>
      </div>
    );
  }
  return null;
};

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <div className="p-6 rounded-lg border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4 hover:border-secondary transition-colors duration-300">
      <div>
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Flujo de Ventas de la Semana
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">Ingresos diarios de lavado acumulados</p>
      </div>
      <div className="h-48 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            Falta acumular datos de ventas reales para graficar la tendencia.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="dashboardColorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.25} />
              <XAxis dataKey="day" stroke="currentColor" className="text-muted-foreground" fontSize={9} fontWeight="bold" tickLine={false} />
              <YAxis stroke="currentColor" className="text-muted-foreground" fontSize={9} fontWeight="bold" tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={false} />
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
    </div>
  );
}
