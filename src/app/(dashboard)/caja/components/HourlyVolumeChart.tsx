"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { useD3 } from "@/lib/hooks/useD3";

interface HourlyVolumeChartProps {
  ventasPorHora: { hora: string; total: number }[];
}

// SVG dimensions — estables fuera del componente para evitar recreaciones en cada render
const CHART_WIDTH = 400;
const CHART_HEIGHT = 180;
const CHART_MARGIN = { top: 15, right: 15, bottom: 25, left: 25 };

function ChartSkeleton() {
  return (
    <Card className="bg-card border-border shadow-sm p-6 flex flex-col justify-between relative overflow-visible">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Volumen de Órdenes por Hora
      </h3>
      <div className="h-[180px] flex items-center justify-center">
        <div className="h-28 w-full bg-muted/20 rounded-lg animate-pulse" />
      </div>
    </Card>
  );
}

export function HourlyVolumeChart({ ventasPorHora }: HourlyVolumeChartProps) {
  const d3 = useD3();
  const [hoveredBar, setHoveredBar] = useState<{
    hora: string;
    total: number;
    x: number;
    y: number;
  } | null>(null);

  // All useMemo hooks must be BEFORE any early return — React Rules of Hooks
  const chartData = useMemo(() => ventasPorHora.slice(-6), [ventasPorHora]);

  const xScale = useMemo(() => {
    if (!d3) return null;
    return d3
      .scaleBand()
      .domain(chartData.map((d) => d.hora))
      .range([CHART_MARGIN.left, CHART_WIDTH - CHART_MARGIN.right])
      .padding(0.35);
  }, [chartData, d3]);

  const yScale = useMemo(() => {
    if (!d3) return null;
    const maxVal = d3.max(chartData, (d: { hora: string; total: number }) => d.total) || 5;
    const domainMax = Math.ceil(maxVal / 4) * 4 || 4;
    return d3
      .scaleLinear()
      .domain([0, domainMax])
      .range([CHART_HEIGHT - CHART_MARGIN.bottom, CHART_MARGIN.top]);
  }, [chartData, d3]);

  const yTicks = useMemo(() => {
    if (!yScale) return [];
    return yScale.ticks(4).filter((t: number) => Number.isInteger(t));
  }, [yScale]);

  // Early return after ALL hooks are called — guard also proves xScale/yScale non-null to TS
  if (!d3 || !xScale || !yScale) return <ChartSkeleton />;

  return (
    <Card className="bg-card border-border shadow-sm p-6 flex flex-col justify-between relative overflow-visible">
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
            viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
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
              {yTicks.map((tick: number) => (
                <g key={tick} className="transition-all duration-300">
                  <line
                    x1={CHART_MARGIN.left}
                    x2={CHART_WIDTH - CHART_MARGIN.right}
                    y1={yScale(tick)}
                    y2={yScale(tick)}
                    stroke="currentColor"
                    strokeWidth={1}
                    strokeDasharray={tick === 0 ? undefined : "3 3"}
                  />
                  {tick > 0 && (
                    <text
                      x={CHART_MARGIN.left - 6}
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
              {chartData.map((d) => {
                const x = xScale(d.hora);
                const y = yScale(d.total);
                if (x === undefined) return null;

                const barWidth = xScale.bandwidth();
                const barHeight = CHART_HEIGHT - CHART_MARGIN.bottom - y;

                return (
                  <g
                    key={d.hora}
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
                      y={CHART_MARGIN.top}
                      width={barWidth + 8}
                      height={CHART_HEIGHT - CHART_MARGIN.bottom - CHART_MARGIN.top}
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
              {chartData.map((d) => {
                const x = xScale(d.hora);
                if (x === undefined) return null;
                return (
                  <text
                    key={d.hora}
                    x={x + xScale.bandwidth() / 2}
                    y={CHART_HEIGHT - 8}
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
                left: `${(hoveredBar.x / CHART_WIDTH) * 100}%`,
                top: `${(hoveredBar.y / CHART_HEIGHT) * 100 - 8}%`,
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
