"use client";

import { useState, useMemo } from "react";
import { formatCurrency } from "@/lib/formats";
import { ArrowUpRight, Play, Clock, Car, ExternalLink } from "lucide-react";
import Link from "next/link";
import { VehiclePlate } from "@/components/shared/VehiclePlate";
import { EmptyState } from "@/components/shared/EmptyState";

interface OrdenCola {
  ticket: string;
  placa: string;
  vehiculo: string;
  servicios: string[];
  empleado: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  total: number;
  hora: string;
}

interface OrdenesColaTableProps {
  ordenes: OrdenCola[];
}

export function OrdenesColaTable({ ordenes }: OrdenesColaTableProps) {
  const [filtro, setFiltro] = useState<"todas" | "en_proceso" | "pendiente">("todas");

  const ordenesFiltradas = useMemo(() => {
    if (filtro === "todas") return ordenes;
    return ordenes.filter((o) => o.estado === filtro);
  }, [ordenes, filtro]);

  const countEnLavado = ordenes.filter((o) => o.estado === "en_proceso").length;
  const countEnEspera = ordenes.filter((o) => o.estado === "pendiente").length;

  return (
    <div className="lg:col-span-2 p-5 sm:p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm shadow-xs space-y-4 hover:border-secondary/40 transition-colors duration-300 flex flex-col justify-between">
      
      {/* Header with Title and Filters */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-foreground tracking-tight flex items-center gap-2">
                <Car className="h-4.5 w-4.5 text-secondary" />
                Cola Operativa de Patio
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-black bg-secondary/15 text-secondary border border-secondary/25">
                {ordenes.length} activa{ordenes.length !== 1 ? "s" : ""}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">Vehículos en bahías de lavado y recepción hoy</p>
          </div>

          {/* Action & Filter group */}
          <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
            {/* Quick Filter Tabs */}
            <div className="flex items-center rounded-xl bg-muted/70 p-1 border border-border/70 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFiltro("todas")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs ${
                  filtro === "todas"
                    ? "bg-background text-foreground shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Todas ({ordenes.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltro("en_proceso")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                  filtro === "en_proceso"
                    ? "bg-background text-secondary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-secondary animate-pulse" />
                Lavando ({countEnLavado})
              </button>
              <button
                type="button"
                onClick={() => setFiltro("pendiente")}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                  filtro === "pendiente"
                    ? "bg-background text-amber-500 shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                Espera ({countEnEspera})
              </button>
            </div>

            <Link
              href="/ordenes"
              className="text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-secondary/10 transition-colors"
            >
              Ver tablero <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto mt-4">
          {ordenesFiltradas.length === 0 ? (
            <div className="py-6">
              <EmptyState
                icon={Car}
                title={filtro === "todas" ? "No hay vehículos en cola ahora" : `No hay órdenes ${filtro === "en_proceso" ? "en lavado" : "en espera"}`}
                description="Las nuevas órdenes ingresadas desde recepción o punto de venta se reflejarán aquí en tiempo real."
                action={{
                  label: "Ingresar Nueva Orden",
                  href: "/ordenes/nueva",
                }}
                secondaryAction={{
                  label: "Ver Modo TV",
                  href: "/kiosco",
                }}
              />
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 text-xs uppercase font-extrabold text-slate-700 dark:text-slate-300 tracking-wider">
                  <th className="py-2.5 pl-3">Ticket / Hora</th>
                  <th className="py-2.5">Placa</th>
                  <th className="py-2.5">Vehículo & Servicios</th>
                  <th className="py-2.5">Lavador Asignado</th>
                  <th className="py-2.5 text-center">Estado</th>
                  <th className="py-2.5 text-right pr-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40 text-foreground">
                {ordenesFiltradas.map((ord) => (
                  <tr key={ord.ticket} className="hover:bg-muted/40 transition-colors group">
                    {/* Ticket */}
                    <td className="py-3 pl-3">
                      <span className="font-mono font-bold text-xs text-foreground group-hover:text-secondary transition-colors">
                        #{ord.ticket}
                      </span>
                      <div className="text-[10px] text-muted-foreground font-medium flex items-center gap-1 mt-0.5">
                        <Clock className="h-2.5 w-2.5 text-muted-foreground" />
                        {ord.hora}
                      </div>
                    </td>

                    {/* Vehicle Plate Component */}
                    <td className="py-3">
                      <VehiclePlate plate={ord.placa} size="sm" />
                    </td>

                    {/* Vehiculo y servicios */}
                    <td className="py-3">
                      <div className="font-bold text-foreground text-xs">{ord.vehiculo}</div>
                      <div className="text-[11px] text-muted-foreground font-medium mt-0.5 truncate max-w-[220px]" title={ord.servicios.join(", ")}>
                        {ord.servicios.length > 0 ? ord.servicios.join(", ") : "Lavado estándar"}
                      </div>
                    </td>

                    {/* Empleado asignado */}
                    <td className="py-3 text-foreground/90 font-medium">
                      {ord.empleado && ord.empleado !== "Sin Asignar" ? (
                        <span className="inline-flex items-center gap-1.5 font-bold text-xs text-foreground">
                          <span className="h-5 w-5 rounded-full bg-secondary/15 text-secondary flex items-center justify-center text-[10px] font-black shrink-0">
                            {ord.empleado.charAt(0)}
                          </span>
                          <span className="truncate max-w-[120px]">{ord.empleado}</span>
                        </span>
                      ) : (
                        <span className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          Sin asignar
                        </span>
                      )}
                    </td>

                    {/* Estado */}
                    <td className="py-3 text-center">
                      {ord.estado === "en_proceso" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/30 shadow-xs">
                          <Play className="h-2.5 w-2.5 fill-current text-current animate-pulse" />
                          Lavando
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 shadow-xs">
                          <Clock className="h-2.5 w-2.5" />
                          Espera
                        </span>
                      )}
                    </td>

                    {/* Total Tabular */}
                    <td className="py-3 text-right pr-3 font-mono font-black text-foreground tabular-nums text-xs">
                      {formatCurrency(ord.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Footer link to full patio */}
      {ordenesFiltradas.length > 0 && (
        <div className="flex items-center justify-between border-t border-border/50 pt-3 text-xs text-muted-foreground">
          <span>Actualización en tiempo real</span>
          <Link
            href="/patio"
            className="font-bold text-secondary hover:text-secondary/80 flex items-center gap-1"
          >
            <span>Ver mapa de bahías de lavado</span>
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      )}
    </div>
  );
}
