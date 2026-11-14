"use client";

import { useQueryState } from "nuqs";
import { Receipt, History, MinusCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { TransactionsTable } from "./TransactionsTable";
import { EgresosTable } from "./EgresosTable";
import { HistorialTurnos } from "./HistorialTurnos";
import type { TurnoActivo, TurnoHistorial } from "./types";

interface CajaTabsSectionProps {
  turno: TurnoActivo | null;
  historial: TurnoHistorial[];
}

export function CajaTabsSection({ turno, historial }: CajaTabsSectionProps) {
  const [activeTab, setActiveTab] = useQueryState("tab", {
    defaultValue: turno ? "cobros" : "historial",
    shallow: true,
  });

  const currentTab = activeTab || (turno ? "cobros" : "historial");

  const cobrosCount = turno?.transaccionesDetalladas.length || 0;
  const egresosCount = turno?.egresosList?.length || 0;
  const historialCount = historial.length;

  return (
    <div className="space-y-4">
      {/* Selector de Pestañas con nuqs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {turno && (
            <button
              type="button"
              onClick={() => setActiveTab("cobros")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                currentTab === "cobros"
                  ? "bg-secondary text-slate-950 shadow-sm shadow-secondary/15"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Receipt className="size-3.5" />
              <span>Cobros del Turno</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-md font-mono text-[10px]",
                  currentTab === "cobros"
                    ? "bg-slate-950/20 text-slate-950 font-black"
                    : "bg-black/10 dark:bg-white/10 text-muted-foreground"
                )}
              >
                {cobrosCount}
              </span>
            </button>
          )}

          {turno && (
            <button
              type="button"
              onClick={() => setActiveTab("egresos")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
                currentTab === "egresos"
                  ? "bg-rose-500 text-white shadow-sm shadow-rose-500/15"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <MinusCircle className="size-3.5" />
              <span>Egresos del Turno</span>
              <span
                className={cn(
                  "px-1.5 py-0.2 rounded-md font-mono text-[10px]",
                  currentTab === "egresos"
                    ? "bg-white/25 text-white font-black"
                    : "bg-black/10 dark:bg-white/10 text-muted-foreground"
                )}
              >
                {egresosCount}
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setActiveTab("historial")}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap",
              currentTab === "historial"
                ? "bg-secondary text-slate-950 shadow-sm shadow-secondary/15"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <History className="size-3.5" />
            <span>Historial de Cierres</span>
            <span
              className={cn(
                "px-1.5 py-0.2 rounded-md font-mono text-[10px]",
                currentTab === "historial"
                  ? "bg-slate-950/20 text-slate-950 font-black"
                  : "bg-black/10 dark:bg-white/10 text-muted-foreground"
              )}
            >
              {historialCount}
            </span>
          </button>
        </div>

        <span className="text-[11px] text-muted-foreground font-mono hidden md:inline">
          {currentTab === "cobros" && "Vista de tickets liquidados en tiempo real"}
          {currentTab === "egresos" && "Auditoría de salidas de efectivo autorizadas"}
          {currentTab === "historial" && "Registro histórico de arqueos y cortes diarios"}
        </span>
      </div>

      {/* Contenido de la pestaña activa */}
      <div>
        {currentTab === "cobros" && turno && (
          <TransactionsTable transacciones={turno.transaccionesDetalladas} />
        )}

        {currentTab === "egresos" && turno && (
          <EgresosTable egresos={turno.egresosList || []} />
        )}

        {currentTab === "historial" && (
          <HistorialTurnos historial={historial} hideHeading />
        )}
      </div>
    </div>
  );
}
