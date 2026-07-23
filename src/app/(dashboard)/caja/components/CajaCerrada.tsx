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
    <Card className="p-8 border-border bg-card max-w-md mx-auto text-center space-y-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-secondary/5 rounded-full blur-2xl pointer-events-none" />

      <div className="mx-auto h-14 w-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400">
        <Lock className="h-6 w-6 animate-pulse" />
      </div>
      <div>
        <h2 className="text-base font-extrabold text-foreground">Caja Cerrada Actualmente</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Es necesario registrar el fondo inicial para abrir la caja y comenzar a registrar cobros.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 text-left">
        <div className="space-y-2">
          <Label htmlFor="apertura" className="text-xs font-bold text-muted-foreground">
            Fondo Inicial de Caja (S/) *
          </Label>
          <Input
            id="apertura"
            type="number"
            step="0.10"
            value={montoApertura}
            onChange={(e) => setMontoApertura(e.target.value)}
            className="bg-card border-border focus:border-secondary focus-visible:ring-1 focus-visible:ring-secondary text-center font-bold text-base h-10 rounded-lg text-secondary"
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full font-bold text-xs h-10 rounded-lg gap-2 cursor-pointer shadow-sm bg-primary hover:bg-primary/95 text-primary-foreground transition-colors transition-transform duration-200 hover:scale-[1.01]"
        >
          <Unlock className="h-4 w-4" />
          {isPending ? "Abriendo..." : "Abrir Turno de Caja"}
        </Button>
      </form>
    </Card>
  );
}
