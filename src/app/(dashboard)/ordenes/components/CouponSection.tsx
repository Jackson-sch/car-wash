"use client";

import { Tag, AlertCircle, CheckCircle2, X } from "lucide-react";
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
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
        <Tag className="h-3 w-3" />
        Cupón de Descuento
      </span>
      {couponApplied ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                Cupón aplicado
              </span>
              <span className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 block">
                {couponApplied.tipoDescuento === "porcentaje"
                  ? `${couponApplied.valorDescuento}% de descuento`
                  : `S/ ${couponApplied.valorDescuento.toFixed(2)} de descuento`}
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
            className="text-xs text-zinc-400 hover:text-zinc-700 font-bold cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <Input
            placeholder="Ingresa código"
            value={cuponCode}
            onChange={(e) => {
              setCuponCode(e.target.value.toUpperCase());
              setCuponError("");
            }}
            className="h-9 text-xs uppercase font-mono"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onValidate}
            disabled={!cuponCode.trim() || validatingCoupon}
            className="h-9 text-xs cursor-pointer"
          >
            {validatingCoupon ? "..." : "Validar"}
          </Button>
        </div>
      )}
      {cuponError && (
        <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="h-3 w-3" />
          {cuponError}
        </p>
      )}
    </div>
  );
}
