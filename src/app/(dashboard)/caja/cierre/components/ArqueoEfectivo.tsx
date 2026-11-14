"use client";

import { useMemo, useCallback } from "react";
import { Banknote, Coins, Minus, Plus, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formats";
import { BILLETES, MONEDAS, type DenominacionItem } from "../types";

interface ArqueoEfectivoProps {
  cantidades: Record<string, string>;
  onCantidadesChange: (id: string, value: string) => void;
  totalEfectivoContado: number;
}

export function ArqueoEfectivo({
  cantidades,
  onCantidadesChange,
  totalEfectivoContado,
}: ArqueoEfectivoProps) {
  // Calcular subtotales de billetes y monedas
  const { subtotalBilletes, subtotalMonedas } = useMemo(() => {
    let billetesSum = 0;
    BILLETES.forEach((b) => {
      const cant = parseInt(cantidades[b.id] || "0") || 0;
      billetesSum += cant * b.val;
    });

    let monedasSum = 0;
    MONEDAS.forEach((m) => {
      const cant = parseInt(cantidades[m.id] || "0") || 0;
      monedasSum += cant * m.val;
    });

    return { subtotalBilletes: billetesSum, subtotalMonedas: monedasSum };
  }, [cantidades]);

  const handleStep = useCallback(
    (id: string, delta: number) => {
      // eslint-disable-next-line security/detect-object-injection
      const current = parseInt(cantidades[id] || "0") || 0;
      const next = Math.max(0, current + delta);
      onCantidadesChange(id, next === 0 ? "" : next.toString());
    },
    [cantidades, onCantidadesChange]
  );

  const handleReset = useCallback(() => {
    [...BILLETES, ...MONEDAS].forEach((d) => {
      if (cantidades[d.id]) {
        onCantidadesChange(d.id, "");
      }
    });
  }, [cantidades, onCantidadesChange]);

  const renderRow = (item: DenominacionItem, isCoin = false) => {
    const qty = parseInt(cantidades[item.id] || "0") || 0;
    const subtotal = qty * item.val;

    return (
      <div
        key={item.id}
        className={`group flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
          qty > 0
            ? "bg-secondary/5 border-secondary/25"
            : "bg-muted/20 border-border/70 hover:bg-muted/40"
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className={`inline-flex items-center justify-center font-bold font-mono text-[11px] border shrink-0 ${
              isCoin
                ? "h-8 w-8 rounded-full"
                : "h-7 px-2 rounded-lg"
            } ${item.badgeClass || "text-foreground bg-muted border-border"}`}
          >
            {item.shortLabel}
          </span>
          <span className="text-xs font-semibold text-foreground truncate hidden sm:inline">
            {item.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Stepper Controls */}
          <div className="inline-flex items-center rounded-lg border border-border bg-card overflow-hidden shadow-xs">
            <button
              type="button"
              onClick={() => handleStep(item.id, -1)}
              disabled={qty <= 0}
              aria-label={`Restar 1 ${item.shortLabel}`}
              className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
            >
              <Minus className="size-3" />
            </button>
            <Input
              type="number"
              min="0"
              step="1"
              placeholder="0"
              value={cantidades[item.id] || ""}
              onChange={(e) => onCantidadesChange(item.id, e.target.value)}
              className="w-12 h-8 text-center text-xs p-0 font-mono font-bold border-0 focus-visible:ring-0 bg-transparent text-foreground shadow-none rounded-none"
            />
            <button
              type="button"
              onClick={() => handleStep(item.id, 1)}
              aria-label={`Sumar 1 ${item.shortLabel}`}
              className="h-8 w-8 inline-flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              <Plus className="size-3" />
            </button>
          </div>

          {/* Subtotal */}
          <span
            className={`w-20 text-right font-mono font-bold text-xs truncate ${
              qty > 0 ? "text-foreground" : "text-muted-foreground/60"
            }`}
          >
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card className="border border-border bg-card shadow-xs overflow-hidden print:shadow-none print:bg-white">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-500">
            <Coins className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
              Paso 1: Arqueo Físico de Billetes y Monedas
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                Soles (PEN)
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Desglose el conteo de gaveta física; el total se vinculará a la conciliación.
            </p>
          </div>
        </div>

        {totalEfectivoContado > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 gap-1 rounded-lg cursor-pointer"
          >
            <RotateCcw className="size-3" /> Limpiar
          </Button>
        )}
      </div>

      {/* Grid Billetes y Monedas */}
      <div className="p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna Billetes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Banknote className="size-3.5 text-secondary" /> Billetes
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              {formatCurrency(subtotalBilletes)}
            </span>
          </div>
          <div className="space-y-2">
            {BILLETES.map((b) => renderRow(b, false))}
          </div>
        </div>

        {/* Columna Monedas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <span className="text-xs font-bold text-foreground flex items-center gap-1.5 uppercase tracking-wider">
              <Coins className="size-3.5 text-amber-500" /> Monedas
            </span>
            <span className="text-xs font-mono font-bold text-foreground">
              {formatCurrency(subtotalMonedas)}
            </span>
          </div>
          <div className="space-y-2">
            {MONEDAS.map((m) => renderRow(m, true))}
          </div>
        </div>
      </div>

      {/* Footer Summary */}
      <div className="p-4 border-t border-border bg-muted/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="text-xs text-muted-foreground flex items-center gap-4">
          <span>
            Billetes: <strong className="text-foreground font-mono">{formatCurrency(subtotalBilletes)}</strong>
          </span>
          <span>•</span>
          <span>
            Monedas: <strong className="text-foreground font-mono">{formatCurrency(subtotalMonedas)}</strong>
          </span>
        </div>

        <div className="flex items-baseline gap-2 self-end sm:self-auto">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Total Físico en Gaveta:
          </span>
          <span className="text-lg font-black text-secondary font-mono tracking-tight">
            {formatCurrency(totalEfectivoContado)}
          </span>
        </div>
      </div>
    </Card>
  );
}
