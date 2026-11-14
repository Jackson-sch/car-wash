"use client";

import { useMemo } from "react";
import { Activity, Car, Timer, DollarSign } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { Orden } from "./OrdenesTable";
import { formatCurrency } from "@/lib/formats";

interface OrdenesKpiCardsProps {
  ordenes: Orden[];
}

function isToday(date: Date | string | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
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
    const todayCompleted = ordenes.filter(
      (o) =>
        (o.estado === "completado" || o.estado === "cobrado") &&
        (isToday(o.updatedAt) || isToday(o.createdAt))
    );
    const targetOrders =
      todayCompleted.length > 0
        ? todayCompleted
        : ordenes.filter((o) => o.estado === "completado" || o.estado === "cobrado");

    if (targetOrders.length === 0) return "—";

    let totalDiffMs = 0;
    let validCount = 0;
    targetOrders.forEach((o) => {
      if (o.createdAt && o.updatedAt) {
        const diff = new Date(o.updatedAt).getTime() - new Date(o.createdAt).getTime();
        if (diff > 0 && diff < 24 * 3600 * 1000) {
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

  // 4. Current Revenue
  const { currentRevenue, todayCobradosCount } = useMemo(() => {
    const cobradosHoy = ordenes.filter(
      (o) => o.estado === "cobrado" && (isToday(o.updatedAt) || isToday(o.createdAt))
    );

    const sum = cobradosHoy.reduce(
      (acc, o) => acc + parseFloat(o.total || "0"),
      0
    );

    return {
      currentRevenue: sum,
      todayCobradosCount: cobradosHoy.length,
    };
  }, [ordenes]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs w-full">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Active Orders */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-600 dark:text-sky-400 shrink-0">
            <Activity className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block truncate">
              Órdenes Activas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-sky-600 dark:text-sky-400 leading-none">
                {activeOrdersCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                en patio / bahías
              </span>
            </div>
          </div>
        </div>

        {/* 2. En Espera */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Car className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              En Espera
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {queueCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {queueCount > 0 ? `~${queueCount * 12}m cola` : "sin cola"}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Promedio Lavado */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
            <Timer className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block truncate">
              Prom. Lavado
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {avgCompletionTimeStr}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                meta: 30m
              </span>
            </div>
          </div>
        </div>

        {/* 4. Ingresos de Hoy */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <DollarSign className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Ingresos de Hoy
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(currentRevenue)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {todayCobradosCount} {todayCobradosCount === 1 ? "cobrada" : "cobradas"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
