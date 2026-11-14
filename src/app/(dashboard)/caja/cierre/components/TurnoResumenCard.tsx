"use client";

import { BarChart3, TrendingUp, Tag, Receipt, Lock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";

interface TurnoResumenCardProps {
  resumen: {
    totalServicios: number;
    ventasBrutas: number;
    descuentos: number;
    ingresosNetos: number;
  };
  shouldReveal?: boolean;
}

export function TurnoResumenCard({ resumen, shouldReveal = false }: TurnoResumenCardProps) {
  return (
    <Card className="p-4 sm:p-5 border-border bg-card shadow-xs space-y-4 print:shadow-none print:bg-white">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <BarChart3 className="size-4 text-secondary" />
          <h2 className="text-xs uppercase font-black text-muted-foreground tracking-wider">
            Resumen Operativo
          </h2>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            shouldReveal
              ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {shouldReveal ? (
            <>
              <ShieldCheck className="size-3 text-amber-500" />
              Auditoría Supervisor
            </>
          ) : (
            <>
              <Lock className="size-3 text-secondary" /> Ciego Antifraude
            </>
          )}
        </span>
      </div>

      <div className="space-y-3 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <Receipt className="size-3.5 text-muted-foreground" /> Servicios Cobrados
          </span>
          <span className="font-mono font-bold text-foreground">
            {resumen.totalServicios} órdenes
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <TrendingUp className="size-3.5 text-muted-foreground" /> Ventas Brutas
          </span>
          {shouldReveal ? (
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(resumen.ventasBrutas)}
            </span>
          ) : (
            <span className="font-mono text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Lock className="size-3 text-muted-foreground/60" /> Oculto
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
            <Tag className="size-3.5 text-muted-foreground" /> Descuentos Aplicados
          </span>
          {shouldReveal ? (
            <span
              className={`font-mono font-bold ${
                resumen.descuentos > 0 ? "text-rose-500" : "text-muted-foreground"
              }`}
            >
              {resumen.descuentos > 0
                ? `-${formatCurrency(resumen.descuentos)}`
                : formatCurrency(0)}
            </span>
          ) : (
            <span className="font-mono text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Lock className="size-3 text-muted-foreground/60" /> Oculto
            </span>
          )}
        </div>

        <div className="border-t border-border pt-3 flex justify-between items-baseline font-bold">
          <span className="text-foreground text-xs uppercase tracking-wide">
            Ingresos Netos Facturados
          </span>
          {shouldReveal ? (
            <span className="text-secondary text-base font-black font-mono tracking-tight">
              {formatCurrency(resumen.ingresosNetos)}
            </span>
          ) : (
            <span className="font-mono text-xs font-bold text-muted-foreground flex items-center gap-1 bg-muted/60 px-2 py-0.5 rounded border border-border">
              <Lock className="size-3 text-secondary" /> Oculto por Arqueo a Ciegas
            </span>
          )}
        </div>

        {!shouldReveal && (
          <p className="text-[10px] text-muted-foreground/75 leading-tight pt-1">
            Saldos facturados protegidos para garantizar un conteo honesto de caja.
          </p>
        )}
      </div>
    </Card>
  );
}
