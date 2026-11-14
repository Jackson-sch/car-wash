"use client";

import { useSyncExternalStore, useMemo } from "react";
import { User, Clock, Wallet, ReceiptText, ArrowDownCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatDate, formatCurrency } from "@/lib/formats";
import type { TurnoActivo, SystemStats } from "../types";

const emptySubscribe = () => () => {};

interface TurnoInfoCardProps {
  turno: TurnoActivo;
  systemStats: SystemStats;
  totalServicios?: number;
}

export function TurnoInfoCard({ turno, systemStats, totalServicios = 0 }: TurnoInfoCardProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  const aperturaDate = useMemo(() => new Date(turno.apertura), [turno.apertura]);
  const horaApertura = useMemo(() => formatDate(aperturaDate, "hh:mm a"), [aperturaDate]);
  const fechaApertura = useMemo(() => formatDate(aperturaDate, "dd/MM/yyyy"), [aperturaDate]);

  const elapsedStr = useMemo(() => {
    if (!isClient || !turno.apertura) return "";
    const diffMs = Math.max(0, new Date().getTime() - aperturaDate.getTime());
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m transcurridos` : `${minutes}m transcurridos`;
  }, [isClient, turno.apertura, aperturaDate]);

  const initials = `${turno.nombreEmpleado?.[0] || "C"}${turno.apellidoEmpleado?.[0] || ""}`.toUpperCase();

  return (
    <Card className="p-4 sm:p-5 border-border bg-card shadow-xs print:shadow-none print:bg-white print:border-none">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 items-center">
        {/* Cajero */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-2 flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center text-secondary font-black text-sm shrink-0">
            {initials || <User className="size-5" />}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">
              Cajero Responsable
            </span>
            <p className="text-sm font-bold text-foreground truncate">
              {turno.nombreEmpleado} {turno.apellidoEmpleado || ""}
            </p>
            <span className="text-[10px] text-secondary font-medium">Turno activo</span>
          </div>
        </div>

        {/* Apertura & Tiempo */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
            <Clock className="size-3" /> Apertura
          </span>
          <p className="text-xs font-bold text-foreground" suppressHydrationWarning>
            {horaApertura}
          </p>
          <span className="text-[10px] text-muted-foreground block truncate" suppressHydrationWarning>
            {fechaApertura} {elapsedStr ? `• ${elapsedStr}` : ""}
          </span>
        </div>

        {/* Fondo Inicial */}
        <div className="space-y-0.5">
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
            <Wallet className="size-3 text-emerald-500" /> Fondo Inicial
          </span>
          <p className="text-xs font-extrabold text-foreground font-mono">
            {formatCurrency(systemStats.openingCash)}
          </p>
          <span className="text-[10px] text-muted-foreground block">Base entregada</span>
        </div>

        {/* Transacciones / Egresos */}
        <div className="space-y-0.5 col-span-2 sm:col-span-1">
          {systemStats.totalEgresos > 0 ? (
            <>
              <span className="text-[10px] text-rose-500 uppercase font-bold tracking-wider flex items-center gap-1">
                <ArrowDownCircle className="size-3" /> Egresos
              </span>
              <p className="text-xs font-extrabold text-rose-500 font-mono">
                -{formatCurrency(systemStats.totalEgresos)}
              </p>
              <span className="text-[10px] text-muted-foreground block">Salidas de gaveta</span>
            </>
          ) : (
            <>
              <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-1">
                <ReceiptText className="size-3 text-sky-500" /> Comprobantes
              </span>
              <p className="text-xs font-extrabold text-foreground">
                {totalServicios > 0 ? `${totalServicios} cobros` : "En proceso"}
              </p>
              <span className="text-[10px] text-muted-foreground block">Órdenes del turno</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
