"use client";

import { useMemo } from "react";
import { Package, Gift, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import { PaqueteItem } from "./types";

interface PaquetesKpisProps {
  paquetes: PaqueteItem[];
}

export function PaquetesKpis({ paquetes }: PaquetesKpisProps) {
  const totalPaquetes = paquetes.length;
  const activos = useMemo(() => paquetes.filter((p) => p.activo).length, [paquetes]);
  const valorTotal = useMemo(
    () => paquetes.reduce((acc, p) => acc + parseFloat(p.precio || "0"), 0),
    [paquetes]
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
      {/* Total de Paquetes */}
      <div className="p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Total de Paquetes
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Package className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">{totalPaquetes}</p>
          <p className="text-muted-foreground font-semibold text-[10px] mt-1">
            Combos registrados
          </p>
        </div>
      </div>

      {/* Paquetes Activos */}
      <div className="p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Paquetes Activos
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Gift className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">{activos}</p>
          <p className="text-emerald-500 font-bold text-[10px] mt-1">
            Disponibles en patio
          </p>
        </div>
      </div>

      {/* Valor Total */}
      <div className="p-5 rounded-2xl border-l-4 border-l-secondary flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Valor de Combos
          </span>
          <div className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
            <TrendingUp className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">
            {formatCurrency(valorTotal)}
          </p>
          <p className="text-muted-foreground font-semibold text-[10px] mt-1">
            Suma del precio de venta
          </p>
        </div>
      </div>
    </div>
  );
}
