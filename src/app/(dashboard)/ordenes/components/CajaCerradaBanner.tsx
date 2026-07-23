"use client";

import { AlertCircle, Unlock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CajaCerradaBannerProps {
  montoApertura: string;
  setMontoApertura: (val: string) => void;
  isOpeningCaja: boolean;
  onClose: () => void;
}

export function CajaCerradaBanner({
  montoApertura,
  setMontoApertura,
  isOpeningCaja,
  onClose,
}: CajaCerradaBannerProps) {
  return (
    <div className="space-y-4 border border-red-500/20 bg-red-500/5 p-4.5 rounded-2xl text-left transition-opacity duration-200">
      <div className="flex items-start gap-2.5 text-red-700 dark:text-red-400">
        <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500 animate-pulse" />
        <div className="text-[11px] space-y-1">
          <h4 className="font-extrabold leading-none">Apertura de Caja Requerida</h4>
          <p className="font-semibold opacity-90 leading-normal text-zinc-600 dark:text-zinc-400">
            La caja se encuentra cerrada. Registre el fondo inicial para abrir la caja y continuar con el cobro del ticket.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/40">
        <label htmlFor="aperturaCajaModal" className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
          Fondo Inicial de Caja (S/) *
        </label>
        <Input
          id="aperturaCajaModal"
          type="number"
          step="0.10"
          value={montoApertura}
          onChange={(e) => setMontoApertura(e.target.value)}
          className="bg-card border-zinc-300 focus:border-secondary text-center font-bold text-base h-10 rounded-lg text-secondary"
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-xs font-bold text-zinc-500 hover:text-zinc-950 h-9 px-4 rounded-xl cursor-pointer"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isOpeningCaja}
          className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
        >
          <Unlock className="h-4 w-4" />
          {isOpeningCaja ? "Abriendo..." : "Abrir Caja"}
        </Button>
      </div>
    </div>
  );
}
