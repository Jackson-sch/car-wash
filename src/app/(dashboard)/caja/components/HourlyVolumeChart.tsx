import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import * as d3 from "d3";

interface HourlyVolumeChartProps {
  ventasPorHora: { hora: string; total: number }[];
}

export function HourlyVolumeChart({ ventasPorHora }: HourlyVolumeChartProps) {
  const [hoveredBar, setHoveredBar] = useState<{
    hora: string;
    total: number;
    x: number;
    y: number;
  } | null>(null);

  // SVG dimensions
  const width = 400;
  const height = 180;
  const margin = { top: 15, right: 15, bottom: 25, left: 25 };

  // Filtrar los últimos 6 registros de horas
  const chartData = useMemo(() => {
    return ventasPorHora.slice(-6);
  }, [ventasPorHora]);

  // X scale (Categorías de horas)
  const xScale = useMemo(() => {
    return d3
      .scaleBand()
      .domain(chartData.map((d) => d.hora))
      .range([margin.left, width - margin.right])
      .padding(0.35);
  }, [chartData]);

  // Y scale (Volumen de órdenes)
  const yScale = useMemo(() => {
    const maxVal = d3.max(chartData, (d) => d.total) || 5;
    // Forzar un número máximo divisible por 4 para que las líneas de grilla sean enteros limpios
    const domainMax = Math.ceil(maxVal / 4) * 4 || 4;
    return d3
      .scaleLinear()
      .domain([0, domainMax])
      .range([height - margin.bottom, margin.top]);
  }, [chartData]);

  // Obtener valores de grilla para el eje Y
  const yTicks = useMemo(() => {
    return yScale.ticks(4).filter((t) => Number.isInteger(t));
  }, [yScale]);

  return (
    <Card className="bg-transparent border-border shadow-sm p-6 flex flex-col justify-between relative overflow-visible">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Volumen de Órdenes por Hora
      </h3>

      {ventasPorHora.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground h-[200px]">
          Sin actividad registrada en este turno.
        </div>
      ) : (
        <div className="relative w-full h-[180px] select-none">
          {/* SVG Canvas */}
          <svg
            viewBox={`0 0 ${width} ${height}`}
            className="w-full h-full overflow-visible"
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={1} />
                <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.15} />
              </linearGradient>
            </defs>
            {/* Grid lines & Y Axis Ticks */}
            <g className="text-zinc-200/10 dark:text-zinc-800/10">
              {yTicks.map((tick) => (
                <g key={tick} className="transition-all duration-300">
                  <line
                    x1={margin.left}
                    x2={width - margin.right}
                    y1={yScale(tick)}
                    y2={yScale(tick)}
                    stroke="currentColor"
                    strokeWidth={1}
                    strokeDasharray={tick === 0 ? undefined : "3 3"}
                  />
                  {tick > 0 && (
                    <text
                      x={margin.left - 6}
                      y={yScale(tick) + 3}
                      textAnchor="end"
                      className="text-[9px] font-semibold fill-zinc-400 dark:fill-zinc-500 font-sans"
                    >
                      {tick}
                    </text>
                  )}
                </g>
              ))}
            </g>

            {/* Bars */}
            <g>
              {chartData.map((d, index) => {
                const x = xScale(d.hora);
                const y = yScale(d.total);
                if (x === undefined) return null;

                const barWidth = xScale.bandwidth();
                const barHeight = height - margin.bottom - y;

                return (
                  <g
                    key={index}
                    className="cursor-pointer"
                    onMouseEnter={() => {
                      setHoveredBar({
                        hora: d.hora,
                        total: d.total,
                        x: x + barWidth / 2,
                        y: y,
                      });
                    }}
                    onMouseMove={() => {
                      setHoveredBar({
                        hora: d.hora,
                        total: d.total,
                        x: x + barWidth / 2,
                        y: y,
                      });
                    }}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Invisible wider rect to make hovering easier */}
                    <rect
                      x={x - 4}
                      y={margin.top}
                      width={barWidth + 8}
                      height={height - margin.bottom - margin.top}
                      fill="transparent"
                    />
                    {/* Visble bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={Math.max(barHeight, 2)}
                      rx={3}
                      fill="url(#barGradient)"
                      className="opacity-90 hover:opacity-100 transition-opacity duration-200"
                    />
                  </g>
                );
              })}
            </g>

            {/* X Axis labels */}
            <g>
              {chartData.map((d, index) => {
                const x = xScale(d.hora);
                if (x === undefined) return null;
                return (
                  <text
                    key={index}
                    x={x + xScale.bandwidth() / 2}
                    y={height - 8}
                    textAnchor="middle"
                    className="text-[10px] font-bold fill-zinc-400 dark:fill-zinc-500 font-sans"
                  >
                    {d.hora}
                  </text>
                );
              })}
            </g>
          </svg>

          {/* Floating interactive tooltip */}
          {hoveredBar && (
            <div
              className="absolute bg-popover text-popover-foreground border border-border py-1.5 px-2.5 rounded-lg pointer-events-none whitespace-nowrap shadow-xl z-50 transition-all duration-100 flex flex-col items-center gap-0.5"
              style={{
                left: `${(hoveredBar.x / width) * 100}%`,
                top: `${(hoveredBar.y / height) * 100 - 8}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <span className="text-[10px] font-black">
                {hoveredBar.total} {hoveredBar.total === 1 ? "orden" : "órdenes"}
              </span>
              <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-wider">
                {hoveredBar.hora}
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

