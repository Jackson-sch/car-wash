"use client";

import { useState } from "react";
import { Save, Gift, Coins, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LealtadPanelProps {
  initialPuntosPorSol: string;
  initialSolesPorPunto: string;
  isPending: boolean;
  onSave: (puntosPorSol: string, solesPorPunto: string) => Promise<void>;
}

export function LealtadPanel({
  initialPuntosPorSol,
  initialSolesPorPunto,
  isPending,
  onSave,
}: LealtadPanelProps) {
  const [puntosPorSol, setPuntosPorSol] = useState(initialPuntosPorSol);
  const [solesPorPunto, setSolesPorPunto] = useState(initialSolesPorPunto);

  const handleSave = async () => {
    await onSave(puntosPorSol, solesPorPunto);
  };

  return (
    <Card className="border-border bg-card shadow-sm max-w-2xl">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Reglas de Lealtad</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configura cuántos puntos ganan los clientes y cuánto vale cada punto al canjear.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-5">
        {/* Explicación de reglas de lealtad */}
        <div className="p-4 rounded-xl border border-secondary/20 bg-secondary/5 text-secondary text-xs space-y-2 leading-relaxed">
          <p className="font-bold text-secondary flex items-center gap-1.5">
            🎁 ¿Cómo funcionan las reglas de lealtad y puntos?
          </p>
          <p className="text-muted-foreground">
            Permite premiar la fidelidad de los clientes mediante un monedero virtual de puntos acumulables que luego se pueden canjear como saldo a favor en caja:
          </p>
          <div className="pl-3 border-l-2 border-secondary/40 font-mono text-[10.5px] text-foreground py-0.5">
            1. Puntos Obtenidos = Precio Total Pagado × Ganancia de Puntos<br />
            2. Descuento Disponible = Puntos Acumulados × Valor del Punto (S/)
          </div>
          <p className="text-muted-foreground/80">
            <strong>Ejemplo práctico:</strong> Con una ganancia de <strong>1 punto por Sol</strong> y un valor de canje de <strong>S/ 0.10 por punto</strong>, un servicio de S/ 100.00 otorgará 100 puntos. El cliente podrá canjear esos 100 puntos en su siguiente visita para obtener un descuento inmediato de <strong>S/ 10.00</strong> (100 × 0.10).
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Coins className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Ganancia de Puntos</p>
                <p className="text-[10px] text-muted-foreground">Por cada sol gastado</p>
              </div>
            </div>
            <Label htmlFor="puntosSol" className="text-xs font-medium text-muted-foreground">
              Puntos por S/ 1.00
            </Label>
            <Input
              id="puntosSol"
              type="number"
              step="0.1"
              value={puntosPorSol}
              onChange={(e) => setPuntosPorSol(e.target.value)}
              className="bg-card border-emerald-200 dark:border-emerald-800 text-sm h-10 rounded-lg"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Ej. Si es 1, un servicio de S/ 50 otorga 50 puntos
            </p>
          </div>

          <div className="p-5 rounded-xl border border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20 space-y-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Canje de Puntos</p>
                <p className="text-[10px] text-muted-foreground">Valor de cada punto</p>
              </div>
            </div>
            <Label htmlFor="solesPunto" className="text-xs font-medium text-muted-foreground">
              Valor por punto (S/)
            </Label>
            <Input
              id="solesPunto"
              type="number"
              step="0.01"
              value={solesPorPunto}
              onChange={(e) => setSolesPorPunto(e.target.value)}
              className="bg-card border-amber-200 dark:border-amber-800 text-sm h-10 rounded-lg"
            />
            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Ej. Si es 0.05, 100 puntos = S/ 5.00 de descuento
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-linear-to-r from-secondary/5 to-secondary/10 border border-secondary/20 flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground">Resumen del Programa</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Clientes ganan <strong className="text-foreground">{puntosPorSol || "1"}</strong> punto(s) por sol, cada punto vale{" "}
              <strong className="text-foreground">S/ {solesPorPunto || "0.05"}</strong>
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-border pt-4">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-6"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar Reglas"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
