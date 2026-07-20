"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, Lock, ShieldAlert } from "lucide-react";
import type { SystemStats } from "../types";
import { formatCurrency } from "@/lib/formats";

interface ConfirmCloseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  systemStats: SystemStats;
  totalEfectivoContado: number;
  actualCount: Record<string, string>;
  totalDiferencia: number;
  tieneDescuadre: boolean;
  isPending: boolean;
}

export function ConfirmCloseModal({
  open,
  onOpenChange,
  onConfirm,
  systemStats,
  totalEfectivoContado,
  actualCount,
  totalDiferencia,
  tieneDescuadre,
  isPending,
}: ConfirmCloseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border rounded-2xl max-w-md p-6 space-y-5">
        <div className="flex flex-col items-center text-center space-y-2">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center ${
              tieneDescuadre
                ? "bg-amber-500/10 text-amber-500"
                : "bg-emerald-500/10 text-emerald-500"
            }`}
          >
            {tieneDescuadre ? (
              <ShieldAlert className="h-6 w-6" />
            ) : (
              <CheckCircle2 className="h-6 w-6" />
            )}
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-md font-extrabold text-foreground text-center">
              {tieneDescuadre
                ? "¿Confirmar cierre con descuadre?"
                : "¿Confirmar cierre de turno?"}
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground text-center">
              Esta acción es <strong className="text-rose-500">irreversible</strong>.
              Revisa el resumen final antes de confirmar.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Resumen de Totales */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-2.5 text-xs">
          <div className="flex justify-between items-center font-medium">
            <span className="text-muted-foreground">Fondo Inicial</span>
            <span className="font-bold text-foreground">
              S/ {systemStats.openingCash.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span className="text-muted-foreground">Efectivo Contado</span>
            <span className="font-bold text-foreground">
              {formatCurrency(totalEfectivoContado)}
            </span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span className="text-muted-foreground">Tarjeta / POS</span>
            <span className="font-bold text-foreground">
              {formatCurrency(parseFloat(actualCount.tarjeta) || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span className="text-muted-foreground">Yape / Plin</span>
            <span className="font-bold text-foreground">
              {formatCurrency(parseFloat(actualCount.yapePlin) || 0)}
            </span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span className="text-muted-foreground">Transferencias</span>
            <span className="font-bold text-foreground">
              {formatCurrency(parseFloat(actualCount.transferencia) || 0)}
            </span>
          </div>
          <div className="border-t border-border pt-2.5 mt-2 flex justify-between items-baseline">
            <span className="font-bold text-foreground">Total General</span>
            <span className="text-sm font-extrabold text-foreground">
              {formatCurrency(
                totalEfectivoContado +
                  (parseFloat(actualCount.tarjeta) || 0) +
                  (parseFloat(actualCount.yapePlin) || 0) +
                  (parseFloat(actualCount.transferencia) || 0),
              )}
            </span>
          </div>

          {tieneDescuadre && (
            <div className="flex items-center gap-2 p-2.5 mt-2 bg-amber-500/5 border border-amber-500/10 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                Diferencia detectada:{" "}
                <span className="font-extrabold">
                  {totalDiferencia > 0 ? "+" : ""}
                  {formatCurrency(totalDiferencia)}
                </span>
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-1">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 text-xs font-semibold h-10 rounded-xl border border-zinc-200"
          >
            Revisar montos
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 text-xs font-bold h-10 rounded-xl cursor-pointer ${
              tieneDescuadre
                ? "bg-amber-500 hover:bg-amber-600 text-white"
                : ""
            }`}
            variant={tieneDescuadre ? "default" : "default"}
          >
            {isPending ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-1.5" />
                Cerrando...
              </>
            ) : (
              <>
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                {tieneDescuadre
                  ? "Cerrar con descuadre"
                  : "Confirmar y cerrar"}
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
