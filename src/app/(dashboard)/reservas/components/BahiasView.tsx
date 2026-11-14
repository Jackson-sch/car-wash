"use client";

import { useMemo } from "react";
import { Car, Clock, Play, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReservaCard } from "./ReservaCard";
import type { ReservaItem } from "@/lib/actions/reservas";

interface BahiasViewProps {
  reservas: ReservaItem[];
  onCambiarEstado: (id: string, nuevoEstado: ReservaItem["estado"]) => void;
  isPending: boolean;
  onOpenNuevaCita?: () => void;
}

const BAHIAS = [
  {
    id: 1,
    nombre: "Bahía 1 — Lavado Rápido",
    tipo: "Express & Aspirado",
    capacidadMax: 1,
  },
  {
    id: 2,
    nombre: "Bahía 2 — Lavado General",
    tipo: "Premium & Encerado",
    capacidadMax: 1,
  },
  {
    id: 3,
    nombre: "Bahía 3 — Estética & Detailing",
    tipo: "Salón Completo & Cerámico",
    capacidadMax: 1,
  },
];

export function BahiasView({
  reservas,
  onCambiarEstado,
  isPending,
  onOpenNuevaCita,
}: BahiasViewProps) {
  // Vehículos actualmente lavándose (en_proceso)
  const lavandose = useMemo(
    () => reservas.filter((r) => r.estado === "en_proceso"),
    [reservas]
  );

  // Vehículos esperando ingreso (pendiente)
  const enEspera = useMemo(
    () => reservas.filter((r) => r.estado === "pendiente"),
    [reservas]
  );

  return (
    <div className="space-y-6">
      {/* Grid de 3 Bahías */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {BAHIAS.map((bahia, idx) => {
          // Asignar el vehículo lavándose correspondiente al índice de la bahía
          // eslint-disable-next-line security/detect-object-injection
          const vehiculoActivo = lavandose[idx];
          const estaOcupada = !!vehiculoActivo;

          return (
            <div
              key={bahia.id}
              className={`rounded-3xl border p-5 space-y-4 transition-all duration-300 ${
                estaOcupada
                  ? "border-cyan-500/50 bg-cyan-950/10 shadow-md shadow-cyan-500/5"
                  : "border-border/80 bg-card/60 backdrop-blur-sm"
              }`}
            >
              {/* Header de Bahía */}
              <div className="flex items-center justify-between pb-3 border-b border-border/60">
                <div>
                  <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
                    <span className="size-2 rounded-full bg-secondary" />
                    {bahia.nombre}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">{bahia.tipo}</p>
                </div>

                {estaOcupada ? (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5 animate-pulse">
                    <span className="size-1.5 rounded-full bg-cyan-500" />
                    EN SERVICIO
                  </span>
                ) : (
                  <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    DISPONIBLE
                  </span>
                )}
              </div>

              {/* Slot Activo en Bahía */}
              {estaOcupada ? (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Vehículo en Bahía
                  </span>
                  <ReservaCard
                    reserva={vehiculoActivo}
                    onCambiarEstado={onCambiarEstado}
                    isPending={isPending}
                  />
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border/80 rounded-2xl p-4 flex flex-col items-center justify-center space-y-2">
                  <div className="size-10 rounded-xl bg-muted/50 flex items-center justify-center text-muted-foreground">
                    <Car className="size-5" />
                  </div>
                  <p className="text-xs font-bold text-foreground">Bahía Despejada</p>
                  <p className="text-[11px] text-muted-foreground max-w-xs">
                    Lista para ingresar el siguiente vehículo en cola de espera.
                  </p>
                  {enEspera.length > 0 ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={isPending}
                      onClick={() => onCambiarEstado(enEspera[0]!.id, "en_proceso")}
                      className="mt-2 text-xs font-bold h-8 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white gap-1 cursor-pointer"
                    >
                      <Play className="size-3 fill-current" />
                      <span>Ingresar {enEspera[0]?.placa || "Auto"}</span>
                    </Button>
                  ) : onOpenNuevaCita ? (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onOpenNuevaCita}
                      className="mt-2 text-xs font-bold h-8 rounded-xl border-border gap-1 cursor-pointer hover:bg-muted"
                    >
                      <Plus className="size-3" />
                      <span>Agendar Cita</span>
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cola de Espera para las Bahías */}
      <div className="rounded-3xl border border-border bg-card p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="text-sm font-extrabold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-amber-500" />
              Cola de Espera para Ingreso a Bahías
            </h3>
            <p className="text-xs text-muted-foreground">
              Vehículos agendados con cita previa pendientes de asignación de puesto.
            </p>
          </div>
          <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
            {enEspera.length} en espera
          </span>
        </div>

        {enEspera.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No hay vehículos esperando en cola para este día.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {enEspera.map((r) => (
              <ReservaCard
                key={r.id}
                reserva={r}
                onCambiarEstado={onCambiarEstado}
                isPending={isPending}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
