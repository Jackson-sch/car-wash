"use client";

import { PieChart as PieIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useRecharts } from "@/lib/hooks/useRecharts";
import type { PagoMetodo } from "./types";

interface MetodosPagoChartProps {
  pagosMetodo: PagoMetodo[];
}

const COLORS = [
  "#0ea5e9", // Sky
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#f59e0b", // Amber
  "#ec4899", // Pink
];

const METODO_LABELS: Record<string, string> = {
  EFECTIVO: "Efectivo",
  TARJETA: "Tarjeta POS",
  YAPE: "Yape",
  PLIN: "Plin",
  "YAPE/PLIN": "Yape / Plin",
  TRANSFERENCIA: "Transferencia",
};

const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { name?: string; value?: number | string }[] }) => {
  if (active && payload && payload.length) {
    const rawName = String(payload[0].name ?? "").toUpperCase();
    // eslint-disable-next-line security/detect-object-injection
    const displayName = METODO_LABELS[rawName] || rawName;
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-xl shadow-xl text-xs space-y-1">
        <p className="font-bold text-muted-foreground">{displayName}</p>
        <p className="font-mono font-black text-secondary text-sm">
          S/ {parseFloat(String(payload[0].value ?? 0)).toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export function MetodosPagoChartInner({ pagosMetodo }: MetodosPagoChartProps) {
  const Recharts = useRecharts();

  const totalMonto = pagosMetodo.reduce((acc, curr) => acc + curr.value, 0);

  if (!Recharts) return (
    <ChartSkeleton>
      <div className="border-b border-border pb-3">
        <div className="h-3 w-48 bg-muted/40 rounded animate-pulse" />
      </div>
      <div className="h-80 w-full flex items-center justify-center">
        <div className="w-40 h-40 rounded-full bg-muted/20 animate-pulse" />
      </div>
    </ChartSkeleton>
  );

  const { ResponsiveContainer, PieChart, Pie, Cell, Sector: RechartsSector, Tooltip } = Recharts;

  const renderShape = (props: { cx?: number; cy?: number; innerRadius?: number; outerRadius: number; startAngle?: number; endAngle?: number; fill?: string; isActive?: boolean }) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, isActive } = props;
    return (
      <RechartsSector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={isActive ? outerRadius + 8 : outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={4}
        className="transition-all duration-300"
      />
    );
  };

  return (
    <Card className="p-5 sm:p-6 border-border bg-card shadow-sm space-y-4 flex flex-col justify-between">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <PieIcon className="h-4 w-4 text-secondary" />
          Flujos por Método de Pago
        </h3>
        <span className="text-[10px] font-bold text-muted-foreground font-mono">
          {pagosMetodo.length} canales
        </span>
      </div>

      <div className="relative h-64 sm:h-72 w-full flex items-center justify-center">
        {pagosMetodo.length === 0 || totalMonto === 0 ? (
          <div className="text-muted-foreground text-xs font-bold">Sin transacciones registradas.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pagosMetodo}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={3}
                  strokeWidth={0}
                  dataKey="value"
                  shape={renderShape}
                >
                  {pagosMetodo.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]!} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Total Canal</span>
              <span className="text-base sm:text-lg font-black text-foreground font-mono">
                S/ {totalMonto.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>

      {/* Custom Legend to replace default Recharts [object Object] legend bug */}
      {pagosMetodo.length > 0 && totalMonto > 0 && (
        <div className="pt-2 border-t border-border/50 flex flex-wrap items-center justify-center gap-2">
          {pagosMetodo.map((entry, index) => {
            const raw = entry.name.toUpperCase();
            // eslint-disable-next-line security/detect-object-injection
            const label = METODO_LABELS[raw] || raw;
            const pct = ((entry.value / totalMonto) * 100).toFixed(0);
            const color = COLORS[index % COLORS.length]!;

            return (
              <div
                key={`badge-${entry.name}`}
                className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-muted/40 border border-border/40 text-[11px] font-medium text-foreground hover:bg-muted/70 transition-colors"
              >
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span>{label}</span>
                <span className="font-mono text-muted-foreground text-[10px] font-bold">({pct}%)</span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
