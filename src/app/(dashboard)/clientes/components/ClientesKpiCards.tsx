"use client";

import { Users, Car, Gift, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { Cliente } from "./ClientesTable";

interface ClientesKpiCardsProps {
  clientesList: Cliente[];
}

export function ClientesKpiCards({ clientesList }: ClientesKpiCardsProps) {
  const totalClientes = clientesList.length;
  const totalCirculationPoints = clientesList.reduce((acc, curr) => acc + curr.totalPuntos, 0);
  const totalVehiculosRegistrados = clientesList.reduce((acc, curr) => acc + curr.totalVehiculos, 0);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Total Clientes */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Users className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Directorio Clientes
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {totalClientes}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                registrados
              </span>
            </div>
          </div>
        </div>

        {/* 2. Vehículos Asociados */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Car className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Flota Vinculada
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {totalVehiculosRegistrados}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                vehículos
              </span>
            </div>
          </div>
        </div>

        {/* 3. Puntos Activos */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Gift className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Puntos Activos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {totalCirculationPoints}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                pts circulantes
              </span>
            </div>
          </div>
        </div>

        {/* 4. Programa de Fidelización */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Award className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Canje de Puntos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(0.20)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                / pt (S/ 10 = 1 pt)
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
