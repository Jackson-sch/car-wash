"use client";

import { useMemo } from "react";
import {
  Banknote,
  Smartphone,
  Receipt,
  MinusCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { TurnoActivo } from "./types";

interface CajaKpisProps {
  turno: TurnoActivo;
}

export function CajaKpis({ turno }: CajaKpisProps) {
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
    const egresosCount = turno.egresosList?.length || 0;

    return {
      openingCash,
      efectivoVentas,
      tarjetaVentas,
      yapePlinVentas: yapeVentas + plinVentas,
      transferenciaVentas,
      totalEgresos,
      efectivoEnGaveta,
      ventasDigitales,
      totalFacturado,
      totalOrdenes,
      egresosCount,
    };
  }, [turno]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Efectivo en Gaveta */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Banknote className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Efectivo en Gaveta
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(stats.efectivoEnGaveta)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                contado
              </span>
            </div>
          </div>
        </div>

        {/* 2. Cobros Digitales */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Smartphone className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block truncate">
              Cobros Digitales
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-purple-500 leading-none">
                {formatCurrency(stats.ventasDigitales)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                POS / Yape / Plin
              </span>
            </div>
          </div>
        </div>

        {/* 3. Ventas Totales */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Receipt className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Ventas Totales
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-secondary leading-none">
                {formatCurrency(stats.totalFacturado)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.totalOrdenes} cobros
              </span>
            </div>
          </div>
        </div>

        {/* 4. Egresos / Salidas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
            <MinusCircle className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider block truncate">
              Egresos / Salidas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-rose-600 dark:text-rose-400 leading-none">
                {stats.totalEgresos > 0 ? `-${formatCurrency(stats.totalEgresos)}` : "S/ 0.00"}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.egresosCount} {stats.egresosCount === 1 ? "salida" : "salidas"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
