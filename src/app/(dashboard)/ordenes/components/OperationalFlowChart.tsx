"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";
import type { Orden } from "./OrdenesTable";

interface OperationalFlowChartProps {
  ordenes: Orden[];
}

export function OperationalFlowChart({ ordenes }: OperationalFlowChartProps) {
  const chartData = useMemo(() => {
    const hours = Array.from({ length: 13 }, (_, i) => i + 8); // 8 to 20 (8 AM to 8 PM)
    const today = new Date().toDateString();

    const counts = new Map<number, number>();
    hours.forEach((h) => counts.set(h, 0));

    ordenes.forEach((o) => {
      if (o.createdAt) {
        const date = new Date(o.createdAt);
        if (date.toDateString() === today) {
          const hr = date.getHours();
          if (hr >= 8 && hr <= 20) {
            counts.set(hr, (counts.get(hr) || 0) + 1);
          }
        }
      }
    });

    return hours.map((h) => {
      const suffix = h >= 12 ? "PM" : "AM";
      const displayHour = h > 12 ? h - 12 : h === 0 ? 12 : h;
      return {
        hour: `${displayHour} ${suffix}`,
        "Vehículos": counts.get(h) || 0,
      };
    });
  }, [ordenes]);

  // Determine if there are any orders today
  const hasData = useMemo(() => {
    return chartData.some((d) => d["Vehículos"] > 0);
  }, [chartData]);

  return (
    <Card className="p-5 border border-border/80 bg-card/45 backdrop-blur-md rounded-2xl flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
          Flujo Operativo
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
          Volumen de Órdenes por Hora Hoy
        </p>
      </div>

      <div className="flex-1 w-full min-h-[160px] flex items-center justify-center">
        {!hasData ? (
          <div className="text-xs text-muted-foreground font-bold py-10 text-center">
            Aún no se registran ingresos de vehículos hoy.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
            >
              <XAxis
                dataKey="hour"
                stroke="var(--muted-foreground)"
                fontSize={9}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={9}
                fontWeight="bold"
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid var(--border)",
                  background: "var(--card)",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05)",
                  fontSize: "11px",
                  fontWeight: "bold",
                  color: "var(--foreground)",
                }}
                itemStyle={{ color: "var(--foreground)" }}
                cursor={{ fill: "rgba(120, 120, 120, 0.05)" }}
              />
              <Bar
                dataKey="Vehículos"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              >
                {chartData.map((entry, index) => {
                  const isCurrentHour = new Date().getHours() === index + 8;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        isCurrentHour
                          ? "var(--secondary)"
                          : "rgba(14, 165, 233, 0.35)" // opacity of secondary accent
                      }
                      className="transition-colors duration-200 hover:fill-secondary"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}
