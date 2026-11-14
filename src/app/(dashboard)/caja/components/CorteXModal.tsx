"use client";

import { useMemo, useCallback } from "react";
import {
  Printer,
  FileSpreadsheet,
  Banknote,
  Smartphone,
  CreditCard,
  Landmark,
  Coins,
  MinusCircle,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formats";
import type { TurnoActivo } from "./types";

interface CorteXModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turno: TurnoActivo;
}

export function CorteXModal({ open, onOpenChange, turno }: CorteXModalProps) {
  const stats = useMemo(() => {
    const openingCash = parseFloat(turno.montoInicial) || 0;
    const efectivoVentas =
      turno.pagos.find((p) => p.metodo === "efectivo")?.total || 0;
    const tarjetaVentas =
      turno.pagos.find((p) => p.metodo === "tarjeta")?.total || 0;
    const yapeVentas = turno.pagos.find((p) => p.metodo === "yape")?.total || 0;
    const plinVentas = turno.pagos.find((p) => p.metodo === "plin")?.total || 0;
    const transferenciaVentas =
      turno.pagos.find((p) => p.metodo === "transferencia")?.total || 0;
    const totalEgresos = turno.totalEgresos || 0;

    const efectivoEnGaveta = Math.max(0, openingCash + efectivoVentas - totalEgresos);
    const ventasDigitales = tarjetaVentas + yapeVentas + plinVentas + transferenciaVentas;
    const totalFacturado = efectivoVentas + ventasDigitales;
    const totalOrdenes = turno.transaccionesDetalladas.length;

    return {
      openingCash,
      efectivoVentas,
      tarjetaVentas,
      yapeVentas,
      plinVentas,
      transferenciaVentas,
      totalEgresos,
      efectivoEnGaveta,
      ventasDigitales,
      totalFacturado,
      totalOrdenes,
      cajero: `${turno.nombreEmpleado} ${turno.apellidoEmpleado || ""}`.trim(),
    };
  }, [turno]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border/90 rounded-3xl max-w-md p-5 sm:p-7 shadow-2xl text-foreground">
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="size-12 rounded-2xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary shadow-lg shadow-secondary/10">
            <FileSpreadsheet className="size-6" />
          </div>

          <DialogTitle className="text-xl font-black text-foreground tracking-tight">
            Reporte Parcial de Caja (Corte X)
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            Arqueo de control en tiempo real. Este corte NO cierra el turno activo.
          </DialogDescription>
        </DialogHeader>

        {/* Simulación del Ticket Térmico de Corte X */}
        <div className="bg-muted/30 border border-border/80 rounded-2xl p-4 space-y-3 font-mono text-xs">
          <div className="text-center pb-2 border-b border-dashed border-border/80 space-y-0.5">
            <span className="font-extrabold uppercase text-foreground block text-sm tracking-wide">
              CAR WASH PRO PERÚ
            </span>
            <span className="text-[10px] text-muted-foreground block">
              CORTE PARCIAL DE ARQUEO (CORTE X)
            </span>
            <span className="text-[10px] text-muted-foreground block flex items-center justify-center gap-1">
              <Clock className="size-3" /> {formatDate(new Date(), "dd/MM/yyyy hh:mm a")}
            </span>
          </div>

          {/* Metadata del cajero */}
          <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-border/80">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cajero:</span>
              <span className="font-bold text-foreground">{stats.cajero}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Apertura:</span>
              <span className="font-bold text-foreground">{formatDate(turno.apertura, "dd/MM/yyyy hh:mm a")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tickets Cobrados:</span>
              <span className="font-bold text-secondary">{stats.totalOrdenes} órdenes</span>
            </div>
          </div>

          {/* Desglose por método */}
          <div className="space-y-1.5 text-[11px] pb-2 border-b border-dashed border-border/80">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Coins className="size-3" /> Fondo Inicial
              </span>
              <span className="font-bold text-foreground">{formatCurrency(stats.openingCash)}</span>
            </div>
            <div className="flex justify-between items-center text-emerald-500 font-semibold">
              <span className="flex items-center gap-1">
                <Banknote className="size-3" /> (+) Ventas Efectivo
              </span>
              <span>+{formatCurrency(stats.efectivoVentas)}</span>
            </div>
            {stats.totalEgresos > 0 && (
              <div className="flex justify-between items-center text-rose-500 font-semibold">
                <span className="flex items-center gap-1">
                  <MinusCircle className="size-3" /> (-) Egresos de Caja
                </span>
                <span>-{formatCurrency(stats.totalEgresos)}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Smartphone className="size-3" /> Yape / Plin
              </span>
              <span className="font-bold text-foreground">
                {formatCurrency(stats.yapeVentas + stats.plinVentas)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <CreditCard className="size-3" /> Tarjetas (POS)
              </span>
              <span className="font-bold text-foreground">{formatCurrency(stats.tarjetaVentas)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center gap-1">
                <Landmark className="size-3" /> Transferencias
              </span>
              <span className="font-bold text-foreground">{formatCurrency(stats.transferenciaVentas)}</span>
            </div>
          </div>

          {/* Totales consolidados */}
          <div className="pt-1 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-extrabold uppercase text-muted-foreground">Total Facturado:</span>
              <span className="font-black text-secondary">{formatCurrency(stats.totalFacturado)}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block">
                  Efectivo Físico Esperado en Gaveta
                </span>
                <span className="text-[9px] text-muted-foreground">Fondo + Efectivo - Egresos</span>
              </div>
              <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(stats.efectivoEnGaveta)}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones del Modal */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={handlePrint}
            className="w-full h-11 rounded-xl bg-secondary hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-between px-4 shadow-md shadow-secondary/20 cursor-pointer transition-all"
          >
            <div className="flex items-center gap-2">
              <Printer className="size-4 text-slate-950" />
              <span>Imprimir Ticket de Corte X</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-950/20 text-slate-950 font-mono font-black text-[11px]">
              ↵ Enter
            </kbd>
          </Button>

          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="w-full h-9 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cerrar y Volver a Caja
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
