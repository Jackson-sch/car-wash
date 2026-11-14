"use client";

import { useState, useMemo } from "react";
import {
  Lock,
  CreditCard,
  Coins,
  MinusCircle,
  PlusCircle,
  FileSpreadsheet,
  Banknote,
  Smartphone,
  Landmark,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { formatCurrency } from "@/lib/formats";
import type { TurnoActivo } from "./types";
import { RegistrarEgresoModal } from "./RegistrarEgresoModal";
import { CorteXModal } from "./CorteXModal";

interface CajaSummaryCardProps {
  turno: TurnoActivo;
}

export function CajaSummaryCard({ turno }: CajaSummaryCardProps) {
  const [showEgresoModal, setShowEgresoModal] = useState(false);
  const [showCorteXModal, setShowCorteXModal] = useState(false);

  // Cálculos de ventas y desglose financiero
  const stats = useMemo(() => {
    const openingCash = parseFloat(turno.montoInicial) || 0;
    const efectivoVentas =
      turno.pagos.find((p) => p.metodo === "efectivo")?.total || 0;
    const tarjetaVentas =
      turno.pagos.find((p) => p.metodo === "tarjeta")?.total || 0;
    const yapeVentas = turno.pagos.find((p) => p.metodo === "yape")?.total || 0;
    const plinVentas = turno.pagos.find((p) => p.metodo === "plin")?.total || 0;
    const yapePlinVentas = yapeVentas + plinVentas;
    const transferenciasVentas =
      turno.pagos.find((p) => p.metodo === "transferencia")?.total || 0;
    const totalEgresos = turno.totalEgresos || 0;

    const efectivoEnGaveta = Math.max(0, openingCash + efectivoVentas - totalEgresos);
    const ventasDigitales = tarjetaVentas + yapePlinVentas + transferenciasVentas;
    const totalFacturado = efectivoVentas + ventasDigitales;

    return {
      openingCash,
      efectivoVentas,
      tarjetaVentas,
      yapePlinVentas,
      transferenciasVentas,
      totalEgresos,
      efectivoEnGaveta,
      ventasDigitales,
      totalFacturado,
    };
  }, [turno]);

  return (
    <Card className="col-span-1 md:col-span-12 xl:col-span-4 bg-card border border-border/90 shadow-sm p-5 sm:p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex justify-between items-center mb-5 border-b border-border/60 pb-3.5">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
              Arqueo y Liquidación
            </h3>
            <span className="text-[10px] text-muted-foreground block font-medium">
              Control en tiempo real
            </span>
          </div>
          <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Turno Abierto
          </span>
        </div>

        {/* Efectivo Físico en Gaveta Principal */}
        <div className="mb-5 p-4 rounded-xl bg-muted/40 border border-border/80">
          <div className="flex items-center justify-between text-[11px] text-muted-foreground mb-1 font-bold">
            <span>Efectivo Físico en Gaveta</span>
            <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400">Esperado para Arqueo</span>
          </div>
          <span className="text-3xl font-black font-mono text-emerald-500 tracking-tight block">
            {formatCurrency(stats.efectivoEnGaveta)}
          </span>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <Coins className="size-3 text-emerald-500/80" />
            <span>Fondo {formatCurrency(stats.openingCash)} + Cobros {formatCurrency(stats.efectivoVentas)} {stats.totalEgresos > 0 ? `- Egresos ${formatCurrency(stats.totalEgresos)}` : ""}</span>
          </p>
        </div>

        {/* Desglose por método de pago */}
        <div className="space-y-2 mb-5 text-xs font-medium">
          <div className="flex justify-between items-center py-1.5 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Coins className="size-3.5 text-muted-foreground" /> Fondo Inicial
            </span>
            <span className="text-foreground font-mono font-bold">
              {formatCurrency(stats.openingCash)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-border/40 text-emerald-600 dark:text-emerald-400">
            <span className="flex items-center gap-1.5 font-bold">
              <Banknote className="size-3.5 text-emerald-500" /> (+) Ventas en Efectivo
            </span>
            <span className="font-mono font-black">
              +{formatCurrency(stats.efectivoVentas)}
            </span>
          </div>

          {stats.totalEgresos > 0 && (
            <div className="flex justify-between items-center py-1.5 border-b border-border/40 bg-rose-500/10 px-2 rounded-lg text-rose-500 font-bold">
              <span className="flex items-center gap-1.5">
                <MinusCircle className="size-3.5 text-rose-500" /> (-) Egresos / Salidas
              </span>
              <span className="font-mono font-black">
                -{formatCurrency(stats.totalEgresos)}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center py-1.5 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Smartphone className="size-3.5 text-purple-400" /> Yape / Plin
            </span>
            <span className="text-foreground font-mono font-bold">
              {formatCurrency(stats.yapePlinVentas)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="size-3.5 text-sky-400" /> Cobros Tarjeta (POS)
            </span>
            <span className="text-foreground font-mono font-bold">
              {formatCurrency(stats.tarjetaVentas)}
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Landmark className="size-3.5 text-amber-400" /> Transferencias
            </span>
            <span className="text-foreground font-mono font-bold">
              {formatCurrency(stats.transferenciasVentas)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 text-xs">
            <span className="font-black uppercase tracking-wider text-muted-foreground">
              Total Facturado del Turno
            </span>
            <span className="font-black font-mono text-secondary text-sm">
              {formatCurrency(stats.totalFacturado)}
            </span>
          </div>
        </div>
      </div>

      {/* Botones de Acción Operativa */}
      <div className="space-y-2 mt-2 pt-3 border-t border-border/70">
        <Link
          href="/caja/cierre"
          className="w-full h-10 rounded-xl bg-secondary hover:bg-sky-400 text-slate-950 font-black text-xs flex items-center justify-between px-3.5 shadow-md shadow-secondary/15 cursor-pointer transition-all active:scale-95 group"
        >
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-slate-950" />
            <span>Cerrar Turno (Corte de Caja)</span>
          </div>
          <kbd className="px-2 py-0.5 rounded bg-slate-950/20 text-slate-950 font-mono font-black text-[11px] group-hover:scale-105 transition-transform">
            C
          </kbd>
        </Link>

        <div className="grid grid-cols-2 gap-2">
          <Button
            type="button"
            onClick={() => setShowEgresoModal(true)}
            variant="outline"
            className="w-full font-bold text-xs h-9 gap-1.5 cursor-pointer border-rose-500/40 text-rose-500 hover:bg-rose-500/10 justify-between px-2.5 rounded-xl transition-all"
          >
            <div className="flex items-center gap-1.5 truncate">
              <PlusCircle className="size-3.5 text-rose-500 shrink-0" />
              <span className="truncate">Egreso (-)</span>
            </div>
            <kbd className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground border border-border">
              E
            </kbd>
          </Button>

          <Button
            type="button"
            onClick={() => setShowCorteXModal(true)}
            variant="outline"
            className="w-full font-bold text-xs h-9 gap-1.5 cursor-pointer border-border/90 text-foreground hover:bg-muted justify-between px-2.5 rounded-xl transition-all"
          >
            <div className="flex items-center gap-1.5 truncate">
              <FileSpreadsheet className="size-3.5 text-secondary shrink-0" />
              <span className="truncate">Corte X</span>
            </div>
            <kbd className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground border border-border">
              X
            </kbd>
          </Button>
        </div>
      </div>

      {/* Modal de Registro de Egreso */}
      <RegistrarEgresoModal
        open={showEgresoModal}
        onOpenChange={setShowEgresoModal}
      />

      {/* Modal de Corte X */}
      <CorteXModal
        open={showCorteXModal}
        onOpenChange={setShowCorteXModal}
        turno={turno}
      />
    </Card>
  );
}
