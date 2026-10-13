import { User, Car, Tag, Gift } from "lucide-react";
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

  return (
    <div className="p-4 bg-muted/30 border border-border/70 rounded-2xl space-y-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-[9px] font-black uppercase text-muted-foreground/80 tracking-wider">
            Cliente y Vehículo
          </p>
          <div className="flex flex-col gap-1 mt-1.5 text-xs text-foreground/80">
            {orden.clienteNombre ? (
              <span className="flex items-center gap-1.5 font-bold text-foreground">
                <User className="size-3.5 text-muted-foreground" />
                {orden.clienteNombre} {orden.clienteApellido || ""}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-muted-foreground italic">
                <User className="size-3.5" />
                Cliente genérico
              </span>
            )}
            {orden.vehiculoMarca && (
              <span className="flex items-center gap-1.5 capitalize font-medium text-muted-foreground">
                <Car className="size-3.5 text-muted-foreground" />
                {orden.vehiculoMarca} {orden.vehiculoModelo || ""}
              </span>
            )}
          </div>
        </div>

        <div className="inline-flex flex-col items-center bg-zinc-900 border border-zinc-700/80 rounded-md px-2.5 py-1 shadow-xs">
          <span className="text-[7px] uppercase font-bold text-zinc-400 tracking-widest leading-none">
            PERÚ
          </span>
          <span className="text-xs font-mono font-black text-zinc-100 tracking-wider leading-none mt-0.5">
            {orden.placa.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Monto Total */}
      <div className="pt-3 border-t border-border/60 space-y-1.5">
        {tieneDescuento && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-muted-foreground">Total original</span>
            <span className="text-xs text-muted-foreground line-through">
              {formatCurrency(totalNum)}
            </span>
          </div>
        )}
        {descuentoCoupon > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Descuento cupón
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
              -{formatCurrency(descuentoCoupon)}
            </span>
          </div>
        )}
        {descuentoPuntos > 0 && (
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Gift className="h-3 w-3" />
              Descuento puntos
            </span>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              -{formatCurrency(descuentoPuntos)}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-muted-foreground">
            Total a Pagar
          </span>
          <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
            {formatCurrency(totalFinal)}
          </span>
        </div>
      </div>
    </div>
  );
}
