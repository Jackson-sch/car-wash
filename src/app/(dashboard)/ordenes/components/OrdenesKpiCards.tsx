"use client";

import { useMemo } from "react";
import { Activity, Car, Timer, DollarSign, ArrowUpRight } from "lucide-react";
import type { Orden } from "./OrdenesTable";
import { formatCurrency } from "@/lib/formats";

interface OrdenesKpiCardsProps {
  ordenes: Orden[];
}

export function OrdenesKpiCards({ ordenes }: OrdenesKpiCardsProps) {
  // 1. Active Orders (pendiente, en_proceso, completado)
  const activeOrdersCount = useMemo(() => {
    return ordenes.filter(
      (o) => o.estado === "pendiente" || o.estado === "en_proceso" || o.estado === "completado"
    ).length;
  }, [ordenes]);

  // 2. Vehicles in Queue (pendiente)
  const queueCount = useMemo(() => {
    return ordenes.filter((o) => o.estado === "pendiente").length;
  }, [ordenes]);

  // 3. Avg. Completion Time
  const avgCompletionTimeStr = useMemo(() => {
    const completed = ordenes.filter(
      (o) => o.estado === "completado" || o.estado === "cobrado"
    );
    if (completed.length === 0) return "—";

    let totalDiffMs = 0;
    let validCount = 0;
    completed.forEach((o) => {
      if (o.createdAt && o.updatedAt) {
        const diff = new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime();
        if (diff > 0) {
          totalDiffMs += diff;
          validCount++;
        }
      }
    });

    if (validCount === 0) return "—";
    const avgMins = Math.round(totalDiffMs / validCount / 1000 / 60);
    
    if (avgMins >= 60) {
      const hrs = Math.floor(avgMins / 60);
      const mins = avgMins % 60;
      return `${hrs}h ${mins}m`;
    }
    return `${avgMins}m`;
  }, [ordenes]);

  // 4. Current Revenue (estado === cobrado)
  const currentRevenue = useMemo(() => {
    return ordenes
      .filter((o) => o.estado === "cobrado")
      .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);
  }, [ordenes]);

  const metaRevenue = 3200;
  const pctMeta = Math.round((currentRevenue / metaRevenue) * 100);

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 w-full">
      {/* Active Orders */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-card/85 backdrop-blur-md border border-border/70 hover:border-sky-500/30 shadow-xs flex flex-col justify-between transition-all duration-300 group overflow-hidden">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground/80">
              Órdenes Activas
            </span>
            <p className="text-xs text-muted-foreground/60 hidden sm:block">En patio o bahías</p>
          </div>
          <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-mono font-black text-foreground tracking-tight">
            {activeOrdersCount}
          </p>
          <div className="text-emerald-500 font-bold text-[11px] flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="h-3.5 w-3.5" />
            <span>Turno activo en curso</span>
          </div>
        </div>
      </div>

      {/* Vehicles in Queue */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-card/85 backdrop-blur-md border border-border/70 hover:border-amber-500/30 shadow-xs flex flex-col justify-between transition-all duration-300 group overflow-hidden">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground/80">
              En Espera
            </span>
            <p className="text-xs text-muted-foreground/60 hidden sm:block">Por ingresar a bahía</p>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Car className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-mono font-black text-foreground tracking-tight">
            {queueCount}
          </p>
          <p className="text-muted-foreground font-semibold text-[11px] mt-1 truncate">
            {queueCount > 0 ? `Demora estimada ~${queueCount * 12}m` : "Sin espera acumulada"}
          </p>
        </div>
      </div>

      {/* Avg. Completion Time */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-card/85 backdrop-blur-md border border-border/70 hover:border-indigo-500/30 shadow-xs flex flex-col justify-between transition-all duration-300 group overflow-hidden">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground/80">
              Prom. Lavado
            </span>
            <p className="text-xs text-muted-foreground/60 hidden sm:block">Meta: 30 minutos</p>
          </div>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 shrink-0">
            <Timer className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          {avgCompletionTimeStr === "—" ? (
            <p className="text-lg sm:text-xl font-bold text-muted-foreground/60 tracking-tight py-1">
              En medición hoy
            </p>
          ) : (
            <p className="text-2xl sm:text-3xl font-mono font-black text-foreground tracking-tight">
              {avgCompletionTimeStr}
            </p>
          )}
          <p className="text-muted-foreground font-semibold text-[11px] mt-1 truncate">
            Tiempo objetivo: 30m
          </p>
        </div>
      </div>

      {/* Current Revenue */}
      <div className="relative p-4 sm:p-5 rounded-2xl bg-card/85 backdrop-blur-md border border-border/70 hover:border-emerald-500/30 shadow-xs flex flex-col justify-between transition-all duration-300 group overflow-hidden">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground/80">
              Ingresos de Hoy
            </span>
            <p className="text-xs text-muted-foreground/60 hidden sm:block">Órdenes cobradas</p>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-2xl sm:text-3xl font-mono font-black text-foreground tracking-tight">
            {formatCurrency(currentRevenue)}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <span className="text-emerald-500 font-bold text-[11px]">
              {pctMeta}%
            </span>
            <span className="text-muted-foreground/70 text-[10px] truncate">
              de meta S/ 3,200
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
