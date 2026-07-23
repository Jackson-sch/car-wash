"use client";

import { useState } from "react";
import { Sparkles, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChartSkeleton } from "@/components/ui/chart-skeleton";
import { useRecharts } from "@/lib/hooks/useRecharts";
import type { HoraPico } from "./types";

interface HorasPicoChartProps {
  horasPico: HoraPico[];
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { dataKey?: string; value?: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    const actual = payload.find((p) => p.dataKey === "cantidad")?.value ?? 0;
    const projected = payload.find((p) => p.dataKey === "prediccion")?.value ?? 0;
    
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-xl shadow-xl text-xs space-y-1.5">
        <p className="font-bold text-muted-foreground border-b border-border/40 pb-1">{label} hrs</p>
        <div className="flex items-center justify-between gap-6">
          <span className="text-zinc-500 font-medium">Volumen Real:</span>
          <span className="font-extrabold text-foreground">{actual} veh.</span>
        </div>
        <div className="flex items-center justify-between gap-6">
          <span className="text-emerald-500 font-semibold flex items-center gap-1">
            Proyección:
          </span>
          <span className="font-extrabold text-emerald-500">{projected} veh.</span>
        </div>
      </div>
    );
  }
  return null;
};

export function HorasPicoChartInner({ horasPico }: HorasPicoChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const Recharts = useRecharts();

  if (!Recharts) return (
    <ChartSkeleton>
      <div className="flex justify-between border-b border-border pb-3">
        <div className="space-y-2">
          <div className="h-3 w-56 bg-muted/40 rounded animate-pulse" />
          <div className="h-2 w-40 bg-muted/30 rounded animate-pulse" />
        </div>
        <div className="h-5 w-28 bg-emerald-500/20 rounded-full animate-pulse" />
      </div>
      <div className="h-80 w-full bg-muted/20 rounded-lg animate-pulse" />
    </ChartSkeleton>
  );

  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } = Recharts;

  const horaPicoMaxima = [...horasPico].sort((a, b) => b.cantidad - a.cantidad)[0]?.hora ?? "11:00";

  return (
    <Card className="p-6 border-border bg-card shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border pb-3">
        <div>
          <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
            Picos de Demanda y Proyección Predictiva
          </h3>
          <p className="text-[10px] text-zinc-500 mt-0.5">
            Volumen por hora y tendencia proyectada para la próxima semana.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
          <TrendingUp className="h-3 w-3" />
          <span>Pico habitual: {horaPicoMaxima}</span>
        </div>
      </div>
      <div className="h-80 w-full">
        {horasPico.length === 0 ? (
          <div className="h-full flex items-center justify-center text-muted-foreground text-xs font-bold">
            Sin datos suficientes para proyectar picos.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={horasPico}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              onMouseMove={(e: { activeTooltipIndex?: number }) => {
                if (e.activeTooltipIndex !== undefined && e.activeTooltipIndex !== null) {
                  setHoveredIndex(Number(e.activeTooltipIndex));
                }
              }}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <defs>
                <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorProjected" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} />
              <XAxis 
                dataKey="hora" 
                stroke="var(--muted-foreground)" 
                fontSize={9} 
                fontWeight="bold" 
                tickLine={false} 
              />
              <YAxis 
                stroke="var(--muted-foreground)" 
                fontSize={9} 
                fontWeight="bold" 
                tickLine={false} 
              />
              <Tooltip content={<CustomTooltip />} cursor={false} />
              <Legend 
                verticalAlign="top" 
                height={36} 
                iconSize={8}
                content={() => (
                  <div className="flex items-center justify-end gap-4 text-[10px] font-bold text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                      <span>Volumen Actual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span>Proyección Predictiva</span>
                    </div>
                  </div>
                )}
              />
              <Area
                type="monotone"
                dataKey="cantidad"
                stroke="var(--color-chart-1)"
                strokeWidth={hoveredIndex !== null ? 3.5 : 2.5}
                fillOpacity={1}
                fill="url(#colorActual)"
                className="transition-colors duration-300"
              />
              <Area
                type="monotone"
                dataKey="prediccion"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#colorProjected)"
                className="transition-colors duration-300"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
