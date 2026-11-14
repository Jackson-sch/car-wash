"use client";

import { Sparkles, Percent, DollarSign, ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";

export function CuponesGuide() {
  return (
    <Card className="p-4 sm:p-5 border-amber-500/25 bg-amber-500/5 text-xs space-y-3 rounded-2xl animate-in fade-in-0 slide-in-from-top-2">
      <div className="flex items-center gap-2 font-bold text-amber-600 dark:text-amber-400">
        <Sparkles className="size-4" />
        <span>Manual Estratégico de Cupones & Promociones</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-muted-foreground leading-relaxed">
        <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <Percent className="size-3.5 text-secondary" />
            <span>1. Tipo de Descuento</span>
          </div>
          <p className="text-[11px]">
            <strong>Porcentual:</strong> Ideal para campañas masivas de fidelización (ej. 15% o 20%).<br />
            <strong>Monto Fijo:</strong> Excelente para servicios premium de alto margen (ej. S/ 30 de descuento en Cerámico).
          </p>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <DollarSign className="size-3.5 text-emerald-500" />
            <span>2. Compra Mínima Garantizada</span>
          </div>
          <p className="text-[11px]">
            Establece un umbral piso de gasto (ej. S/ 30.00 o S/ 60.00) para asegurar que el ticket promedio cubra los costos operativos e insumos de lavado.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-card border border-border/70 space-y-1">
          <div className="flex items-center gap-1.5 font-bold text-foreground">
            <ShieldAlert className="size-3.5 text-amber-500" />
            <span>3. Cupos y Control de Abuso</span>
          </div>
          <p className="text-[11px]">
            Configura el límite de canjes totales (ej. primeros 100 clientes) y el límite por cliente (ej. 1 uso por cliente) para evitar canjes repetidos no deseados.
          </p>
        </div>
      </div>
    </Card>
  );
}
