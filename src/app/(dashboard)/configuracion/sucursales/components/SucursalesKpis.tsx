"use client";

import { useMemo } from "react";
import { Building2, Building, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SucursalItem } from "./types";

interface SucursalesKpisProps {
  sucursales: SucursalItem[];
  limiteSucursales: number | null;
  userSucursalId: string | null;
}

export function SucursalesKpis({
  sucursales,
  limiteSucursales,
  userSucursalId,
}: SucursalesKpisProps) {
  const total = sucursales.length;
  const activas = useMemo(() => sucursales.filter((s) => s.activa).length, [sucursales]);
  const activeBranchName = useMemo(() => {
    return sucursales.find((s) => s.id === userSucursalId)?.nombre || "Ninguna seleccionada";
  }, [sucursales, userSucursalId]);

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
        {/* 1. Límite de Sucursales */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Building2 className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
              Límite de Sedes
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-foreground leading-none">
                {total}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                de {limiteSucursales === null ? "ilimitadas" : `${limiteSucursales} permitidas`}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Sucursales Activas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <Building className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Sedes Activas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {activas}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                operando comercialmente
              </span>
            </div>
          </div>
        </div>

        {/* 3. Sucursal de Trabajo */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-500 shrink-0">
            <ShieldCheck className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider block truncate">
              Sede Actual
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base sm:text-lg font-black text-foreground leading-none truncate max-w-[180px]">
                {activeBranchName}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                activa
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
