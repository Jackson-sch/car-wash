"use client";

import { useEffect, useTransition, useMemo, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import { Wallet, Clock, User, AlertTriangle } from "lucide-react";
import { abrirTurnoCaja } from "@/lib/actions/caja";
import { notifyCajaStatusChanged } from "@/lib/events/caja-events";
import { toast } from "sonner";
import { formatDate } from "@/lib/formats";
import { CajaCerrada } from "./components/CajaCerrada";
import { CajaAbierta } from "./components/CajaAbierta";
import { CajaTabsSection } from "./components/CajaTabsSection";
import { CajaShortcutsDock } from "./components/CajaShortcutsDock";
import { TurnoOverdueAlert } from "./components/TurnoOverdueAlert";
import type { TurnoActivo, TurnoHistorial } from "./components/types";

const emptySubscribe = () => () => {};

interface CajaClientProps {
  turnoActivo: TurnoActivo | null;
  initialHistorial: TurnoHistorial[];
}

export function CajaClient({ turnoActivo, initialHistorial }: CajaClientProps) {
  const router = useRouter();
  const turno = turnoActivo;
  const historial = initialHistorial;
  const [isPending, startTransition] = useTransition();

  const isClient = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  // Sincronizar el estado de caja con el Header cada vez que se carga la página o cambia de turno
  useEffect(() => {
    notifyCajaStatusChanged();
  }, [turnoActivo]);

  // Hora de apertura con formato determinista (date-fns)
  const horaAperturaStr = useMemo(() => {
    if (!turno?.apertura) return null;
    return formatDate(turno.apertura, "hh:mm a");
  }, [turno]);

  // Cálculo de tiempo transcurrido (solo activo en cliente para evitar mismatch con SSR)
  const elapsedStr = useMemo(() => {
    if (!isClient || !turno?.apertura) return null;
    const diffMs = new Date().getTime() - new Date(turno.apertura).getTime();
    const diffMins = Math.max(0, Math.floor(diffMs / (1000 * 60)));
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    if (hours > 0) return `${hours}h ${mins}m transcurridos`;
    return `${mins}m transcurridos`;
  }, [isClient, turno]);

  // Detección de jornada prolongada (>10h, >12h o de fecha anterior)
  const turnoStatus = useMemo(() => {
    if (!turno?.apertura) return null;
    const aperturaDate = new Date(turno.apertura);
    const now = new Date();
    const diffMs = now.getTime() - aperturaDate.getTime();
    const hoursElapsed = diffMs / (1000 * 60 * 60);

    const isPreviousDay =
      aperturaDate.getFullYear() !== now.getFullYear() ||
      aperturaDate.getMonth() !== now.getMonth() ||
      aperturaDate.getDate() !== now.getDate();

    const isOverdue = hoursElapsed >= 12;
    const isWarning = hoursElapsed >= 10 && hoursElapsed < 12;

    return {
      hoursElapsed,
      isPreviousDay,
      isOverdue,
      isWarning,
    };
  }, [turno]);

  // Teclas de acceso rápido globales en el módulo de caja
  useEffect(() => {
    if (!turno) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeElement = document.activeElement;
      const isInput =
        activeElement instanceof HTMLInputElement ||
        activeElement instanceof HTMLTextAreaElement ||
        activeElement?.getAttribute("contenteditable") === "true";

      if (isInput) return;

      // C -> Ir a Cierre de Turno
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        router.push("/caja/cierre");
        return;
      }

      // / -> Enfocar buscador de transacciones
      if (e.key === "/") {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>(
          'input[placeholder*="Buscar por placa"]'
        );
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [turno, router]);

  // Acción: Abrir Caja
  const handleAbrirCaja = async (monto: string) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await abrirTurnoCaja(monto);
        if (res.success && res.data) {
          toast.success("Caja abierta con éxito");
          notifyCajaStatusChanged();
          window.location.reload();
        } else {
          toast.error(res.error || "Ocurrió un error al abrir caja");
        }
        resolve();
      });
    });
  };

  const cajeroFullName = turno
    ? `${turno.nombreEmpleado} ${turno.apellidoEmpleado || ""}`.trim()
    : "";

  return (
    <div className="space-y-6 md:space-y-8 text-foreground pb-12">
      {/* Header Enriquecido con Metadata Operativa */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shadow-sm">
              <Wallet className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Caja y Turnos
                </h1>
                {turno ? (
                  turnoStatus?.isPreviousDay || turnoStatus?.isOverdue ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                      <AlertTriangle className="size-3 text-rose-500 shrink-0" />
                      {turnoStatus?.isPreviousDay
                        ? "Turno Día Anterior"
                        : "Turno Extendido (>12h)"}
                    </span>
                  ) : turnoStatus?.isWarning ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Clock className="size-3 text-amber-500 shrink-0" />
                      Turno por Culminar ({Math.floor(turnoStatus.hoursElapsed)}h)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Turno Activo
                    </span>
                  )
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-muted text-muted-foreground border border-border">
                    Caja Cerrada
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Control de arqueo diario, validación de cobros por método y prevención de descuadres.
              </p>
            </div>
          </div>
        </div>

        {/* Metadata de Operación del Turno en Curso */}
        {turno && (
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs flex items-center gap-2">
              <User className="size-3.5 text-secondary shrink-0" />
              <div className="text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Cajero
                </span>
                <span className="font-bold text-foreground truncate max-w-[140px] block">
                  {cajeroFullName || "Cajero en Turno"}
                </span>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs flex items-center gap-2">
              <Clock className="size-3.5 text-muted-foreground shrink-0" />
              <div className="text-left">
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                  Apertura
                </span>
                <span
                  className="font-mono font-bold text-foreground block"
                  suppressHydrationWarning
                >
                  {horaAperturaStr} {elapsedStr ? `(${elapsedStr})` : ""}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Alerta Inteligente de Turno Prolongado (>12h o de fecha anterior) */}
      {turno && <TurnoOverdueAlert turno={turno} />}

      {/* Operaciones de Caja */}
      {!turno ? (
        <CajaCerrada isPending={isPending} onOpenCaja={handleAbrirCaja} />
      ) : (
        <CajaAbierta turno={turno} />
      )}

      {/* Pestañas de Cobros del Turno, Egresos e Historial de Cierres (nuqs) */}
      <CajaTabsSection turno={turno} historial={historial} />

      {/* Dock Flotante de Atajos Rápidos */}
      {turno && <CajaShortcutsDock />}
    </div>
  );
}
