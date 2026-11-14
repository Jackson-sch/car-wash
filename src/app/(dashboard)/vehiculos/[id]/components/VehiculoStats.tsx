"use client";

import { ClipboardList, DollarSign, Gauge, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Card } from "@/components/ui/card";
import type { OrdenItem } from "../types";

interface VehiculoStatsProps {
  ordenes: OrdenItem[];
  totalGastado: number;
  ordenesActivas: number;
  ultimaOrden: OrdenItem | undefined;
}

export function VehiculoStats({
  ordenes,
  totalGastado,
  ordenesActivas,
  ultimaOrden,
}: VehiculoStatsProps) {
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Total Órdenes */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
            <ClipboardList className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Historial de Órdenes
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {ordenes.length}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                servicios realizados
              </span>
            </div>
          </div>
        </div>

        {/* 2. Total Gastado */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <DollarSign className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Total Invertido
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(totalGastado)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                en servicios
              </span>
            </div>
          </div>
        </div>

        {/* 3. Órdenes Activas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Gauge className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              En Bahía Hoy
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {ordenesActivas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {ordenesActivas > 0 ? "en proceso" : "ninguna activa"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Última Visita */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
            <Calendar className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block truncate">
              Última Visita
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-sm sm:text-base font-extrabold text-foreground leading-none truncate">
                {ultimaOrden?.createdAt ? formatDate(ultimaOrden.createdAt) : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
