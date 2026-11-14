"use client";

import {
  Car,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import Link from "next/link";
import { Card } from "@/components/ui/card";

interface KpiGridProps {
  kpis: {
    ventasHoy: number;
    ordenesActivas: number;
    ordenesEnProceso: number;
    ordenesEnEspera: number;
    ticketPromedio: number;
    insumosBajoStock: number;
    ordenesCompletadasHoy?: number;
    efectivoHoy?: number;
    digitalHoy?: number;
  };
}

export function KpiGrid({ kpis }: KpiGridProps) {
  const tieneVentas = kpis.ventasHoy > 0;
  const completadas = kpis.ordenesCompletadasHoy ?? 0;

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Ventas de Hoy */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <TrendingUp className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate flex items-center gap-1.5">
              Ventas de Hoy
              {tieneVentas && (
                <span className="relative flex h-1.5 w-1.5 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary" />
                </span>
              )}
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {formatCurrency(kpis.ventasHoy)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {tieneVentas
                  ? `S/ ${(kpis.efectivoHoy || 0).toFixed(0)} efec.`
                  : "sin cobros aún"}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Flujo en Patio */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Car className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              En Patio / Bahías
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {kpis.ordenesActivas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {kpis.ordenesEnProceso} lavando • {kpis.ordenesEnEspera} cola
              </span>
            </div>
          </div>
        </div>

        {/* 3. Ticket Promedio */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
            <Sparkles className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider block truncate">
              Ticket Promedio
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {formatCurrency(kpis.ticketPromedio)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                por servicio
              </span>
            </div>
          </div>
        </div>

        {/* 4. Insumos & Stock */}
        <Link
          href="/inventario"
          className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors group/item"
        >
          <div
            className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${
              kpis.insumosBajoStock > 0
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20 animate-pulse"
                : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
            }`}
          >
            {kpis.insumosBajoStock > 0 ? (
              <AlertTriangle className="size-4.5" />
            ) : (
              <CheckCircle2 className="size-4.5" />
            )}
          </div>
          <div className="min-w-0">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block truncate ${
                kpis.insumosBajoStock > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-emerald-600 dark:text-emerald-400"
              }`}
            >
              Insumos & Stock
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-lg sm:text-xl font-black font-mono leading-none ${
                  kpis.insumosBajoStock > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground"
                }`}
              >
                {kpis.insumosBajoStock}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate group-hover/item:text-foreground">
                {kpis.insumosBajoStock > 0 ? "por reponer" : "abastecido"}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </Card>
  );
}
