"use client";

"use client";

import { PieChart as PieIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Sector,
  Tooltip,
  Legend,
} from "recharts";
import type { PieSectorShapeProps } from "recharts";
import { PagoMetodo } from "./types";

interface MetodosPagoChartProps {
  pagosMetodo: PagoMetodo[];
}

const COLORS = ["var(--color-chart-1)", "var(--color-chart-2)", "var(--color-chart-3)", "var(--color-chart-4)", "var(--color-chart-5)"];

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground border border-border p-3 rounded-lg shadow-xl text-xs">
        <p className="font-bold text-muted-foreground mb-1">{payload[0].name}</p>
        <p className="font-black text-secondary">
          S/ {parseFloat(payload[0].value || "0").toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const renderShape = (props: PieSectorShapeProps) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, isActive } = props;
  return (
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={isActive ? outerRadius + 10 : outerRadius}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      cornerRadius={4}
      className="transition-all duration-300"
    />
  );
};

export function MetodosPagoChart({ pagosMetodo }: MetodosPagoChartProps) {
  return (
    <Card className="p-6 border-border bg-card shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-border pb-3">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <PieIcon className="h-4 w-4 text-secondary" />
          Flujos por Método de Pago
        </h3>
      </div>
      <div className="relative h-80 w-full flex items-center justify-center">
        {pagosMetodo.length === 0 ? (
          <div className="text-muted-foreground text-xs font-bold">Sin transacciones.</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pagosMetodo}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={3}
                  strokeWidth={0}
                  dataKey="value"
                  shape={renderShape}
                >
                  {pagosMetodo.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} cursor={false} />
                <Legend
                  verticalAlign="bottom"
                  iconSize={8}
                  formatter={(val) => <span className="text-[10px] text-muted-foreground font-bold">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute flex flex-col items-center justify-center pb-8 pointer-events-none">
              <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-wider">Total</span>
              <span className="text-sm font-black text-foreground">
                S/ {pagosMetodo.reduce((acc, curr) => acc + curr.value, 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </>
        )}
      </div>
    </Card>
  );
}
