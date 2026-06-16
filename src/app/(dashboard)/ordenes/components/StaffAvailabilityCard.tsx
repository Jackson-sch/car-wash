"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { UserCheck, UserMinus } from "lucide-react";
import type { Orden, Lavador } from "./OrdenesTable";

interface StaffAvailabilityCardProps {
  lavadores: Lavador[];
  ordenes: Orden[];
}

export function StaffAvailabilityCard({ lavadores, ordenes }: StaffAvailabilityCardProps) {
  const staffStatusList = useMemo(() => {
    return lavadores.map((l) => {
      // Find if this wash staff has an active order (pendiente or en_proceso)
      const activeOrder = ordenes.find(
        (o) =>
          (o.estado === "pendiente" || o.estado === "en_proceso") &&
          o.lavadorNombre === l.nombre &&
          o.lavadorApellido === l.apellido
      );

      return {
        id: l.id,
        nombre: l.nombre,
        apellido: l.apellido || "",
        activo: activeOrder ? false : true, // false means occupied (busy)
        ticket: activeOrder ? activeOrder.nroTicket : null,
      };
    });
  }, [lavadores, ordenes]);

  return (
    <Card className="p-5 border border-border/80 bg-card/45 backdrop-blur-md rounded-2xl flex flex-col gap-4 h-full">
      <div>
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider">
          Disponibilidad del Personal
        </h3>
        <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
          Estado de Lavadores en Turno
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[200px] custom-scrollbar">
        {staffStatusList.length === 0 ? (
          <div className="text-xs text-muted-foreground font-bold text-center py-6">
            No hay personal asignado hoy.
          </div>
        ) : (
          staffStatusList.map((staff) => (
            <div
              key={staff.id}
              className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-500/5 dark:bg-zinc-800/10 border border-zinc-200/20 dark:border-zinc-800/20 hover:bg-zinc-500/10 dark:hover:bg-zinc-800/20 transition-colors duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${
                    staff.activo
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {staff.activo ? (
                    <UserCheck className="h-4 w-4" />
                  ) : (
                    <UserMinus className="h-4 w-4" />
                  )}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-extrabold text-foreground truncate capitalize">
                    {staff.nombre} {staff.apellido}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                    Lavador
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-2 h-2 rounded-full ${
                    staff.activo ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                  }`}
                />
                <span className="text-[10px] font-bold text-foreground">
                  {staff.activo ? (
                    <span className="text-emerald-600 dark:text-emerald-400">Disponible</span>
                  ) : (
                    <span className="text-amber-600 dark:text-amber-400">
                      Asignado: {staff.ticket}
                    </span>
                  )}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
