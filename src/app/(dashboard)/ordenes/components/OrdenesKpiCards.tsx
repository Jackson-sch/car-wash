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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
      {/* Active Orders */}
      <div className="bento-card p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Órdenes Activas
          </span>
          <div className="p-2 rounded-xl bg-secondary/10 dark:bg-secondary/20 text-secondary border border-secondary/20 shrink-0">
            <Activity className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">{activeOrdersCount}</p>
          <p className="text-emerald-500 font-bold text-[10px] flex items-center gap-0.5 mt-1">
            <ArrowUpRight className="h-3 w-3" />
            +12% vs. ayer
          </p>
        </div>
      </div>

      {/* Vehicles in Queue */}
      <div className="bento-card p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Vehículos en Espera
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <Car className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">{queueCount}</p>
          <p className="text-muted-foreground font-bold text-[10px] mt-1">
            Espera prom: 12 min
          </p>
        </div>
      </div>

      {/* Avg. Completion Time */}
      <div className="bento-card p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Tiempo Prom. Lavado
          </span>
          <div className="p-2 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 border border-sky-500/20 shrink-0">
            <Timer className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">{avgCompletionTimeStr}</p>
          <p className="text-muted-foreground font-bold text-[10px] mt-1">
            Tiempo meta: 30m
          </p>
        </div>
      </div>

      {/* Current Revenue */}
      <div className="bento-card p-5 rounded-2xl border-l-4 border-l-secondary flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-xs transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Ingresos de Caja
          </span>
          <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 border border-violet-500/20 shrink-0">
            <DollarSign className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">
            {formatCurrency(currentRevenue)}
          </p>
          <p className="text-muted-foreground font-bold text-[10px] mt-1">
            Meta del día: S/ 3,200
          </p>
        </div>
      </div>
    </div>
  );
}
