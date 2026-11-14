"use client";

import { Calendar as CalendarIcon, Clock, Sparkles, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ReservasKpisProps {
  totalCitas: number;
  enBahia: number;
  enEspera: number;
  completadas: number;
  isToday: boolean;
  fecha: string;
}

export function ReservasKpis({
  totalCitas,
  enBahia,
  enEspera,
  completadas,
  isToday,
  fecha,
}: ReservasKpisProps) {
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Citas del Día */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <CalendarIcon className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Citas del Día
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {totalCitas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {isToday ? "agendadas hoy" : fecha}
              </span>
            </div>
          </div>
        </div>

        {/* 2. En Bahía */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 shrink-0">
            <Sparkles className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider block truncate">
              En Bahía / Lavando
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-cyan-600 dark:text-cyan-400 leading-none">
                {enBahia}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                ocupando puesto
              </span>
            </div>
          </div>
        </div>

        {/* 3. En Espera */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Clock className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Por Atender
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {enEspera}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                en recepción
              </span>
            </div>
          </div>
        </div>

        {/* 4. Finalizadas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Finalizadas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {completadas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                listas o cobradas
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
