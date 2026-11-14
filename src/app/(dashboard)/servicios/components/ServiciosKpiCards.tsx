"use client";

import { Layers, Coins, Clock, FlaskConical } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { Servicio } from "./ServiciosGrid";

interface ServiciosKpiCardsProps {
  servicios: Servicio[];
}

export function ServiciosKpiCards({ servicios }: ServiciosKpiCardsProps) {
  const totalActivos = servicios.length;
  const precioPromedio =
    servicios.length > 0
      ? servicios.reduce((acc, curr) => acc + parseFloat(curr.precio || "0"), 0) / servicios.length
      : 0;
  const tiempoPromedio =
    servicios.length > 0
      ? servicios.reduce((acc, curr) => acc + (curr.duracionMin || 0), 0) / servicios.length
      : 0;

  const conReceta = servicios.filter((s) => (s.totalInsumosReceta ?? 0) > 0);
  const coberturaReceta =
    servicios.length > 0 ? Math.round((conReceta.length / servicios.length) * 100) : 0;

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Total Servicios */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Layers className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Catálogo
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {totalActivos}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                servicios activos
              </span>
            </div>
          </div>
        </div>

        {/* 2. Precio Promedio */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Coins className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Tarifa Promedio
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(precioPromedio)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                por servicio
              </span>
            </div>
          </div>
        </div>

        {/* 3. Duración Promedio */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Clock className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Duración Promedio
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {Math.round(tiempoPromedio)}m
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                estimado
              </span>
            </div>
          </div>
        </div>

        {/* 4. Recetas Químicas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <FlaskConical className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block truncate">
              Recetas de Insumos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-purple-600 dark:text-purple-400 leading-none">
                {conReceta.length}/{totalActivos}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {coberturaReceta}% cubierto
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
