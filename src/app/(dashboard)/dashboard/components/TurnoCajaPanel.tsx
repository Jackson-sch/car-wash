"use client";

import { AlertTriangle, Wallet, ArrowRight, ShieldCheck, Clock, Zap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formats";

interface TurnoCajaSimple {
  id: string;
  montoInicial: string;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  totalVentasEfectivo: number;
  totalVentasEstimado: number;
}

interface TurnoCajaPanelProps {
  turnoActivo: TurnoCajaSimple | null;
}

export function TurnoCajaPanel({ turnoActivo }: TurnoCajaPanelProps) {
  const montoInicial = turnoActivo ? parseFloat(turnoActivo.montoInicial) : 0;
  const totalEstimado = turnoActivo ? montoInicial + turnoActivo.totalVentasEfectivo : 0;
  const ventasDigitales = turnoActivo ? Math.max(0, turnoActivo.totalVentasEstimado - turnoActivo.totalVentasEfectivo) : 0;

  return (
    <div className="space-y-4">
      {/* 1. CAJA STATUS CARD */}
      <div className="p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs space-y-4 hover:border-secondary/40 transition-all duration-300">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="h-4 w-4 text-secondary" />
            Estado de Caja
          </h3>
          {turnoActivo ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              En línea
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/25">
              Cerrada
            </span>
          )}
        </div>

        {turnoActivo ? (
          <>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/60">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold shrink-0 shadow-xs">
                {turnoActivo.nombreEmpleado.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-foreground truncate">
                    {turnoActivo.nombreEmpleado} {turnoActivo.apellidoEmpleado || ""}
                  </h4>
                  <ShieldCheck className="h-3.5 w-3.5 text-secondary shrink-0" />
                </div>
                <p className="text-[11px] text-muted-foreground truncate font-medium">
                  Cajero responsable del turno
                </p>
              </div>
            </div>

            <div className="border-t border-border/60 pt-3 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Fondo Inicial:</span>
                <span className="font-mono font-bold text-foreground tabular-nums">
                  {formatCurrency(montoInicial)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300 font-medium">Efectivo Ingresado:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  +{formatCurrency(turnoActivo.totalVentasEfectivo)}
                </span>
              </div>
              {ventasDigitales > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-300 font-medium">Yape / Tarjetas:</span>
                  <span className="font-mono font-bold text-purple-600 dark:text-purple-400 tabular-nums">
                    +{formatCurrency(ventasDigitales)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2.5 border-t border-border/60">
                <span className="font-extrabold text-foreground text-xs uppercase tracking-wider">Total en Gaveta:</span>
                <span className="font-mono font-black text-base text-secondary tabular-nums">
                  {formatCurrency(totalEstimado)}
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-6 space-y-2 rounded-xl bg-amber-500/5 border border-dashed border-amber-500/25 px-4">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto animate-bounce" />
            <h4 className="text-xs font-bold text-foreground">Turno de Caja No Iniciado</h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Es necesario aperturar un turno con fondo inicial para habilitar cobros en efectivo y emitir comprobantes.
            </p>
          </div>
        )}

        <Link href="/caja" className="block mt-2">
          <Button
            variant={turnoActivo ? "outline" : "default"}
            className={`w-full text-xs font-bold h-10 cursor-pointer rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              turnoActivo
                ? "border-border hover:border-secondary hover:bg-secondary/10 hover:text-secondary"
                : "bg-secondary text-slate-950 font-black hover:bg-secondary/90 shadow-md shadow-secondary/20"
            }`}
          >
            <span>{turnoActivo ? "Gestionar Balance y Cierre" : "Aperturar Turno Ahora"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>

      {/* 2. OPERATIONAL QUICK TIPS / SLA CARD */}
      <div className="p-4 rounded-2xl border border-border/70 bg-muted/30 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <Zap className="h-4 w-4 text-amber-500 shrink-0" />
          <span>Meta de Rendimiento Operativo</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
          Tiempo meta de lavado: <strong>30 minutos</strong>. Los vehículos con más de 35 min en patio se marcan como alerta prioritaria.
        </p>
        <div className="flex items-center justify-between pt-1 text-[11px] font-semibold text-secondary">
          <Link href="/kiosco" className="hover:underline flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Ver semáforo de tiempos
          </Link>
        </div>
      </div>
    </div>
  );
}
