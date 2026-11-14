"use client";

import { useMemo } from "react";
import { Package, Sparkles, TrendingUp, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { PaqueteItem, ServicioOption } from "./types";

interface PaquetesKpisProps {
  paquetes: PaqueteItem[];
  servicios?: ServicioOption[];
}

export function PaquetesKpis({ paquetes, servicios = [] }: PaquetesKpisProps) {
  const stats = useMemo(() => {
    const totalPaquetes = paquetes.length;
    const activosList = paquetes.filter((p) => p.activo);
    const activos = activosList.length;

    const priceMap = new Map<string, number>();
    const durMap = new Map<string, number>();
    servicios.forEach((s) => {
      priceMap.set(s.id, parseFloat(s.precio) || 0);
      durMap.set(s.id, s.duracionMin ?? 30);
    });

    const baseList = activosList.length > 0 ? activosList : paquetes;
    const promedioCombo =
      baseList.length > 0
        ? baseList.reduce((acc, p) => acc + (parseFloat(p.precio) || 0), 0) / baseList.length
        : 0;

    let totalSavingsSoles = 0;
    let totalSavingsPct = 0;
    let combosWithSavings = 0;
    let totalServiciosIncluidos = 0;
    let totalDuracionMin = 0;

    baseList.forEach((p) => {
      const regularPrice = p.servicios.reduce((acc, s) => acc + (priceMap.get(s.id) || 0), 0);
      const comboPrice = parseFloat(p.precio) || 0;
      const diff = regularPrice - comboPrice;
      if (regularPrice > 0 && diff > 0) {
        totalSavingsSoles += diff;
        totalSavingsPct += (diff / regularPrice) * 100;
        combosWithSavings++;
      }
      totalServiciosIncluidos += p.servicios.length;
      totalDuracionMin += p.servicios.reduce((acc, s) => acc + (durMap.get(s.id) ?? 30), 0);
    });

    const ahorroPromedioSoles = combosWithSavings > 0 ? totalSavingsSoles / combosWithSavings : 0;
    const ahorroPromedioPct = combosWithSavings > 0 ? Math.round(totalSavingsPct / combosWithSavings) : 0;
    const promedioServicios =
      baseList.length > 0 ? (totalServiciosIncluidos / baseList.length).toFixed(1) : "0";
    const duracionPromedio =
      baseList.length > 0 ? Math.round(totalDuracionMin / baseList.length) : 0;

    return {
      totalPaquetes,
      activos,
      promedioCombo,
      ahorroPromedioSoles,
      ahorroPromedioPct,
      promedioServicios,
      duracionPromedio,
    };
  }, [paquetes, servicios]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-border/50">
        {/* 1. Catálogo de Combos */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Package className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Catálogo de Combos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {stats.totalPaquetes}
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
                {stats.activos} activos
              </span>
            </div>
          </div>
        </div>

        {/* 2. Ticket Promedio Combo */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors border-l border-border/50 lg:border-l-0">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <TrendingUp className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Tarifa Promedio Combo
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {formatCurrency(stats.promedioCombo)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                por paquete
              </span>
            </div>
          </div>
        </div>

        {/* 3. Ahorro Promedio al Cliente */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Sparkles className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Ahorro Promedio Cliente
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {stats.ahorroPromedioPct}% OFF
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {formatCurrency(stats.ahorroPromedioSoles)} dcto
              </span>
            </div>
          </div>
        </div>

        {/* 4. Composición Media */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors border-l border-border/50 lg:border-l-0">
          <div className="size-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shrink-0">
            <Layers className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider block truncate">
              Composición Media
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {stats.promedioServicios}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                servicios (~{stats.duracionPromedio} min)
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
