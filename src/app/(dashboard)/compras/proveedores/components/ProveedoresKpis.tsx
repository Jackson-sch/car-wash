"use client";

import { useMemo } from "react";
import { Building2, CheckCircle2, DollarSign, Crown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { ProveedorDirectoryItem } from "../../types";

interface ProveedoresKpisProps {
  proveedores: ProveedorDirectoryItem[];
}

export function ProveedoresKpis({ proveedores }: ProveedoresKpisProps) {
  const stats = useMemo(() => {
    const total = proveedores.length;
    const activos = proveedores.filter((p) => p.activo).length;
    const gastoAcumulado = proveedores.reduce((acc, p) => acc + p.montoTotal, 0);
    const conCompras = proveedores.filter((p) => p.totalCompras > 0);
    const topProveedor =
      conCompras.length > 0
        ? conCompras.reduce((max, p) => (p.montoTotal > max.montoTotal ? p : max), conCompras[0])
        : null;

    return {
      total,
      activos,
      gastoAcumulado,
      topProveedor,
    };
  }, [proveedores]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Total Proveedores */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
            <Building2 className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Proveedores
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {stats.total}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                registrados
              </span>
            </div>
          </div>
        </div>

        {/* 2. Proveedores Activos */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Operativos
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {stats.activos}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                habilitados
              </span>
            </div>
          </div>
        </div>

        {/* 3. Gasto Acumulado */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
            <DollarSign className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider block truncate">
              Volumen Comprado
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {formatCurrency(stats.gastoAcumulado)}
              </span>
            </div>
          </div>
        </div>

        {/* 4. Mayor Proveedor */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <Crown className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Principal Proveedor
            </span>
            <div className="mt-0.5">
              {stats.topProveedor ? (
                <p className="text-xs font-bold text-foreground truncate">
                  {stats.topProveedor.razonSocial}
                </p>
              ) : (
                <span className="text-xs text-muted-foreground">Sin compras</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
