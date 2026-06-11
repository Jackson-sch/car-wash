"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";
import type { Orden } from "./OrdenesTable";

interface OrdenesDistribucionChartProps {
  ordenes: Orden[];
}

export function OrdenesDistribucionChart({ ordenes }: OrdenesDistribucionChartProps) {
  const data = useMemo(() => {
    const pendientes = ordenes.filter((o) => o.estado === "pendiente").length;
    const enProceso = ordenes.filter((o) => o.estado === "en_proceso").length;
    const completados = ordenes.filter((o) => o.estado === "completado").length;
    
    // Solo mostramos activos para el chart
    return [
      { name: "En Espera", value: pendientes, color: "#f59e0b" }, // Amber 500
      { name: "Lavando", value: enProceso, color: "#0ea5e9" }, // Sky 500 / Secondary
      { name: "Listo", value: completados, color: "#10b981" }, // Emerald 500
    ].filter((item) => item.value > 0);
  }, [ordenes]);

  if (data.length === 0) {
    return null;
  }

  return (
    <Card className="p-4 border border-border/80 bg-card/60 backdrop-blur-md shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] rounded-xl flex items-center gap-4 h-full">
      <div className="h-20 w-20 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={40}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '8px', 
                border: '1px solid var(--border)',
                background: 'var(--card)',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'var(--foreground)'
              }}
              itemStyle={{ color: 'var(--foreground)' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-col gap-1.5">
        <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Flujo Activo</h4>
        <div className="flex flex-col gap-1">
          {data.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name}: {item.value}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
