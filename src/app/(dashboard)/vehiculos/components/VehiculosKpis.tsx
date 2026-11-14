"use client";

import { Car, Gauge, Truck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { VehiculoItem } from "../types";

interface VehiculosKpisProps {
  vehiculos: VehiculoItem[];
}

export function VehiculosKpis({ vehiculos }: VehiculosKpisProps) {
  const totalVehiculos = vehiculos.length;

  const sedanesCount = vehiculos.filter(
    (v) => (v.tipo || "").toLowerCase() === "sedan"
  ).length;

  const suvsCamionetasCount = vehiculos.filter((v) => {
    const t = (v.tipo || "").toLowerCase();
    return t === "suv" || t === "pickup" || t === "camion" || t === "furgon";
  }).length;

  const totalOrdenes = vehiculos.reduce((acc, v) => acc + v.totalOrdenes, 0);
  const promedioOrdenes = totalVehiculos > 0 ? (totalOrdenes / totalVehiculos).toFixed(1) : "0.0";

  const sedanesRatio = totalVehiculos > 0 ? Math.round((sedanesCount / totalVehiculos) * 100) : 0;
  const suvsRatio = totalVehiculos > 0 ? Math.round((suvsCamionetasCount / totalVehiculos) * 100) : 0;

  const vehiculosConOrdenes = vehiculos.filter((v) => v.totalOrdenes > 0).length;

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Flota Total */}
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
                {totalVehiculos}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {vehiculosConOrdenes} con órdenes
              </span>
            </div>
          </div>
        </div>

        {/* 2. Sedanes & Ligeros */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Car className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Sedanes & Autos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {sedanesCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {sedanesRatio}% de la flota
              </span>
            </div>
          </div>
        </div>

        {/* 3. SUVs & Camionetas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Truck className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              SUVs & Camionetas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {suvsCamionetasCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {suvsRatio}% del parque
              </span>
            </div>
          </div>
        </div>

        {/* 4. Órdenes Atendidas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Gauge className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Servicios Atendidos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {totalOrdenes}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                Prom. {promedioOrdenes} / auto
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
