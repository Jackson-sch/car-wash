"use client";

import { ClipboardList, Calendar, Car, ArrowUpRight, CheckCircle2, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formats";
import Link from "next/link";
import type { OrdenItem } from "../types";

interface ClienteHistorialOrdenesProps {
  ordenes: OrdenItem[];
}

const estadoBadges: Record<string, { label: string; class: string }> = {
  pendiente: {
    label: "Pendiente",
    class: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  },
  en_proceso: {
    label: "En Proceso",
    class: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  completado: {
    label: "Completado",
    class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  cobrado: {
    label: "Cobrado",
    class: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
  cancelado: {
    label: "Cancelado",
    class: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
  },
};

export function ClienteHistorialOrdenes({ ordenes }: ClienteHistorialOrdenesProps) {
  return (
    <Card className="border border-border bg-card rounded-3xl p-0 overflow-hidden shadow-xs">
      {/* Header */}
      <div className="p-5 sm:p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <ClipboardList className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">
              Historial de Servicios ({ordenes.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Registro de todas las visitas y atenciones en el car wash.
            </p>
          </div>
        </div>

        <Link href="/ordenes/nueva">
          <Badge
            variant="outline"
            className="text-[10px] font-bold border-secondary/30 bg-secondary/10 text-secondary cursor-pointer hover:bg-secondary/20"
          >
            + Nueva Orden
          </Badge>
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table className="min-w-[680px]">
          <TableHeader>
            <TableRow className="bg-muted/40 border-b border-border hover:bg-transparent">
              <TableHead className="py-3 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Ticket / Orden
              </TableHead>
              <TableHead className="py-3 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Fecha
              </TableHead>
              <TableHead className="py-3 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Vehículo
              </TableHead>
              <TableHead className="py-3 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Estado
              </TableHead>
              <TableHead className="py-3 pr-4 text-right text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40 text-xs">
            {ordenes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-44 text-center">
                  <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                    <ClipboardList className="size-7 opacity-30 text-secondary" />
                    <p className="text-xs font-bold text-foreground">Sin servicios registrados</p>
                    <p className="text-[11px] text-muted-foreground">
                      Cuando este cliente traiga su auto a lavar, las órdenes se registrarán aquí.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              ordenes.map((o) => {
                const dateObj = o.createdAt ? new Date(o.createdAt) : null;
                const formattedDate = dateObj
                  ? dateObj.toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "—";

                const badge = estadoBadges[o.estado] || {
                  label: o.estado,
                  class: "bg-muted text-muted-foreground",
                };

                return (
                  <TableRow
                    key={o.id}
                    className="hover:bg-muted/20 transition-colors"
                  >
                    {/* Ticket */}
                    <TableCell className="py-3 px-4 font-mono font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <span>#{o.nroTicket || o.id.substring(0, 8).toUpperCase()}</span>
                      </div>
                    </TableCell>

                    {/* Fecha */}
                    <TableCell className="py-3 px-4 text-muted-foreground font-mono">
                      {formattedDate}
                    </TableCell>

                    {/* Vehículo */}
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-foreground bg-muted/60 px-1.5 py-0.5 rounded border border-border/60 text-[11px]">
                          {o.placa}
                        </span>
                        <span className="text-muted-foreground truncate max-w-[140px]">
                          {o.marca || ""} {o.modelo || ""}
                        </span>
                      </div>
                    </TableCell>

                    {/* Estado */}
                    <TableCell className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${badge.class}`}
                      >
                        {badge.label}
                      </span>
                    </TableCell>

                    {/* Total */}
                    <TableCell className="py-3 pr-4 text-right font-mono font-black text-foreground">
                      {o.total ? formatCurrency(parseFloat(o.total)) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
