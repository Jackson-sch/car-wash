"use client";

import { Gift } from "lucide-react";

interface LoyaltySectionProps {
  clienteFidelidad: {
    clienteId: string;
    nombre: string;
    apellido: string | null;
    totalPuntos: number;
  };
  canjearPuntos: boolean;
  setCanjearPuntos: (val: boolean) => void;
  puntosACanjear: string;
  setPuntosACanjear: (val: string) => void;
  totalNum: number;
  descuentoCoupon: number;
}

export function LoyaltySection({
  clienteFidelidad,
  canjearPuntos,
  setCanjearPuntos,
  puntosACanjear,
  setPuntosACanjear,
  totalNum,
  descuentoCoupon,
}: LoyaltySectionProps) {
  const maxPuntos = Math.min(
    clienteFidelidad.totalPuntos,
    Math.floor((totalNum - descuentoCoupon) / 0.20)
  );

  return (
    <div className="space-y-3 p-3.5 rounded-2xl border border-amber-200/50 bg-amber-500/5 dark:bg-amber-950/10 dark:border-amber-900/30 transition-opacity duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Gift className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-foreground block leading-tight">
              Puntos de Fidelidad
            </span>
            <span className="text-[9px] text-muted-foreground font-medium">
              {clienteFidelidad.nombre} tiene {clienteFidelidad.totalPuntos} puntos (S/ {(clienteFidelidad.totalPuntos * 0.20).toFixed(2)})
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            const nextState = !canjearPuntos;
            setCanjearPuntos(nextState);
            if (nextState) {
              setPuntosACanjear(String(maxPuntos));
            } else {
              setPuntosACanjear("0");
            }
          }}
          aria-label={canjearPuntos ? "Quitar canje de puntos" : "Canjear puntos"}
          className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border cursor-pointer transition-colors transition-transform active:scale-95 uppercase tracking-wider ${
            canjearPuntos
              ? "border-amber-500 text-amber-500 bg-amber-500/15"
              : "border-border text-muted-foreground hover:text-foreground"
          }`}
        >
          {canjearPuntos ? "Aplicado" : "Canjear"}
        </button>
      </div>

      {canjearPuntos && (
        <div className="space-y-2 pt-2 border-t border-border/50 transition-opacity duration-200">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
            <span>Puntos a canjear:</span>
            <span className="text-secondary font-extrabold">
              - S/ {((parseInt(puntosACanjear) || 0) * 0.20).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max={maxPuntos}
              value={puntosACanjear}
              onChange={(e) => setPuntosACanjear(e.target.value)}
              aria-label="Puntos a canjear"
              className="flex-1 accent-secondary h-1.5 rounded-lg bg-border cursor-pointer"
            />
            <span className="text-xs font-black text-foreground shrink-0 w-8 text-center bg-card border border-border py-0.5 rounded-md font-mono">
              {puntosACanjear}
            </span>
          </div>
          <p className="text-[9px] text-muted-foreground font-medium">
            * Regla: 1 punto equivale a S/ 0.20 de descuento en caja.
          </p>
        </div>
      )}
    </div>
  );
}
