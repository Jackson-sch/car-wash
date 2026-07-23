"use client";

import { ShieldCheck, Info, Save, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SunatControlPanelProps {
  tipo: "boleta" | "factura" | "ninguno";
  serie: string;
  numero: string;
  isPending: boolean;
  onTipoChange: (tipo: "boleta" | "factura" | "ninguno") => void;
  onSerieChange: (value: string) => void;
  onNumeroChange: (value: string) => void;
  onSave: () => void;
}

export function SunatControlPanel({
  tipo,
  serie,
  numero,
  isPending,
  onTipoChange,
  onSerieChange,
  onNumeroChange,
  onSave,
}: SunatControlPanelProps) {
  return (
    <div className="w-full max-w-md bg-zinc-50 dark:bg-card p-6 rounded-3xl border border-border space-y-5 shadow-xs transition-colors shrink-0">
      <div className="flex items-start gap-3">
        <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-350 border border-zinc-200/50 dark:border-zinc-700/50 shrink-0">
          <ShieldCheck className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">
            Control de Comprobante SUNAT
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-bold uppercase tracking-wider">
            Registro manual (Portal SUNAT SOL)
          </p>
        </div>
      </div>

      <div className="text-xs bg-zinc-100/60 dark:bg-zinc-950/20 border border-zinc-200/40 dark:border-zinc-850/50 rounded-xl p-3 flex gap-2.5">
        <Info className="h-4 w-4 text-zinc-400 shrink-0 mt-0.5" />
        <p className="leading-normal">
          Usa este panel para registrar los datos del comprobante que hayas emitido
          formalmente en el portal SOL de SUNAT. El ticket impreso y el PDF se
          actualizarán mostrando la serie y número de la Boleta o Factura.
        </p>
      </div>

      <div className="space-y-4 pt-1">
        {/* Tipo selector */}
        <div className="space-y-1.5">
          <span className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
            Tipo de Comprobante
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(["ninguno", "boleta", "factura"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onTipoChange(t)}
                className={`py-2 px-3 text-[10px] font-black uppercase tracking-wider rounded-lg border text-center transition-colors cursor-pointer ${
                  tipo === t
                    ? "bg-secondary border-secondary text-secondary-foreground shadow-sm"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "ninguno" ? "Nota Venta" : t}
              </button>
            ))}
          </div>
        </div>

        {/* Serie y Número */}
        {tipo !== "ninguno" && (
          <div className="grid grid-cols-2 gap-4 transition-opacity duration-200">
            <div className="space-y-1.5">
              <label htmlFor="serie-input" className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Serie (4 letras/Núm.)
              </label>
              <Input
                id="serie-input"
                value={serie}
                onChange={(e) => onSerieChange(e.target.value.toUpperCase().slice(0, 4))}
                placeholder={tipo === "boleta" ? "B001" : "F001"}
                maxLength={4}
                className="text-xs h-9 uppercase font-bold"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="numero-input" className="text-[10.5px] font-bold uppercase tracking-wider text-muted-foreground">
                Número (hasta 8 díg.)
              </label>
              <Input
                id="numero-input"
                value={numero}
                onChange={(e) => onNumeroChange(e.target.value.replace(/\D/g, "").slice(0, 8))}
                placeholder="00000045"
                maxLength={8}
                className="text-xs h-9 font-mono"
              />
            </div>
          </div>
        )}

        {/* Botón Guardar */}
        <Button
          onClick={onSave}
          disabled={isPending || (tipo !== "ninguno" && (!serie || !numero))}
          className="w-full font-bold gap-2 text-xs rounded-xl shadow-sm h-10 mt-2 cursor-pointer animate-none"
        >
          {isPending ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {tipo === "ninguno" ? "Quitar Comprobante" : "Guardar Registro"}
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
