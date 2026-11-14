"use client";

import { useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Lock, FileSpreadsheet, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formats";
import { cn } from "@/lib/utils";
import type { TurnoActivo } from "./types";
import { CorteXModal } from "./CorteXModal";

interface TurnoOverdueAlertProps {
  turno: TurnoActivo;
  onOpenCorteX?: () => void;
}

export function TurnoOverdueAlert({ turno }: TurnoOverdueAlertProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showCorteX, setShowCorteX] = useState(false);

  if (dismissed || !turno?.apertura) return null;

  const aperturaDate = new Date(turno.apertura);
  const now = new Date();
  const diffMs = now.getTime() - aperturaDate.getTime();
  const hoursElapsed = diffMs / (1000 * 60 * 60);

  // Comprobar si pertenece a un día calendario anterior
  const isPreviousDay =
    aperturaDate.getFullYear() !== now.getFullYear() ||
    aperturaDate.getMonth() !== now.getMonth() ||
    aperturaDate.getDate() !== now.getDate();

  const isOverdue = hoursElapsed >= 12;
  const isWarning = hoursElapsed >= 10 && hoursElapsed < 12;

  // Si tiene menos de 10 horas y es del mismo día, no requiere alerta
  if (!isOverdue && !isWarning && !isPreviousDay) return null;

  const hoursFloor = Math.floor(hoursElapsed);
  const isCritical = isOverdue || isPreviousDay;

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border p-4 sm:p-5 relative transition-all shadow-sm",
          isCritical
            ? "bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-100"
            : "bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-100"
        )}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "size-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5",
                isCritical
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-500"
                  : "bg-amber-500/20 border-amber-500/40 text-amber-500"
              )}
            >
              {isCritical ? (
                <AlertTriangle className="size-5" />
              ) : (
                <Clock className="size-5" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md font-mono",
                    isCritical
                      ? "bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30"
                      : "bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/30"
                  )}
                >
                  {isPreviousDay
                    ? "Turno de Fecha Anterior"
                    : isOverdue
                    ? `Turno Extendido (${hoursFloor}h en curso)`
                    : `Jornada por Culminar (${hoursFloor}h)`}
                </span>
                <span className="text-[11px] font-bold text-muted-foreground">
                  Apertura: {formatDate(turno.apertura, "dd/MM/yyyy hh:mm a")}
                </span>
              </div>

              <p className="text-xs text-foreground/90 font-medium leading-relaxed max-w-2xl">
                {isPreviousDay ? (
                  <>
                    Este turno fue iniciado en una <strong>fecha anterior</strong>. Para mantener la contabilidad exacta de hoy y evitar mezclar ingresos, te sugerimos <strong>realizar el corte de caja ahora</strong> antes de continuar operando.
                  </>
                ) : isOverdue ? (
                  <>
                    Este turno lleva <strong>{hoursFloor} horas activo</strong> (superando el límite recomendado de 12h diarias). Se sugiere realizar el arqueo físico y cierre de caja para consolidar los cobros del día.
                  </>
                ) : (
                  <>
                    El turno actual lleva <strong>{hoursFloor} horas de atención</strong>. Te recomendamos planificar el arqueo de billetes y preparar el corte de caja.
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCorteX(true)}
              className="h-9 px-3 rounded-xl border-border/80 text-foreground hover:bg-muted text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="size-3.5 text-secondary" />
              <span>Ver Corte X</span>
            </Button>

            <Link href="/caja/cierre" passHref>
              <Button
                size="sm"
                className={cn(
                  "h-9 px-3.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm text-slate-950 transition-all",
                  isCritical
                    ? "bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20"
                    : "bg-secondary hover:bg-sky-400 text-slate-950 shadow-secondary/20"
                )}
              >
                <Lock className="size-3.5" />
                <span>Cerrar Turno</span>
                <ArrowRight className="size-3.5 ml-0.5" />
              </Button>
            </Link>

            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 flex items-center justify-center cursor-pointer transition-colors shrink-0 ml-1"
              title="Continuar operando y ocultar aviso por ahora"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <CorteXModal
        open={showCorteX}
        onOpenChange={setShowCorteX}
        turno={turno}
      />
    </>
  );
}
