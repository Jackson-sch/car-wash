"use client";

import { Gift, ArrowUpCircle, ArrowDownCircle, Settings2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formats";
import type { PuntosLogItem } from "../types";

interface ClientePuntosCardProps {
  totalPuntos: number;
  puntos: PuntosLogItem[];
  onAjustarClick: () => void;
}

export function ClientePuntosCard({
  totalPuntos,
  puntos,
  onAjustarClick,
}: ClientePuntosCardProps) {
  const valorSoles = totalPuntos * 0.20;

  return (
    <Card className="border border-border bg-card rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Gift className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-foreground">
              Programa de Lealtad
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Puntos acumulados y canjes canjeables por servicios.
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAjustarClick}
          className="h-8 px-3 rounded-xl border-border hover:bg-muted text-xs font-bold gap-1 cursor-pointer"
        >
          <Gift className="size-3 text-amber-500" />
          <span>Ajustar Puntos</span>
        </Button>
      </div>

      {/* Saldo Actual Banner */}
      <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 block">
            Saldo Disponible
          </span>
          <span className="text-xl font-black font-mono text-foreground">
            {totalPuntos} pts
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Valor de Canje
          </span>
          <span className="text-sm sm:text-base font-black font-mono text-amber-600 dark:text-amber-400">
            {formatCurrency(valorSoles)}
          </span>
        </div>
      </div>

      {/* Log de Movimientos de Puntos */}
      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
        {puntos.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            No hay registros de puntos en su historial.
          </div>
        ) : (
          puntos.map((p) => {
            const isGanado = p.tipo === "ganado";
            const isCanjeado = p.tipo === "canjeado";
            const dateStr = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "—";

            return (
              <div
                key={p.id}
                className="p-2.5 rounded-xl border border-border/60 bg-muted/20 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`size-6 rounded-md flex items-center justify-center shrink-0 ${
                      isGanado
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : isCanjeado
                        ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {isGanado ? (
                      <ArrowUpCircle className="size-3.5" />
                    ) : isCanjeado ? (
                      <ArrowDownCircle className="size-3.5" />
                    ) : (
                      <Settings2 className="size-3.5" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-foreground truncate">
                      {p.descripcion || (isGanado ? "Puntos por servicio" : "Canje de puntos")}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                      <Calendar className="size-2.5" />
                      {dateStr}
                    </p>
                  </div>
                </div>

                <span
                  className={`font-mono font-black text-xs shrink-0 ${
                    isGanado
                      ? "text-emerald-600 dark:text-emerald-400"
                      : isCanjeado
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {isGanado ? "+" : isCanjeado ? "-" : ""}
                  {Math.abs(p.puntos)} pts
                </span>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
}
