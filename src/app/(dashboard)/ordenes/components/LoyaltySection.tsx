"use client";

import { Gift, Sparkles, Check } from "lucide-react";

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
    <div className="space-y-3 p-4 rounded-2xl border border-amber-500/25 bg-amber-500/5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="size-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Gift className="size-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-foreground leading-tight">
                Puntos de Fidelidad
              </span>
              <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-500/20 text-amber-600 dark:text-amber-400 font-mono">
                {clienteFidelidad.totalPuntos} pts
              </span>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium block mt-0.5">
              Equivalente a <strong className="text-amber-600 dark:text-amber-400">S/ {(clienteFidelidad.totalPuntos * 0.20).toFixed(2)}</strong> de descuento
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
          className={`text-[10px] font-black px-3 py-1.5 rounded-xl border cursor-pointer transition-all active:scale-95 uppercase tracking-wider flex items-center gap-1 ${
            canjearPuntos
              ? "border-amber-500 bg-amber-500 text-slate-950 shadow-xs"
              : "border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          {canjearPuntos ? (
            <>
              <Check className="size-3" />
              <span>Aplicado</span>
            </>
          ) : (
            <>
              <Sparkles className="size-3" />
              <span>Canjear</span>
            </>
          )}
        </button>
      </div>

      {canjearPuntos && (
        <div className="space-y-2.5 pt-3 border-t border-amber-500/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Descuento aplicado:
            </span>
            <span className="text-sm font-black font-mono text-amber-600 dark:text-amber-400">
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
              className="flex-1 accent-amber-500 h-2 rounded-lg bg-muted cursor-pointer"
            />
            <span className="text-xs font-black text-amber-600 dark:text-amber-400 shrink-0 w-12 text-center bg-card border border-amber-500/30 py-1 rounded-lg font-mono">
              {puntosACanjear}p
            </span>
          </div>

          <p className="text-[10px] text-muted-foreground font-medium">
            * 1 punto acumulado equivale a S/ 0.20 de saldo a favor en caja.
          </p>
        </div>
      )}
    </div>
  );
}
