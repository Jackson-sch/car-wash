"use client";

import { ClipboardList, DollarSign, Gauge, Calendar } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import type { OrdenItem } from "../types";

interface VehiculoStatsProps {
  ordenes: OrdenItem[];
  totalGastado: number;
  ordenesActivas: number;
  ultimaOrden: OrdenItem | undefined;
}

export function VehiculoStats({ ordenes, totalGastado, ordenesActivas, ultimaOrden }: VehiculoStatsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Orders */}
      <div className="group relative overflow-hidden bg-card/65 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-xs hover:border-indigo-500/35 hover:shadow-md transition-all duration-300 flex items-center justify-between">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            Total Órdenes
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {ordenes.length}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 group-hover:scale-110 group-hover:bg-indigo-500/20 transition-all duration-300">
          <ClipboardList className="h-6 w-6" />
        </div>
        <div className="absolute right-0 bottom-0 h-16 w-16 bg-indigo-500/3 blur-2xl rounded-full" />
      </div>

      {/* Total Spent */}
      <div className="group relative overflow-hidden bg-card/65 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-xs hover:border-emerald-500/35 hover:shadow-md transition-all duration-300 flex items-center justify-between">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            Total Gastado
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(totalGastado)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
          <DollarSign className="h-6 w-6" />
        </div>
        <div className="absolute right-0 bottom-0 h-16 w-16 bg-emerald-500/3 blur-2xl rounded-full" />
      </div>

      {/* Active Orders */}
      <div className="group relative overflow-hidden bg-card/65 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-xs hover:border-amber-500/35 hover:shadow-md transition-all duration-300 flex items-center justify-between">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            Órdenes Activas
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400 tracking-tight">
            {ordenesActivas}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400 group-hover:scale-110 group-hover:bg-amber-500/20 transition-all duration-300">
          <Gauge className="h-6 w-6" />
        </div>
        <div className="absolute right-0 bottom-0 h-16 w-16 bg-amber-500/3 blur-2xl rounded-full" />
      </div>

      {/* Last Visit */}
      <div className="group relative overflow-hidden bg-card/65 backdrop-blur-md p-5 rounded-2xl border border-border/80 shadow-xs hover:border-sky-500/35 hover:shadow-md transition-all duration-300 flex items-center justify-between">
        <div className="space-y-1.5 z-10">
          <span className="text-[10px] font-bold text-muted-foreground tracking-wider uppercase">
            {ultimaOrden ? "Última Visita" : "Sin Actividad"}
          </span>
          <div className="text-sm sm:text-base font-extrabold text-foreground tracking-tight mt-1">
            {ultimaOrden?.createdAt ? formatDate(ultimaOrden.createdAt) : "—"}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 dark:text-sky-400 group-hover:scale-110 group-hover:bg-sky-500/20 transition-all duration-300">
          <Calendar className="h-6 w-6" />
        </div>
        <div className="absolute right-0 bottom-0 h-16 w-16 bg-sky-500/3 blur-2xl rounded-full" />
      </div>
    </div>
  );
}
