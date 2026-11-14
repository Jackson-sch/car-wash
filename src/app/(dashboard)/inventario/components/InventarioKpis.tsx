"use client";

import { useMemo } from "react";
import { Package, AlertTriangle, TrendingDown, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { Insumo } from "./InventarioTable";

interface InventarioKpisProps {
  insumos: Insumo[];
}

export function InventarioKpis({ insumos }: InventarioKpisProps) {
  const stats = useMemo(() => {
    const totalItems = insumos.length;

    let valorTotal = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    insumos.forEach((item) => {
      const st = parseFloat(item.stock || "0");
      const min = parseFloat(item.stockMinimo || "0");
      const costo = parseFloat(item.precioCompra || "0");

      if (st > 0 && costo > 0) {
        valorTotal += st * costo;
      }

      if (st === 0) {
        outOfStockCount++;
      } else if (st <= min) {
        lowStockCount++;
      }
    });

    return {
      totalItems,
      valorTotal,
      lowStockCount,
      outOfStockCount,
      optimosCount: totalItems - lowStockCount - outOfStockCount,
    };
  }, [insumos]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Catálogo Total */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Package className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Catálogo Total
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {stats.totalItems}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.optimosCount} en nivel óptimo
              </span>
            </div>
          </div>
        </div>

        {/* 2. Capital Valorizado */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
            <DollarSign className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block truncate">
              Capital Valorizado
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-cyan-600 dark:text-cyan-400 leading-none">
                {formatCurrency(stats.valorTotal)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                Costo almacén
              </span>
            </div>
          </div>
        </div>

        {/* 3. Bajo Stock Mínimo */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div
            className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${
              stats.lowStockCount > 0
                ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <AlertTriangle className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block truncate ${
                stats.lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"
              }`}
            >
              Bajo Mínimo
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-lg sm:text-xl font-black font-mono leading-none ${
                  stats.lowStockCount > 0 ? "text-amber-600 dark:text-amber-400" : "text-foreground"
                }`}
              >
                {stats.lowStockCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.lowStockCount > 0 ? "Por reponer" : "Nivel estable"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Insumos Agotados */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div
            className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${
              stats.outOfStockCount > 0
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <TrendingDown className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block truncate ${
                stats.outOfStockCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"
              }`}
            >
              Agotados
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-lg sm:text-xl font-black font-mono leading-none ${
                  stats.outOfStockCount > 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"
                }`}
              >
                {stats.outOfStockCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.outOfStockCount > 0 ? "Sin stock activo" : "Sin quiebres"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
