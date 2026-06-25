"use client";

import { useMemo } from "react";
import { Building2, Building, ShieldCheck, HelpCircle } from "lucide-react";
import { StatsCard } from "@/components/shared/StatsCard";
import { SucursalItem } from "./types";

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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
      {/* Total de Sucursales */}
      <div className="p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Límite de Sucursales
          </span>
          <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 shrink-0">
            <Building2 className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">
            {total} <span className="text-sm font-semibold text-muted-foreground">/ {limiteSucursales === null ? "Ilimitado" : limiteSucursales}</span>
          </p>
          <p className="text-muted-foreground font-semibold text-[10px] mt-1">
            Sucursales creadas en tu plan
          </p>
        </div>
      </div>

      {/* Sucursales Activas */}
      <div className="p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Sucursales Activas
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
            <Building className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-3xl font-black text-foreground tracking-tight">{activas}</p>
          <p className="text-emerald-500 font-bold text-[10px] mt-1">
            Operando comercialmente
          </p>
        </div>
      </div>

      {/* Sucursal de Trabajo */}
      <div className="p-5 rounded-2xl flex flex-col justify-between hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.2)] transition-all duration-300 bg-card border border-border relative overflow-hidden group">
        <div className="flex justify-between items-start">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground">
            Sucursal Activa Actual
          </span>
          <div className="p-2 rounded-xl bg-violet-500/10 dark:bg-violet-500/20 text-violet-650 dark:text-violet-400 border border-violet-500/20 shrink-0">
            <ShieldCheck className="h-4.5 w-4.5" />
          </div>
        </div>
        <div className="mt-4">
          <p className="text-lg font-black text-foreground tracking-tight truncate max-w-full">
            {activeBranchName}
          </p>
          <p className="text-muted-foreground font-semibold text-[10px] mt-1.5">
            Lugar de trabajo seleccionado
          </p>
        </div>
      </div>
    </div>
  );
}
