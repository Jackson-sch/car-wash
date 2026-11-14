"use client";

import { useMemo, useState } from "react";
import { PieChart as PieIcon, Tag } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formats";
import { useD3 } from "@/lib/hooks/useD3";

interface SalesByCategoryChartProps {
  ventasPorCategoria: { categoria: string; total: number }[];
}

function ChartSkeleton() {
  return (
    <Card className="bg-card border border-border/90 shadow-sm p-5 sm:p-6 rounded-2xl space-y-4">
      <div className="h-3 w-36 bg-muted/40 rounded animate-pulse" />
      <div className="flex items-center justify-center">
        <div className="w-36 h-36 rounded-full bg-muted/20 animate-pulse" />
      </div>
    </Card>
  );
}

export function SalesByCategoryChart({
  ventasPorCategoria,
}: SalesByCategoryChartProps) {
  const d3 = useD3();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSegment, setActiveSegment] = useState<{
    categoria: string;
    total: number;
    porcentaje: number;
    colorBg: string;
    x: number;
    y: number;
  } | null>(null);

  // Paleta de colores distintivos y armoniosos para la UI dark
  const categoryColors = useMemo(
    () => [
      { fill: "fill-sky-400", bg: "bg-sky-400" },
      { fill: "fill-emerald-400", bg: "bg-emerald-400" },
      { fill: "fill-purple-400", bg: "bg-purple-400" },
      { fill: "fill-amber-400", bg: "bg-amber-400" },
      { fill: "fill-indigo-400", bg: "bg-indigo-400" },
      { fill: "fill-rose-400", bg: "bg-rose-400" },
    ],
    []
  );

  const total = useMemo(() => {
    return ventasPorCategoria.reduce((acc, c) => acc + c.total, 0) || 1;
  }, [ventasPorCategoria]);

  // Generador de Pie D3
  const pieData = useMemo(() => {
    if (!d3) return [] as d3.PieArcDatum<{ categoria: string; total: number }>[];
    const pieGenerator = d3
      .pie<{ categoria: string; total: number }>()
      .value((d: { categoria: string; total: number }) => d.total)
      .sort(null);
    return pieGenerator(ventasPorCategoria);
  }, [ventasPorCategoria, d3]);

  // Generador de Arco D3
  const arcGenerator = useMemo(() => {
    if (!d3) return null;
    return d3
      .arc<d3.PieArcDatum<{ categoria: string; total: number }>>()
      .innerRadius(46)
      .outerRadius(68)
      .cornerRadius(4)
      .padAngle(0.04);
  }, [d3]);

  // Leyendas calculadas con montos y porcentajes
  const categoryLegends = useMemo(() => {
    return ventasPorCategoria.map((c, index) => {
      const pct = Math.round((c.total / total) * 100);
      const colors = categoryColors[index % categoryColors.length];
      return {
        categoria: c.categoria,
        total: c.total,
        bg: colors.bg,
        fill: colors.fill,
        pct,
      };
    });
  }, [ventasPorCategoria, total, categoryColors]);

  // Early return solo tras todos los hooks
  if (!d3 || !arcGenerator) return <ChartSkeleton />;

  const handleMouseMove = (
    e: React.MouseEvent<SVGPathElement>,
    slice: d3.PieArcDatum<{ categoria: string; total: number }>,
    index: number
  ) => {
    const rect = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
    if (rect) {
      const pct = Math.round((slice.data.total / total) * 100);
      const colors = categoryColors[index % categoryColors.length];
      setActiveSegment({
        categoria: slice.data.categoria,
        total: slice.data.total,
        porcentaje: pct,
        colorBg: colors.bg,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <Card className="bg-card border border-border/90 shadow-sm p-5 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-visible">
      <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
        <div>
          <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <PieIcon className="size-3.5 text-secondary" />
            Ventas por Categoría
          </h3>
          <span className="text-[10px] text-muted-foreground">Distribución del turno</span>
        </div>
        <span className="text-[11px] font-mono font-extrabold text-foreground px-2 py-0.5 rounded-lg bg-muted border border-border/80">
          {formatCurrency(ventasPorCategoria.reduce((acc, c) => acc + c.total, 0))}
        </span>
      </div>

      {ventasPorCategoria.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground h-[200px]">
          <Tag className="size-8 text-muted-foreground/40 mb-2" />
          Aún no hay ventas registradas en este turno.
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 w-full my-auto">
          {/* D3 Donut Chart */}
          <div className="w-36 h-36 relative shrink-0 flex items-center justify-center">
            <svg
              width="144"
              height="144"
              viewBox="-72 -72 144 144"
              className="overflow-visible select-none"
            >
              <g>
                {pieData.map(
                  (
                    slice: d3.PieArcDatum<{ categoria: string; total: number }>,
                    index: number
                  ) => {
                    const path = arcGenerator(slice);
                    const isHovered = hoveredIndex === index;
                    const colors = categoryColors[index % categoryColors.length];

                    return (
                      <path
                        key={slice.data.categoria}
                        d={path || undefined}
                        className={cn(
                          "transition-all duration-200 cursor-pointer origin-center outline-none",
                          colors.fill,
                          isHovered
                            ? "opacity-100 scale-105 filter drop-shadow(0 0 6px rgba(56,189,248,0.4))"
                            : "opacity-85 hover:opacity-100"
                        )}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseMove={(e) => handleMouseMove(e, slice, index)}
                        onMouseLeave={() => {
                          setHoveredIndex(null);
                          setActiveSegment(null);
                        }}
                      />
                    );
                  }
                )}
              </g>
            </svg>

            {/* Texto Central */}
            <div className="absolute inset-5 bg-card/95 rounded-full flex flex-col items-center justify-center pointer-events-none border border-border/40 shadow-inner">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                Total
              </span>
              <span className="text-[11px] font-black font-mono text-foreground">
                {formatCurrency(ventasPorCategoria.reduce((acc, c) => acc + c.total, 0))}
              </span>
            </div>
          </div>

          {/* Desglose de Categorías Debajo del Donut */}
          <div className="w-full space-y-2 pt-1">
            {categoryLegends.map((leg, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={leg.categoria}
                  className={cn(
                    "flex items-center justify-between text-xs px-3 py-2 rounded-xl border transition-all cursor-pointer",
                    isHovered
                      ? "bg-muted border-secondary/50 scale-[1.01]"
                      : "bg-muted/30 border-border/70 hover:bg-muted/60"
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className={cn("size-2.5 rounded-full shrink-0", leg.bg)} />
                    <span className="font-bold text-foreground truncate text-xs">
                      {leg.categoria}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 font-mono">
                    <span className="font-black text-xs text-foreground">
                      {formatCurrency(leg.total)}
                    </span>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-md bg-background border border-border/80 text-muted-foreground">
                      {leg.pct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tooltip interactivo flotante */}
          {activeSegment && (
            <div
              className="absolute bg-popover text-popover-foreground border border-border p-2.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl z-50 transition-colors duration-100 text-left flex flex-col gap-0.5"
              style={{
                left: `${activeSegment.x + 10}px`,
                top: `${activeSegment.y - 45}px`,
                transform: "translate(0, -50%)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("size-2.5 rounded-full", activeSegment.colorBg)} />
                <span className="text-[10px] font-black uppercase tracking-wider">
                  {activeSegment.categoria}
                </span>
              </div>
              <span className="text-xs font-mono font-bold">
                {formatCurrency(activeSegment.total)}
              </span>
              <span className="text-[9px] text-muted-foreground font-semibold">
                {activeSegment.porcentaje}% de las ventas del turno
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
