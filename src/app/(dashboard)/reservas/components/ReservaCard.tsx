"use client";

import { useMemo } from "react";
import { Clock, Play, CheckCircle2, ArrowRight, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formats";
import Link from "next/link";
import type { ReservaItem } from "@/lib/actions/reservas";

interface ReservaCardProps {
  reserva: ReservaItem;
  onCambiarEstado: (id: string, nuevoEstado: ReservaItem["estado"]) => void;
  isPending: boolean;
}

export function ReservaCard({ reserva: r, onCambiarEstado, isPending }: ReservaCardProps) {
  const formattedTime = useMemo(() => {
    if (!r.createdAt) return "--:--";
    const d = new Date(r.createdAt);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [r.createdAt]);

  const cleanPhone = (r.clienteTelefono || "").replace(/\D/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/51${cleanPhone}?text=${encodeURIComponent(
        `Hola ${r.clienteNombre || ""}, te recordamos tu cita en WashMaster Pro para el vehículo con placa ${r.placa || ""}. ¡Te esperamos!`
      )}`
    : null;

  return (
    <Card className="p-4 border-border bg-card hover:border-secondary/50 rounded-2xl shadow-xs transition-all space-y-3 relative overflow-hidden group">
      {/* Header: Placa Peruana y Hora */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Placa estilizada tipo matrícula nacional */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-950 dark:bg-zinc-900 border border-zinc-700/80 shadow-xs">
            <span className="text-[8px] font-black tracking-widest text-red-500 font-sans">PERÚ</span>
            <span className="font-mono font-extrabold text-xs text-white tracking-widest">
              {r.placa || "SIN PLACA"}
            </span>
          </div>

          <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1 font-mono">
            <Clock className="size-3 text-secondary shrink-0" />
            <span>{formattedTime}</span>
          </span>
        </div>

        {/* Estado */}
        {r.estado === "pendiente" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            En Espera
          </span>
        )}
        {r.estado === "en_proceso" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
            <span className="size-1.5 rounded-full bg-cyan-500 animate-ping" />
            En Bahía
          </span>
        )}
        {r.estado === "completado" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            Finalizado
          </span>
        )}
        {r.estado === "cobrado" && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
            Cobrado
          </span>
        )}
      </div>

      {/* Datos Cliente y Vehículo */}
      <div className="space-y-1 text-xs">
        <div className="flex items-center justify-between">
          <span className="font-bold text-foreground truncate max-w-[180px]">
            {r.clienteNombre} {r.clienteApellido || ""}
          </span>
          {waUrl && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1 text-[11px] font-bold"
              title="Avisar por WhatsApp"
            >
              <MessageCircle className="size-3.5" />
              <span>WhatsApp</span>
            </a>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground truncate">
          {[r.vehiculoMarca, r.vehiculoModelo].filter(Boolean).join(" ") || "Vehículo sin modelo"}
          {r.vehiculoTipo ? ` • ${r.vehiculoTipo.toUpperCase()}` : ""}
        </p>

        {r.notas && (
          <p className="text-[10px] text-muted-foreground/80 italic line-clamp-1 bg-muted/40 px-2 py-1 rounded-md mt-1 border border-border/40">
            {r.notas.replace("[CITA AGENDADA]", "").trim() || "Cita agendada"}
          </p>
        )}
      </div>

      {/* Footer y Acciones de Flujo */}
      <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] text-muted-foreground block font-mono">
            {r.nroTicket ? `Ticket: ${r.nroTicket}` : "Cita previa"}
          </span>
          {r.total && parseFloat(r.total) > 0 && (
            <span className="text-xs font-black text-foreground font-mono">
              {formatCurrency(parseFloat(r.total) || 0)}
            </span>
          )}
        </div>

        {/* Acciones de Flujo */}
        <div className="flex items-center gap-1.5">
          {r.estado === "pendiente" && (
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => onCambiarEstado(r.id, "en_proceso")}
              className="h-8 px-3 text-[11px] font-bold gap-1 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white cursor-pointer shadow-xs"
            >
              <Play className="size-3 fill-current" />
              <span>A Bahía</span>
            </Button>
          )}

          {r.estado === "en_proceso" && (
            <Button
              type="button"
              size="sm"
              disabled={isPending}
              onClick={() => onCambiarEstado(r.id, "completado")}
              className="h-8 px-3 text-[11px] font-bold gap-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer shadow-xs"
            >
              <CheckCircle2 className="size-3.5" />
              <span>Finalizar</span>
            </Button>
          )}

          {r.estado === "completado" && (
            <Link href="/ordenes" passHref>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 px-2.5 text-[11px] font-bold rounded-xl cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <span>Cobrar</span>
                <ArrowRight className="size-3 ml-1" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Card>
  );
}
