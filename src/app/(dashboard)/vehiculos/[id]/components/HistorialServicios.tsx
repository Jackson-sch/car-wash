"use client";

import { cloneElement } from "react";
import Link from "next/link";
import {
  ClipboardList,
  Clock,
  Wrench,
  CheckCircle2,
  DollarSign,
  XCircle,
  Zap,
  FileText,
  Printer,
  PlusCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formats";
import type { OrdenItem } from "../types";

interface HistorialServiciosProps {
  vehiculoId: string;
  ordenes: OrdenItem[];
}

const ESTADO_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactElement }
> = {
  pendiente: { label: "Pendiente", variant: "secondary", icon: <Clock className="h-5 w-5" /> },
  en_proceso: { label: "En Proceso", variant: "default", icon: <Wrench className="h-5 w-5" /> },
  completado: { label: "Completado", variant: "outline", icon: <CheckCircle2 className="h-5 w-5" /> },
  cobrado: { label: "Cobrado", variant: "default", icon: <DollarSign className="h-5 w-5" /> },
  cancelado: { label: "Cancelado", variant: "destructive", icon: <XCircle className="h-5 w-5" /> },
};

export function HistorialServicios({ vehiculoId, ordenes }: HistorialServiciosProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-foreground flex items-center gap-2.5">
          <ClipboardList className="h-5 w-5 text-secondary" />
          Historial de Servicios
        </h2>
        {ordenes.length > 0 && (
          <Badge variant="secondary" className="font-bold text-[10px] px-2 py-0.5 bg-muted border border-border/40 text-muted-foreground">
            {ordenes.length} orden{ordenes.length !== 1 ? "es" : ""}
          </Badge>
        )}
      </div>

      {ordenes.length === 0 ? (
        <Card className="p-12 text-center border-border bg-card rounded-2xl shadow-xs">
          <div className="h-16 w-16 rounded-2xl bg-muted/40 text-muted-foreground/45 flex items-center justify-center mx-auto mb-4 border border-dashed border-border/60">
            <ClipboardList className="h-8 w-8" />
          </div>
          <p className="font-extrabold text-foreground text-base">Sin historial de servicios</p>
          <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
            Este vehículo todavía no tiene registros de lavado o atención en el taller.
          </p>
          <Link href={`/ordenes/nueva?vehiculoId=${vehiculoId}`}>
            <Button className="mt-5 gap-2 cursor-pointer bg-secondary hover:bg-secondary/90 text-white font-bold px-4 py-2 rounded-xl">
              <PlusCircle className="h-4 w-4" />
              Crear Primera Orden
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="relative pl-6 sm:pl-8 space-y-4">
          {/* Timeline trace line */}
          <div className="absolute left-[9px] sm:left-[11px] top-2.5 bottom-2.5 w-[2px] bg-border/80 dark:bg-border/40" />

          {ordenes.map((o, idx) => {
            const config =
              ESTADO_CONFIG[o.estado] || {
                label: o.estado,
                variant: "outline" as const,
                icon: <ClipboardList className="h-5 w-5" />,
              };
            const isFirst = idx === 0;
            
            // State specific styles for dots and cards
            const dotStyle = 
              o.estado === "pendiente" ? "bg-amber-500 ring-amber-500/30 text-amber-500" :
              o.estado === "en_proceso" ? "bg-blue-500 ring-blue-500/30 text-blue-500" :
              o.estado === "completado" ? "bg-emerald-500 ring-emerald-500/30 text-emerald-500" :
              o.estado === "cobrado" ? "bg-emerald-650 ring-emerald-600/30 text-emerald-600" :
              o.estado === "cancelado" ? "bg-rose-500 ring-rose-500/30 text-rose-500" :
              "bg-muted text-muted-foreground";

            const stateBadgeStyle = 
              o.estado === "pendiente" ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" :
              o.estado === "en_proceso" ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20" :
              o.estado === "completado" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
              o.estado === "cobrado" ? "bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border-emerald-650/20" :
              o.estado === "cancelado" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" :
              "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";

            return (
              <div key={o.id} className="relative">
                {/* Timeline node dot */}
                <div className={`absolute left-[-27px] sm:left-[-29px] top-1.5 h-6 w-6 rounded-full border-2 border-background flex items-center justify-center ring-4 transition-colors duration-300 ${dotStyle} bg-white dark:bg-zinc-950 shadow-xs z-10`}>
                  {cloneElement(config.icon as React.ReactElement<{ className?: string }>, { className: "h-3.5 w-3.5" })}
                </div>

                <Card
                  className={`p-4 border-border bg-card hover:border-zinc-350 dark:hover:border-zinc-700 hover:shadow-md transition-colors duration-300 rounded-2xl ${
                    isFirst ? "ring-1 ring-secondary/35 bg-linear-to-br from-card via-card to-secondary/2" : ""
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 min-w-0">
                    <div className="space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-black text-sm text-foreground tracking-wide bg-muted/65 px-2 py-0.5 rounded-lg border border-border/40">
                          {o.nroTicket || "S/N"}
                        </span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] font-extrabold uppercase tracking-wider ${stateBadgeStyle}`}
                        >
                          {config.label}
                        </Badge>
                        {o.prioridad != null && o.prioridad >= 1 && (
                          <Badge
                            variant="outline"
                            className="text-[9px] font-extrabold text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700 bg-amber-500/5 dark:bg-amber-950/20 gap-0.5"
                          >
                            <Zap className="h-2.5 w-2.5 fill-amber-500" />
                            Express
                          </Badge>
                        )}
                      </div>
                      
                      {o.servicios && (
                        <p className="text-xs font-bold text-muted-foreground/90 leading-relaxed max-w-md">
                          {o.servicios}
                        </p>
                      )}
                      
                      {o.notas && (
                        <p className="text-[10px] text-muted-foreground/75 italic flex items-center gap-1 bg-muted/20 px-2 py-1 rounded-lg w-fit">
                          <FileText className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                          {o.notas}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-3 sm:gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-border/55">
                      <div className="text-left sm:text-right">
                        <p className="font-extrabold text-foreground text-base leading-none">
                          {o.total ? formatCurrency(parseFloat(o.total)) : "—"}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 sm:justify-end font-semibold">
                          <Clock className="h-3 w-3" />
                          {o.createdAt ? formatDate(o.createdAt) : "—"}
                        </p>
                      </div>
                      
                      {/* Printer/View Ticket link */}
                      <Link href={`/ordenes/${o.id}/ticket`} target="_blank" rel="noopener noreferrer">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold rounded-lg border-border hover:border-zinc-350 hover:bg-muted/50 gap-1.5 cursor-pointer shadow-xs text-muted-foreground hover:text-foreground"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Ver Ticket
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
