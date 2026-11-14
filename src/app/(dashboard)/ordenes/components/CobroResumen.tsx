"use client";

import { VehiclePlate } from "@/components/shared/VehiclePlate";
import { Car, Tag, Gift } from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import type { OrdenResumen } from "./CobrarModal";

interface CobroResumenProps {
  orden: OrdenResumen;
  totalNum: number;
  descuentoCoupon?: number;
  descuentoPuntos?: number;
}

export function CobroResumen({
  orden,
  totalNum,
  descuentoCoupon = 0,
  descuentoPuntos = 0,
}: CobroResumenProps) {
  const tieneDescuento = descuentoCoupon > 0 || descuentoPuntos > 0;
  const totalFinal = Math.max(0, totalNum - descuentoCoupon - descuentoPuntos);

  const initials = [orden.clienteNombre?.[0], orden.clienteApellido?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase() || "C";

  return (
    <div className="p-4 sm:p-5 bg-card border border-border/90 rounded-2xl space-y-4 shadow-xs">
      {/* Header con Placa y Nivel de Servicio */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="size-10 rounded-xl bg-secondary/15 text-secondary border border-secondary/25 flex items-center justify-center font-black text-xs shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
              Cliente y Vehículo
            </span>
            <p className="font-extrabold text-sm text-foreground truncate leading-tight">
              {orden.clienteNombre
                ? `${orden.clienteNombre} ${orden.clienteApellido || ""}`.trim()
                : "Cliente General"}
            </p>
            <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 mt-0.5 truncate">
              <Car className="size-3.5 text-secondary shrink-0" />
              <span>
                {[orden.vehiculoMarca, orden.vehiculoModelo].filter(Boolean).join(" ") || "Vehículo sin modelo"}
              </span>
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <VehiclePlate plate={orden.placa} size="md" />
        </div>
      </div>

      {/* Desglose Financiero */}
      <div className="pt-3 border-t border-border/70 space-y-2">
        {tieneDescuento && (
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-muted-foreground">Total Original</span>
            <span className="font-mono text-muted-foreground line-through">
              {formatCurrency(totalNum)}
            </span>
          </div>
        )}

        {descuentoCoupon > 0 && (
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Tag className="size-3.5" />
              Descuento Cupón
            </span>
            <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
              -{formatCurrency(descuentoCoupon)}
            </span>
          </div>
        )}

        {descuentoPuntos > 0 && (
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Gift className="size-3.5" />
              Descuento Puntos
            </span>
            <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
              -{formatCurrency(descuentoPuntos)}
            </span>
          </div>
        )}

        {/* Tarjeta Destacada de Total a Pagar */}
        <div className="p-3.5 rounded-xl bg-secondary/10 border border-secondary/25 flex items-center justify-between mt-1">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
              Total a Pagar
            </span>
            <span className="text-xs font-semibold text-foreground/80">
              Monto neto de liquidación
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-black font-mono text-secondary tracking-tight block">
              {formatCurrency(totalFinal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
