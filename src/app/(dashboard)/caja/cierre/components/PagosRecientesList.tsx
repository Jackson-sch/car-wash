"use client";

import { Receipt, CreditCard, Wallet, Smartphone, Landmark, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/formats";
import { VehiclePlate } from "@/components/shared/VehiclePlate";
import type { PagoReciente } from "../types";

interface PagosRecientesListProps {
  pagos: PagoReciente[];
  shouldReveal?: boolean;
}

export function PagosRecientesList({ pagos, shouldReveal = false }: PagosRecientesListProps) {
  const getMethodIcon = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return <Wallet className="size-3 text-emerald-500" />;
      case "tarjeta":
        return <CreditCard className="size-3 text-indigo-500" />;
      case "yape":
      case "plin":
        return <Smartphone className="size-3 text-purple-500" />;
      case "transferencia":
        return <Landmark className="size-3 text-sky-500" />;
      default:
        return <Receipt className="size-3 text-muted-foreground" />;
    }
  };

  return (
    <Card className="border border-border bg-card shadow-xs overflow-hidden print:shadow-none print:bg-white">
      <div className="p-3.5 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Receipt className="size-4 text-muted-foreground" />
          <h2 className="text-xs uppercase font-black text-muted-foreground tracking-wider">
            Últimos Cobros Registrados
          </h2>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
            {pagos.length} {pagos.length === 1 ? "cobro" : "cobros"}
          </span>
          {!shouldReveal && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/10 text-secondary flex items-center gap-1 border border-secondary/20">
              <Lock className="size-2.5" /> Montos Ocultos
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-border/40 max-h-[260px] overflow-y-auto">
        {pagos.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No hay cobros registrados en este turno.
          </div>
        ) : (
          pagos.map((p) => (
            <div
              key={p.id}
              className="p-3 hover:bg-muted/20 transition-colors flex items-center justify-between gap-3 text-xs"
            >
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-foreground text-xs">
                    {p.nroTicket || "Ticket"}
                  </span>
                  {p.placa && <VehiclePlate plate={p.placa} size="xs" />}
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1 font-medium capitalize">
                    {getMethodIcon(p.metodo)} {p.metodo}
                  </span>
                  <span>•</span>
                  <span suppressHydrationWarning>
                    {formatDate(new Date(p.createdAt), "hh:mm a")}
                  </span>
                  {p.clienteNombre && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[100px] text-muted-foreground/80">
                        {p.clienteNombre}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {shouldReveal ? (
                <span className="font-mono font-extrabold text-foreground text-xs shrink-0">
                  {formatCurrency(p.monto)}
                </span>
              ) : (
                <span className="font-mono text-muted-foreground/70 text-xs shrink-0 flex items-center gap-1 font-semibold">
                  <Lock className="size-3 text-muted-foreground/50" /> S/ ••••
                </span>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
