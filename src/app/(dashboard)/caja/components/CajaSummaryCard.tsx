import { useMemo } from "react";
import {
  Lock,
  TrendingUp,
  CreditCard,
  Wallet,
  Coins,
  ArrowUpRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/formats";
import { TurnoActivo } from "./types";

interface CajaSummaryCardProps {
  turno: TurnoActivo;
}

export function CajaSummaryCard({ turno }: CajaSummaryCardProps) {
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

    const totalVentas =
      turno.pagos.reduce((acc, curr) => acc + curr.total, 0) || 0;
    const totalBalance = openingCash + totalVentas;

    return {
      openingCash,
      efectivoVentas,
      tarjetaVentas,
      yapePlinVentas,
      transferenciasVentas,
      totalVentas,
      totalBalance,
    };
  }, [turno]);

  return (
    <Card className="col-span-1 md:col-span-12 xl:col-span-4 bg-card border-border shadow-sm p-6 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-center mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Balance en Caja
          </h3>
          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-450 font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>{" "}
            Abierto
          </span>
        </div>

        <div className="mb-6">
          <span className="text-3xl font-black text-zinc-900 tracking-tight">
            {formatCurrency(stats.totalBalance)}
          </span>
          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-0.5 font-medium">
            <TrendingUp className="size-3.5 text-emerald-500" />
            Acumulado en tiempo real
          </p>
        </div>

        <div className="space-y-2 mb-6 text-xs font-medium">
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Coins className="size-4 text-zinc-400" /> Fondo Inicial
            </span>
            <span className="text-zinc-800 font-bold">
              {formatCurrency(stats.openingCash)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Wallet className="size-4 text-zinc-400" /> Ventas Efectivo
            </span>
            <span className="text-zinc-800 font-bold">
              {formatCurrency(stats.efectivoVentas)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <CreditCard className="size-4 text-zinc-400" /> Cobros Tarjeta
            </span>
            <span className="text-zinc-800 font-bold">
              {formatCurrency(stats.tarjetaVentas)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-zinc-100 dark:border-zinc-800/40">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <Wallet className="size-4 text-zinc-400" /> Yape / Plin
            </span>
            <span className="text-zinc-800 font-bold">
              {formatCurrency(stats.yapePlinVentas)}
            </span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-muted-foreground flex items-center gap-1.5">
              <ArrowUpRight className="size-4 text-zinc-400" />{" "}
              Transferencias
            </span>
            <span className="text-zinc-800 font-bold">
              {formatCurrency(stats.transferenciasVentas)}
            </span>
          </div>
        </div>
      </div>

      <Link
        href="/caja/cierre"
        className={cn(
          "w-full bg-primary hover:bg-primary/80 text-primary-foreground font-bold text-xs h-10 rounded-lg gap-2 cursor-pointer shadow-sm flex items-center justify-center mt-4",
        )}
      >
        <Lock className="size-4" />
        Cerrar Turno (Corte de Caja)
      </Link>
    </Card>
  );
}
