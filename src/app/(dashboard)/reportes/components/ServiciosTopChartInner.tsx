"use client";

import { useState, useCallback } from "react";
import { ShoppingBag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useRecharts } from "@/lib/hooks/useRecharts";
import type { ServicioTop } from "./types";

interface ServiciosTopChartProps {
  serviciosTop: ServicioTop[];
}

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const CustomBarTooltip = ({ active, payload }: { active?: boolean; payload?: { value?: number; payload?: { name?: string; total?: number } }[] }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-muted-foreground mb-1">{payload[0].payload?.name ?? ""}</p>
        <div className="space-y-0.5">
          <p className="text-muted-foreground font-bold text-[10px]">
            Servicios: <span className="text-foreground font-extrabold">{payload[0].value ?? 0}</span>
          </p>
          <p className="text-secondary font-bold text-[10px]">
            Recaudación: <span className="font-extrabold">S/ {Number(payload[0].payload?.total ?? 0).toFixed(2)}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export function ServiciosTopChartInner({ serviciosTop }: ServiciosTopChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const Recharts = useRecharts();

  const onMouseEnter = useCallback((_: unknown, index: number) => {
    setActiveIndex(index);
  }, []);

  const onMouseLeave = useCallback(() => {
    setActiveIndex(null);
  }, []);

  if (!Recharts) return <ChartSkeleton className="lg:col-span-3" />;

  const { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } = Recharts;

  return (
    <Card className="p-6 border-border bg-card shadow-sm lg:col-span-3 space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <ShoppingBag className="h-4 w-4 text-secondary" />
          Servicios Más Populares (Top 5)
        </h3>
      </div>
      <div className="h-80 w-full">
        {serviciosTop.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            Registra ventas completadas para rankear los servicios.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={serviciosTop} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={9} fontWeight="bold" tickLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={9} fontWeight="bold" tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={false} />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]} maxBarSize={45}>
                {serviciosTop.map((entry, index) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={COLORS[index % COLORS.length]}
                    opacity={activeIndex === null || activeIndex === index ? 1 : 0.4}
                    className="transition-all duration-300"
                    onMouseEnter={(e: unknown) => onMouseEnter(e, index)}
                    onMouseLeave={onMouseLeave}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
