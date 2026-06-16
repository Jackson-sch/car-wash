import { Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formats";

export const BILLETES = [
  { id: "b200", label: "Billete S/ 200.00", val: 200 },
  { id: "b100", label: "Billete S/ 100.00", val: 100 },
  { id: "b50", label: "Billete S/ 50.00", val: 50 },
  { id: "b20", label: "Billete S/ 20.00", val: 20 },
  { id: "b10", label: "Billete S/ 10.00", val: 10 },
];

export const MONEDAS = [
  { id: "m5", label: "Moneda S/ 5.00", val: 5 },
  { id: "m2", label: "Moneda S/ 2.00", val: 2 },
  { id: "m1", label: "Moneda S/ 1.00", val: 1 },
  { id: "m05", label: "Moneda S/ 0.50", val: 0.5 },
  { id: "m02", label: "Moneda S/ 0.20", val: 0.2 },
  { id: "m01", label: "Moneda S/ 0.10", val: 0.1 },
];

export const DENOMINACIONES = [...BILLETES, ...MONEDAS];

interface ArqueoEfectivoProps {
  cantidades: Record<string, string>;
  onCantidadesChange: (id: string, value: string) => void;
  totalEfectivoContado: number;
}

export function ArqueoEfectivo({ cantidades, onCantidadesChange, totalEfectivoContado }: ArqueoEfectivoProps) {
  return (
    <Card className="border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-border bg-zinc-50/50 flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
          <Coins className="h-4.5 w-4.5 text-secondary" />
          Arqueo Físico de Billetes y Monedas (Soles)
        </h2>
        <span className="text-[10px] text-muted-foreground">Conteo físico detallado</span>
      </div>
      
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Billetes */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-750 border-b border-zinc-150 pb-1 flex items-center gap-1">
            Billetes
          </h3>
          <div className="space-y-2">
            {BILLETES.map((b) => (
              <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50/55 border border-zinc-200 text-xs">
                <span className="font-bold text-zinc-700">{b.label}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cantidades[b.id] || ""}
                    onChange={(e) => onCantidadesChange(b.id, e.target.value)}
                    className="w-16 h-8 text-center text-xs p-1 font-bold border-zinc-300 focus:border-secondary focus:ring-0 text-zinc-900"
                  />
                  <span className="w-16 text-right font-extrabold text-zinc-650">
                    {formatCurrency((parseInt(cantidades[b.id] || "0") || 0) * b.val)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monedas */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-zinc-750 border-b border-zinc-150 pb-1 flex items-center gap-1">
            Monedas
          </h3>
          <div className="space-y-2">
            {MONEDAS.map((m) => (
              <div key={m.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-50/55 border border-zinc-200 text-xs">
                <span className="font-bold text-zinc-700">{m.label}</span>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={cantidades[m.id] || ""}
                    onChange={(e) => onCantidadesChange(m.id, e.target.value)}
                    className="w-16 h-8 text-center text-xs p-1 font-bold border-zinc-300 focus:border-secondary focus:ring-0 text-zinc-900"
                  />
                  <span className="w-16 text-right font-extrabold text-zinc-650">
                    {formatCurrency((parseInt(cantidades[m.id] || "0") || 0) * m.val)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-border bg-zinc-50/30 flex justify-between items-baseline">
        <span className="text-xs font-bold text-zinc-800">Total Desglose de Efectivo</span>
        <span className="text-base font-black text-secondary">{formatCurrency(totalEfectivoContado)}</span>
      </div>
    </Card>
  );
}
