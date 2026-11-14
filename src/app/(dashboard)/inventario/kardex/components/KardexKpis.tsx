"use client";

import { useMemo } from "react";
import { BookOpen, ArrowUpCircle, ArrowDownCircle, Settings2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { KardexMovimiento } from "../types";

interface KardexKpisProps {
  movimientos: KardexMovimiento[];
}

export function KardexKpis({ movimientos }: KardexKpisProps) {
  const stats = useMemo(() => {
    let entradasCant = 0;
    let entradasVal = 0;
    let salidasCant = 0;
    let salidasVal = 0;
    let ajustesCount = 0;

    movimientos.forEach((m) => {
      if (m.tipo === "entrada") {
        entradasCant += m.cantidad;
        entradasVal += m.valorizadoAprox;
      } else if (m.tipo === "salida") {
        salidasCant += m.cantidad;
        salidasVal += m.valorizadoAprox;
      } else if (m.tipo === "ajuste") {
        ajustesCount++;
      }
    });

    return {
      total: movimientos.length,
      entradasCant,
      entradasVal,
      salidasCant,
      salidasVal,
      ajustesCount,
    };
  }, [movimientos]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Total Movimientos */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <BookOpen className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Movimientos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {stats.total}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                operaciones registradas
              </span>
            </div>
          </div>
        </div>

        {/* 2. Entradas (Compras / Ingresos) */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <ArrowUpCircle className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Entradas a Stock
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                +{stats.entradasCant.toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {formatCurrency(stats.entradasVal)}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Salidas (Consumo por Órdenes) */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <ArrowDownCircle className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block truncate">
              Salidas & Consumo
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400 leading-none">
                -{stats.salidasCant.toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {formatCurrency(stats.salidasVal)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Ajustes / Correcciones */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Settings2 className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Ajustes Físicos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {stats.ajustesCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                auditorías de saldo
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
