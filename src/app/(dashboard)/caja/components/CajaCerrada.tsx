"use client";

import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface CajaCerradaProps {
  isPending: boolean;
  onOpenCaja: (monto: string) => Promise<void>;
}

export function CajaCerrada({ isPending, onOpenCaja }: CajaCerradaProps) {
  const [montoApertura, setMontoApertura] = useState("250.00");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoApertura.trim() || parseFloat(montoApertura) < 0) {
      toast.error("Monto inicial no válido");
      return;
    }
    await onOpenCaja(montoApertura);
  };

  return (
    <Card className="p-8 border-border bg-card max-w-md mx-auto text-center space-y-6 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-muted-foreground">
        <Lock className="h-6 w-6" />
      </div>
      <div>
        <h2 className="text-base font-bold text-zinc-900">Caja Cerrada Actualmente</h2>
        <p className="text-xs text-zinc-500 mt-1">
          Es necesario registrar el fondo inicial para abrir la caja y comenzar a registrar cobros.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="apertura" className="text-xs font-bold text-zinc-650">
            Fondo Inicial de Caja (S/) *
          </Label>
          <Input
            id="apertura"
            type="number"
            step="0.10"
            value={montoApertura}
            onChange={(e) => setMontoApertura(e.target.value)}
            className="bg-card border-zinc-300 focus:border-secondary text-center font-bold text-base h-10 rounded-lg text-secondary"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-bold text-xs h-10 rounded-lg gap-2 cursor-pointer shadow-sm"
        >
          <Unlock className="h-4 w-4" />
          {isPending ? "Abriendo..." : "Abrir Turno de Caja"}
        </Button>
      </form>
    </Card>
  );
}
