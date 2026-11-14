"use client";

import { Tag, Gift, TrendingUp, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { CuponItem } from "../types";

interface CuponesKpisProps {
  cupones: CuponItem[];
}

export function CuponesKpis({ cupones }: CuponesKpisProps) {
  const totalCupones = cupones.length;
  const activos = cupones.filter((c) => c.activo).length;
  const totalUsos = cupones.reduce((acc, c) => acc + (c.usos?.length || 0), 0);

  // Estimado de ahorro otorgado a clientes:
  const ahorroEstimado = cupones.reduce((acc, c) => {
    const usosCount = c.usos?.length || 0;
    if (usosCount === 0) return acc;
    if (c.tipoDescuento === "fijo") {
      return acc + usosCount * c.valorDescuento;
    } else {
      const ticketPromedio = c.compraMinima ? Math.max(c.compraMinima, 45) : 45;
      return acc + usosCount * (ticketPromedio * (c.valorDescuento / 100));
    }
  }, 0);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Total Cupones */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Tag className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Total Cupones
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {totalCupones}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                en catálogo
              </span>
            </div>
          </div>
        </div>

        {/* 2. Campañas Activas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Gift className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate flex items-center gap-1">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              Campañas Activas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {activos}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                vigentes en caja
              </span>
            </div>
          </div>
        </div>

        {/* 3. Canjes Realizados */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <TrendingUp className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Canjes Realizados
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {totalUsos}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                tickets aplicados
              </span>
            </div>
          </div>
        </div>

        {/* 4. Ahorro Otorgado */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Sparkles className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Ahorro Otorgado
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {formatCurrency(ahorroEstimado)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                fidelización
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
