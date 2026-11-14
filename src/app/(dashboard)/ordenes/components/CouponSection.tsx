"use client";

import { Tag, AlertCircle, CheckCircle2, X, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface CouponApplied {
  cuponId: string;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: number;
  descuentoCalculado: number;
}

interface CouponSectionProps {
  cuponCode: string;
  setCuponCode: (val: string) => void;
  cuponError: string;
  setCuponError: (val: string) => void;
  couponApplied: CouponApplied | null;
  setCouponApplied: (val: CouponApplied | null) => void;
  onValidate: () => void;
  validatingCoupon: boolean;
}

export function CouponSection({
  cuponCode,
  setCuponCode,
  cuponError,
  setCuponError,
  couponApplied,
  setCouponApplied,
  onValidate,
  validatingCoupon,
}: CouponSectionProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (cuponCode.trim() && !validatingCoupon) {
        onValidate();
      }
    }
  };

  return (
    <div className="space-y-2 p-3.5 bg-card border border-border/80 rounded-2xl">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
          <Tag className="size-3 text-secondary" />
          Cupón de Descuento
        </span>
        {couponApplied && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
            <CheckCircle2 className="size-2.5" />
            Activo
          </span>
        )}
      </div>

      {couponApplied ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="size-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-black text-foreground block truncate">
                Cupón Aplicado con Éxito
              </span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                {couponApplied.tipoDescuento === "porcentaje"
                  ? `${couponApplied.valorDescuento}% de descuento aplicado`
                  : `S/ ${couponApplied.valorDescuento.toFixed(2)} de descuento directo`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setCouponApplied(null);
              setCuponCode("");
            }}
            aria-label="Quitar cupón"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
            title="Quitar cupón"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              placeholder="Ej. VERANO2026"
              value={cuponCode}
              onChange={(e) => {
                setCuponCode(e.target.value.toUpperCase());
                setCuponError("");
              }}
              onKeyDown={handleKeyDown}
              className="h-9.5 text-xs uppercase font-mono font-bold bg-muted/40 border-border rounded-xl placeholder:normal-case placeholder:font-sans"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onValidate}
            disabled={!cuponCode.trim() || validatingCoupon}
            className="h-9.5 text-xs font-bold px-4 rounded-xl cursor-pointer hover:bg-secondary/15 hover:border-secondary transition-colors"
          >
            {validatingCoupon ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              "Validar"
            )}
          </Button>
        </div>
      )}

      {cuponError && (
        <div className="flex items-center gap-1.5 text-[11px] text-rose-500 font-semibold mt-1">
          <AlertCircle className="size-3.5 shrink-0" />
          <span>{cuponError}</span>
        </div>
      )}
    </div>
  );
}
