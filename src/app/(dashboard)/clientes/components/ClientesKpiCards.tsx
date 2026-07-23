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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Card 1: Total Clientes */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-secondary/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Total de Clientes
            </span>
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              {totalClientes} <span className="text-sm font-medium text-muted-foreground">clientes</span>
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-secondary/10 text-secondary transition-transform group-hover:scale-110 duration-300">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
          <span>Clientes registrados en el sistema</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card 2: Vehículos Asociados */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-blue-500/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Vehículos Asociados
            </span>
            <h3 className="text-3xl font-extrabold text-blue-500 tracking-tight">
              {totalVehiculosRegistrados} <span className="text-sm font-medium text-muted-foreground">autos</span>
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-blue-500/10 text-blue-500 transition-transform group-hover:scale-110 duration-300">
            <Car className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
          <span>Vehículos vinculados a propietarios</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card 3: Puntos Activos */}
      <div className="relative group overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm transition-colors duration-300 hover:shadow-md hover:border-amber-500/50">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Puntos Activos
            </span>
            <h3 className="text-3xl font-extrabold text-amber-500 tracking-tight">
              {totalCirculationPoints} <span className="text-sm font-medium text-muted-foreground">pts</span>
            </h3>
          </div>
          <div className="p-3.5 rounded-xl bg-amber-500/10 text-amber-500 transition-transform group-hover:scale-110 duration-300">
            <Gift className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
          <span>Puntos circulantes por canjear</span>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Card 4: Programa de Puntos */}
      <Card className="p-6 border-amber-500/20 bg-card shadow-sm hover:border-amber-500/40 transition-colors flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:scale-110 duration-300">
          <Award className="h-24 w-24 text-amber-500" />
        </div>
        <div className="space-y-2.5 relative z-10">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-500 animate-pulse" />
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">
              Programa de Puntos
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Fidelización automática para clientes. Acumula y canjea en cada servicio de autolavado.
          </p>
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="bg-muted/30 border border-border rounded-lg p-2 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Acumulación</span>
              <span className="text-xs font-extrabold mt-0.5">{formatCurrency(10)} = 1 pt</span>
            </div>
            <div className="bg-muted/30 border border-border rounded-lg p-2 flex flex-col justify-center">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Canje / Descuento</span>
              <span className="text-xs font-extrabold text-amber-500 mt-0.5">1 pt = {formatCurrency(0.20)}</span>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-linear-to-r from-amber-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Card>
    </div>
  );
}
