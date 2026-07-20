"use client";

import { Layers, Coins, Clock } from "lucide-react";
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Card 1: Total Servicios */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-secondary/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total de Servicios
            </span>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              {totalActivos} <span className="text-sm font-medium text-muted-foreground">servicios</span>
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110 duration-300">
            <Layers className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          <span>Tipos de lavado y mantenimiento</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card 2: Precio Promedio */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-emerald-500/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Precio Promedio
            </span>
            <h3 className="text-3xl font-extrabold text-emerald-500 tracking-tight">
              {formatCurrency(precioPromedio)}
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-emerald-500/10 text-emerald-500 transition-transform group-hover:scale-110 duration-300">
            <Coins className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Costo promedio de lavado base</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card 3: Duración Promedio */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-blue-500/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Duración Promedio
            </span>
            <h3 className="text-3xl font-extrabold text-blue-500 tracking-tight">
              {Math.round(tiempoPromedio)} <span className="text-sm font-medium text-muted-foreground">min</span>
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110 duration-300">
            <Clock className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Tiempo estimado de servicio</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
}
