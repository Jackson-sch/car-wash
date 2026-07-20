"use client";

import { useState, useMemo } from "react";
import {
  Lock,
  TrendingUp,
  CreditCard,
  Wallet,
  Coins,
  ArrowUpRight,
  MinusCircle,
  PlusCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formats";
import type { TurnoActivo } from "./types";
import { RegistrarEgresoModal } from "./RegistrarEgresoModal";

interface CajaSummaryCardProps {
  turno: TurnoActivo;
}

export function CajaSummaryCard({ turno }: CajaSummaryCardProps) {
  const [showEgresoModal, setShowEgresoModal] = useState(false);

  // Cálculos de ventas
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
    const totalEgresos = (turno as any).totalEgresos || 0;

    const totalVentas =
      turno.pagos.reduce((acc, curr) => acc + curr.total, 0) || 0;
    const totalBalance = Math.max(0, openingCash + totalVentas - totalEgresos);

    return {
      openingCash,
      efectivoVentas,
      tarjetaVentas,
      yapePlinVentas,
      transferenciasVentas,
      totalEgresos,
      totalVentas,
      totalBalance,
    };
  }, [turno]);

  return (
    <Card className="col-span-1 md:col-span-12 xl:col-span-4 bg-card border-border shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        <div className="flex justify-between items-center mb-6 border-b border-border/60 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Balance en Caja
          </h3>
          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
            Abierto
          </span>
        </div>

        <div className="mb-6">
          <span className="text-3xl font-black text-foreground tracking-tight">
            {formatCurrency(stats.totalBalance)}
          </span>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-0.5 font-medium">
            <TrendingUp className="size-3.5 text-emerald-500" />
            Acumulado en tiempo real
          </p>
        </div>

        <div className="space-y-2 mb-6 text-xs font-medium">
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Coins className="size-4 text-muted-foreground" /> Fondo Inicial
            </span>
            <span className="text-foreground font-bold">
              {formatCurrency(stats.openingCash)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Wallet className="size-4 text-muted-foreground" /> Ventas Efectivo
            </span>
            <span className="text-foreground font-bold">
              {formatCurrency(stats.efectivoVentas)}
            </span>
          </div>
          {stats.totalEgresos > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-border/40 bg-red-500/5 px-2 rounded-lg text-red-600">
              <span className="flex items-center gap-1.5 font-bold">
                <MinusCircle className="size-4 text-red-500" /> Egresos (- Salidas)
              </span>
              <span className="font-extrabold text-red-600">
                -{formatCurrency(stats.totalEgresos)}
              </span>
            </div>
          )}
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="size-4 text-muted-foreground" /> Cobros Tarjeta
            </span>
            <span className="text-foreground font-bold">
              {formatCurrency(stats.tarjetaVentas)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Wallet className="size-4 text-muted-foreground" /> Yape / Plin
            </span>
            <span className="text-foreground font-bold">
              {formatCurrency(stats.yapePlinVentas)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ArrowUpRight className="size-4 text-muted-foreground" />{" "}
              Transferencias
            </span>
            <span className="text-foreground font-bold">
              {formatCurrency(stats.transferenciasVentas)}
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <Button
          type="button"
          onClick={() => setShowEgresoModal(true)}
          variant="outline"
          className="w-full font-bold text-xs h-9 gap-1.5 cursor-pointer border-red-500/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
        >
          <PlusCircle className="size-4 text-red-500" />
          Registrar Egreso (Salida de Dinero)
        </Button>

        <Link
          href="/caja/cierre"
          className={cn(
            "w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs h-10 rounded-lg gap-2 cursor-pointer shadow-sm flex items-center justify-center transition-all duration-200 hover:scale-[1.01]",
          )}
        >
          <Lock className="size-4" />
          Cerrar Turno (Corte de Caja)
        </Link>
      </div>

      <RegistrarEgresoModal
        open={showEgresoModal}
        onOpenChange={setShowEgresoModal}
      />
    </Card>
  );
}
