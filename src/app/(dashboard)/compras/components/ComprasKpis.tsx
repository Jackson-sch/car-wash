"use client";

import { useMemo } from "react";
import { ReceiptText, DollarSign, PackageCheck, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { CompraItem } from "../types";

interface ComprasKpisProps {
  compras: CompraItem[];
}

export function ComprasKpis({ compras }: ComprasKpisProps) {
  const stats = useMemo(() => {
    const totalComprobantes = compras.length;
    const completadas = compras.filter((c) => c.estado === "completada");
    const anuladas = compras.filter((c) => c.estado === "anulada").length;

    const totalInvertido = completadas.reduce(
      (acc, c) => acc + parseFloat(c.total || "0"),
      0
    );

    const totalUnidadesIngresadas = completadas.reduce((acc, c) => {
      const sumaDetalles = c.detalles.reduce(
        (sub, d) => sub + parseFloat(d.cantidad || "0"),
        0
      );
      return acc + sumaDetalles;
    }, 0);

    return {
      totalComprobantes,
      completadasCount: completadas.length,
      anuladasCount: anuladas,
      totalInvertido,
      totalUnidadesIngresadas,
    };
  }, [compras]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Comprobantes Registrados */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <ReceiptText className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Comprobantes
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {stats.totalComprobantes}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.completadasCount} vigentes
              </span>
            </div>
          </div>
        </div>

        {/* 2. Inversión en Insumos */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <DollarSign className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Inversión Total
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {formatCurrency(stats.totalInvertido)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                en compras
              </span>
            </div>
          </div>
        </div>

        {/* 3. Insumos Ingresados */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <PackageCheck className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Mercadería Recibida
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {stats.totalUnidadesIngresadas.toFixed(0)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                unidades a stock
              </span>
            </div>
          </div>
        </div>

        {/* 4. Anulaciones / Alertas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div
            className={`size-9 rounded-xl border flex items-center justify-center shrink-0 ${
              stats.anuladasCount > 0
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-muted text-muted-foreground border-border"
            }`}
          >
            <ShieldAlert className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider block truncate ${
                stats.anuladasCount > 0
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-muted-foreground"
              }`}
            >
              Auditoría
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span
                className={`text-lg sm:text-xl font-black font-mono leading-none ${
                  stats.anuladasCount > 0
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-foreground"
                }`}
              >
                {stats.anuladasCount}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                {stats.anuladasCount === 1 ? "compra anulada" : "anuladas"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
