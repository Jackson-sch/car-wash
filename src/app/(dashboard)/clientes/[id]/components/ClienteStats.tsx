"use client";

import { DollarSign, CheckCircle2, Car, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { ClienteStatsData } from "../types";

interface ClienteStatsProps {
  stats: ClienteStatsData;
}

export function ClienteStats({ stats }: ClienteStatsProps) {
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Inversión Total Gastada */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <DollarSign className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Consumo Histórico
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(stats.totalGastado)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                en servicios
              </span>
            </div>
          </div>
        </div>

        {/* 2. Órdenes / Visitas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Servicios Atendidos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {stats.ordenesCompletadas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                de {stats.totalOrdenes} órdenes
              </span>
            </div>
          </div>
        </div>

        {/* 3. Flota Vehicular */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Car className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Flota Registrada
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {stats.totalVehiculos}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.totalVehiculos === 1 ? "vehículo" : "vehículos"}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Puntos de Lealtad */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Gift className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Puntos Circulantes
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {stats.totalPuntos} pts
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                Canje: {formatCurrency(stats.valorPuntosSoles)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
