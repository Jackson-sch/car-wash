"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TurnoActivo, SystemStats } from "../types";
import { formatDate, formatCurrency } from "@/lib/formats";

interface CierreHeaderProps {
  turno: TurnoActivo;
  systemStats: SystemStats;
  onPrint: () => void;
  reconciliado?: boolean;
}

export function CierreHeader({
  turno,
  systemStats,
  onPrint,
  reconciliado = false,
}: CierreHeaderProps) {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4 print:hidden">
        <div className="space-y-1.5">
          {/* Breadcrumb / Back button */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/caja")}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors cursor-pointer group"
            >
              <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" />
              <span>Volver al Control de Caja</span>
            </button>
            <span className="text-muted-foreground/40 text-xs">•</span>
            <span className="text-xs text-secondary font-semibold">Corte Z / Liquidación</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap" suppressHydrationWarning>
            <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
              Cierre de Turno y Arqueo
            </h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              Turno #{turno.id.slice(0, 8).toUpperCase()}
            </span>
            {reconciliado && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-500 border border-sky-500/20 flex items-center gap-1">
                <CheckCircle2 className="size-3" /> Saldos Conciliados
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Complete el conteo físico de gaveta, reporte los saldos digitales y emita el corte final de caja.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex-1 md:flex-none text-xs font-bold gap-1.5 h-9 rounded-lg cursor-pointer"
          >
            <Printer className="size-3.5" /> Imprimir Hoja
          </Button>

          <a
            href={`/api/pdf/cierre/${turno.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 h-9 text-xs font-bold bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-lg transition-colors shadow-xs cursor-pointer flex-1 md:flex-none"
          >
            <FileText className="size-3.5" /> PDF Ticket Cierre
          </a>
        </div>
      </div>

      {/* Impresión en papel */}
      <div className="hidden print:block border-b border-zinc-300 pb-4 mb-4">
        <h1 className="text-xl font-bold text-center uppercase tracking-wide">
          WashMaster Pro - Reporte Oficial de Cierre de Caja
        </h1>
        <div className="grid grid-cols-2 gap-2 text-xs mt-3">
          <p>
            <strong>Cajero Responsable:</strong> {turno.nombreEmpleado}{" "}
            {turno.apellidoEmpleado || ""}
          </p>
          <p>
            <strong>ID Turno:</strong> {turno.id}
          </p>
          <p suppressHydrationWarning>
            <strong>Fecha Apertura:</strong>{" "}
            {formatDate(new Date(turno.apertura), "dd/MM/yyyy hh:mm a")}
          </p>
          <p suppressHydrationWarning>
            <strong>Fecha Liquidación:</strong>{" "}
            {formatDate(new Date(), "dd/MM/yyyy hh:mm a")}
          </p>
          <p>
            <strong>Monto Inicial en Gaveta:</strong>{" "}
            {formatCurrency(systemStats.openingCash)}
          </p>
          {systemStats.totalEgresos > 0 && (
            <p>
              <strong>Egresos de Caja Chica:</strong> -
              {formatCurrency(systemStats.totalEgresos)}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
