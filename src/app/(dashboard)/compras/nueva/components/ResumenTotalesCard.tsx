"use client";

import Link from "next/link";
import { DollarSign, ShieldCheck, Loader2, PackageCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formats";

interface ResumenTotalesCardProps {
  subtotal: number;
  igv: number;
  total: number;
  incluyeIgv: boolean;
  setIncluyeIgv: (val: boolean) => void;
  observaciones: string;
  setObservaciones: (val: string) => void;
  isSubmitting: boolean;
  totalItemsCount: number;
}

export function ResumenTotalesCard({
  subtotal,
  igv,
  total,
  incluyeIgv,
  setIncluyeIgv,
  observaciones,
  setObservaciones,
  isSubmitting,
  totalItemsCount,
}: ResumenTotalesCardProps) {
  return (
    <div className="space-y-4">
      {/* Tarjeta de Resumen Financiero */}
      <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <DollarSign className="size-4 text-secondary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Resumen de Facturación
          </h2>
        </div>

        {/* Desglose */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <label
              htmlFor="igvCheckbox"
              className="flex items-center gap-2 cursor-pointer select-none"
            >
              <input
                type="checkbox"
                id="igvCheckbox"
                checked={incluyeIgv}
                onChange={(e) => setIncluyeIgv(e.target.checked)}
                className="size-4 rounded border-border accent-secondary cursor-pointer"
              />
              <span>Incluye IGV (18%)</span>
            </label>
            <span className="font-mono font-bold text-foreground">
              {incluyeIgv ? formatCurrency(igv) : "S/ 0.00"}
            </span>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-baseline justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Total Factura
              </span>
              <span className="text-[10px] text-muted-foreground">
                {totalItemsCount} {totalItemsCount === 1 ? "insumo" : "insumos"} en detalle
              </span>
            </div>
            <span className="text-2xl font-black font-mono text-secondary">
              {formatCurrency(total)}
            </span>
          </div>
        </div>

        {/* Impacto en Almacén */}
        <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/20 space-y-1.5">
          <div className="flex items-center gap-2 text-secondary font-bold text-xs">
            <PackageCheck className="size-4 shrink-0" />
            <span>Actualización Inmediata</span>
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Al confirmar, las cantidades se sumarán al inventario, se actualizará el costo unitario
            y se generará el movimiento oficial en el Kardex.
          </p>
        </div>

        {/* Observaciones */}
        <div className="space-y-1.5 pt-1">
          <Label className="text-xs font-bold text-foreground">
            Observaciones o Notas (Opcional)
          </Label>
          <Textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Ej: Guía de remisión 001-284, entregado por transporte..."
            rows={3}
            className="rounded-xl border-border bg-muted/20 text-xs resize-none"
          />
        </div>

        {/* Botones de acción */}
        <div className="space-y-2 pt-2">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-xs gap-2 shadow-sm"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Registrando e ingresando stock...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="size-4" />
                <span>Confirmar e Ingresar a Stock</span>
              </>
            )}
          </Button>

          <Link href="/compras" className="block">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              className="w-full h-9 rounded-xl border-border hover:bg-muted text-xs font-semibold"
            >
              Cancelar
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
