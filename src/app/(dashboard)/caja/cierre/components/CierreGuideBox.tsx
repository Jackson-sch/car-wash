"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, EyeOff, ShieldAlert, Sparkles, Wallet } from "lucide-react";

export function CierreGuideBox() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-xl border border-secondary/20 bg-secondary/5 text-xs overflow-hidden transition-all print:hidden">
      <div className="p-3 sm:p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="h-7 w-7 rounded-lg bg-secondary/15 flex items-center justify-center shrink-0 text-secondary">
            <EyeOff className="size-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-xs">Arqueo a Ciegas Activo</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-secondary/20 text-secondary">
                Control Antifraude
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground line-clamp-1 sm:line-clamp-none">
              Los saldos del sistema están ocultos para asegurar un conteo imparcial de gaveta y pasarelas digitales.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="text-[11px] font-semibold text-secondary hover:text-secondary/80 flex items-center gap-1 shrink-0 self-end sm:self-auto cursor-pointer transition-colors"
        >
          {isOpen ? (
            <>
              Ocultar instrucciones <ChevronUp className="size-3.5" />
            </>
          ) : (
            <>
              Ver instrucciones y reglas <ChevronDown className="size-3.5" />
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <div className="px-3.5 pb-3.5 pt-1 border-t border-secondary/15 grid grid-cols-1 md:grid-cols-3 gap-2.5 text-[11px] animate-in fade-in-50 duration-200">
          <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Wallet className="size-3.5 text-emerald-500" />
              <span>1. Conteo de Gaveta</span>
            </div>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Desglose y cuente cada billete y moneda en Soles. El subtotal de efectivo se calculará automáticamente.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Sparkles className="size-3.5 text-indigo-500" />
              <span>2. Cierre Digital (POS / Apps)</span>
            </div>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Consolide el voucher de cierre de lote de terminales POS y el saldo de confirmaciones Yape, Plin o transferencias.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-background/60 border border-border/50 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <ShieldAlert className="size-3.5 text-amber-500" />
              <span>3. Control de Descuadres</span>
            </div>
            <p className="text-muted-foreground text-[10px] leading-relaxed">
              Cualquier diferencia detectada (faltante o sobrante) bloqueará el cierre y exigirá la clave de un supervisor.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
