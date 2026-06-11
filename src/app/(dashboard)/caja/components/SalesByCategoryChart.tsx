import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formats";
import * as d3 from "d3";

interface SalesByCategoryChartProps {
  ventasPorCategoria: { categoria: string; total: number }[];
}

export function SalesByCategoryChart({
  ventasPorCategoria,
}: SalesByCategoryChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [activeSegment, setActiveSegment] = useState<{
    categoria: string;
    total: number;
    porcentaje: number;
    colorBg: string;
    x: number;
    y: number;
  } | null>(null);

  const categoryColors = useMemo(() => [
    { fill: "fill-blue-600 dark:fill-blue-400", bg: "bg-blue-600 dark:bg-blue-400" },
    { fill: "fill-blue-500 dark:fill-blue-300", bg: "bg-blue-500 dark:bg-blue-300" },
    { fill: "fill-blue-700 dark:fill-blue-500", bg: "bg-blue-700 dark:bg-blue-500" },
    { fill: "fill-blue-400 dark:fill-blue-600", bg: "bg-blue-400 dark:bg-blue-600" },
    { fill: "fill-blue-800 dark:fill-blue-700", bg: "bg-blue-800 dark:bg-blue-700" },
    { fill: "fill-blue-300 dark:fill-blue-200", bg: "bg-blue-300 dark:bg-blue-200" },
  ], []);

  const total = useMemo(() => {
    return ventasPorCategoria.reduce((acc, c) => acc + c.total, 0) || 1;
  }, [ventasPorCategoria]);

  // D3 Pie Generator
  const pieData = useMemo(() => {
    const pieGenerator = d3
      .pie<{ categoria: string; total: number }>()
      .value((d) => d.total)
      .sort(null);
    return pieGenerator(ventasPorCategoria);
  }, [ventasPorCategoria]);

  // D3 Arc Generator
  const arcGenerator = useMemo(() => {
    return d3
      .arc<d3.PieArcDatum<{ categoria: string; total: number }>>()
      .innerRadius(48)
      .outerRadius(72)
      .cornerRadius(4)
      .padAngle(0.04);
  }, []);

  // Generar leyendas con porcentaje para el gráfico
  const categoryLegends = useMemo(() => {
    return ventasPorCategoria.map((c, index) => {
      const pct = Math.round((c.total / total) * 100);
      const colors = categoryColors[index % categoryColors.length];
      return {
        categoria: c.categoria,
        total: c.total,
        label: `${c.categoria} (${pct}%)`,
        bg: colors.bg,
        fill: colors.fill,
        pct,
      };
    });
  }, [ventasPorCategoria, total, categoryColors]);

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
    <Card className="bg-transparent border-border shadow-sm p-6 flex flex-col justify-between relative overflow-visible">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">
        Ventas por Categoría
      </h3>

      {ventasPorCategoria.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-xs text-muted-foreground h-[200px]">
          Aún no hay ventas registradas en este turno.
        </div>
      ) : (
        <div className="flex flex-col items-center justify-start gap-4 h-auto min-h-[220px] relative">
          {/* D3 SVG Donut Chart */}
          <div className="w-36 h-36 relative shrink-0">
            <svg
              width="144"
              height="144"
              viewBox="-72 -72 144 144"
              className="overflow-visible select-none"
            >
              <g>
                {pieData.map((slice, index) => {
                  const path = arcGenerator(slice);
                  const isHovered = hoveredIndex === index;
                  const colors = categoryColors[index % categoryColors.length];

                  return (
                    <path
                      key={index}
                      d={path || undefined}
                      className={cn(
                        "transition-all duration-300 cursor-pointer origin-center outline-none",
                        colors.fill,
                        isHovered ? "opacity-100 scale-105" : "opacity-90 hover:opacity-100"
                      )}
                      onMouseEnter={() => {
                        setHoveredIndex(index);
                      }}
                      onMouseMove={(e) => handleMouseMove(e, slice, index)}
                      onMouseLeave={() => {
                        setHoveredIndex(null);
                        setActiveSegment(null);
                      }}
                    />
                  );
                })}
              </g>
            </svg>

            {/* Center static text */}
            <div className="absolute inset-5 bg-card rounded-full flex flex-col items-center justify-center shadow-inner pointer-events-none">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider">
                Ventas
              </span>
              <span className="text-[11px] font-extrabold text-foreground">
                {formatCurrency(ventasPorCategoria.reduce((acc, c) => acc + c.total, 0))}
              </span>
            </div>
          </div>

          {/* Legends */}
          <div className="flex flex-wrap justify-center gap-2 max-h-[140px] overflow-y-auto w-full">
            {categoryLegends.map((leg, index) => {
              const isHovered = hoveredIndex === index;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-1.5 text-xs cursor-pointer transition-all duration-200 p-1.5 rounded-md border",
                    isHovered ? "bg-accent border-border scale-[1.02]" : "border-transparent hover:bg-accent/50 hover:border-border/50"
                  )}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <span
                    className={cn("w-2.5 h-2.5 rounded-full shrink-0", leg.bg)}
                  ></span>
                  <span className="font-semibold text-foreground truncate max-w-[120px]">
                    {leg.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive Floating Tooltip inside SVG container */}
          {activeSegment && (
            <div
              className="absolute bg-popover text-popover-foreground border border-border p-2.5 rounded-xl pointer-events-none whitespace-nowrap shadow-xl z-50 transition-all duration-100 text-left flex flex-col gap-0.5"
              style={{
                left: `${activeSegment.x + 10}px`,
                top: `${activeSegment.y - 45}px`,
                transform: "translate(0, -50%)",
              }}
            >
              <div className="flex items-center gap-1.5">
                <span className={cn("w-2.5 h-2.5 rounded-full", activeSegment.colorBg)}></span>
                <span className="text-[10px] font-black uppercase tracking-wider">{activeSegment.categoria}</span>
              </div>
              <span className="text-xs font-bold">{formatCurrency(activeSegment.total)}</span>
              <span className="text-[9px] text-muted-foreground font-semibold">{activeSegment.porcentaje}% del total</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

