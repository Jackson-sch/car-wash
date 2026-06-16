import { CreditCard, Wallet, Coins } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { SystemStats } from "../types";
import { formatCurrency } from "@/lib/formats";

interface ConciliacionTableProps {
  systemStats: SystemStats;
  actualCount: Record<string, string>;
  totalEfectivoContado: number;
  onActualCountChange: (id: string, value: string) => void;
  cashDiferencia: number;
  tarjetaDiferencia: number;
  yapePlinDiferencia: number;
  transferDiferencia: number;
  expectedTotals: number;
  actualTotals: number;
  totalDiferencia: number;
}

export function ConciliacionTable({
  systemStats,
  actualCount,
  totalEfectivoContado,
  onActualCountChange,
  cashDiferencia,
  tarjetaDiferencia,
  yapePlinDiferencia,
  transferDiferencia,
  expectedTotals,
  actualTotals,
  totalDiferencia,
}: ConciliacionTableProps) {
  return (
    <Card className="border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-border bg-zinc-50/50 flex justify-between items-center">
        <h2 className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
          <CreditCard className="h-4.5 w-4.5 text-secondary" />
          Conciliación de Métodos de Pago
        </h2>
        <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full">
          Saldos Esperados vs Reales
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-zinc-50 text-muted-foreground font-semibold">
              <th className="p-3">Método de Pago</th>
              <th className="p-3 text-right">Esperado (Sistema)</th>
              <th className="p-3 text-right">Contado (Físico / Reporte)</th>
              <th className="p-3 text-right">Diferencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {/* EFECTIVO */}
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="p-3 font-semibold text-zinc-900 flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-50 text-emerald-600"><Wallet className="h-3.5 w-3.5" /></span>
                Efectivo (Caja)
              </td>
              <td className="p-3 text-right font-medium text-zinc-650">{formatCurrency(systemStats.expectedEfectivo)}</td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="text"
                    readOnly
                    value={totalEfectivoContado.toFixed(2)}
                    className="w-full pl-7 pr-2 py-1 text-right h-8 text-xs bg-zinc-50 text-zinc-600 font-bold border-zinc-200 cursor-not-allowed"
                  />
                </div>
              </td>
              <td className={`p-3 text-right font-bold ${cashDiferencia === 0 ? "text-emerald-600" : cashDiferencia < 0 ? "text-rose-600" : "text-amber-600"}`}>
                {cashDiferencia === 0 ? formatCurrency(0) : `${cashDiferencia > 0 ? "+" : ""}${formatCurrency(cashDiferencia)}`}
              </td>
            </tr>

            {/* TARJETA */}
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="p-3 font-semibold text-zinc-900 flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-50 text-indigo-600"><CreditCard className="h-3.5 w-3.5" /></span>
                Tarjeta / POS
              </td>
              <td className="p-3 text-right font-medium text-zinc-650">{formatCurrency(systemStats.tarjetaVentas)}</td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={actualCount.tarjeta}
                    onChange={(e) => onActualCountChange("tarjeta", e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-right h-8 text-xs font-bold border-zinc-300 focus:border-secondary focus:ring-0 text-zinc-800"
                  />
                </div>
              </td>
              <td className={`p-3 text-right font-bold ${tarjetaDiferencia === 0 ? "text-emerald-600" : tarjetaDiferencia < 0 ? "text-rose-600" : "text-amber-600"}`}>
                {tarjetaDiferencia === 0 ? formatCurrency(0) : `${tarjetaDiferencia > 0 ? "+" : ""}${formatCurrency(tarjetaDiferencia)}`}
              </td>
            </tr>

            {/* YAPE/PLIN */}
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="p-3 font-semibold text-zinc-900 flex items-center gap-2">
                <span className="p-1 rounded bg-purple-50 text-purple-600"><Wallet className="h-3.5 w-3.5" /></span>
                Yape / Plin
              </td>
              <td className="p-3 text-right font-medium text-zinc-650">{formatCurrency(systemStats.yapePlinVentas)}</td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={actualCount.yapePlin}
                    onChange={(e) => onActualCountChange("yapePlin", e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-right h-8 text-xs font-bold border-zinc-300 focus:border-secondary focus:ring-0 text-zinc-800"
                  />
                </div>
              </td>
              <td className={`p-3 text-right font-bold ${yapePlinDiferencia === 0 ? "text-emerald-600" : yapePlinDiferencia < 0 ? "text-rose-600" : "text-amber-600"}`}>
                {yapePlinDiferencia === 0 ? formatCurrency(0) : `${yapePlinDiferencia > 0 ? "+" : ""}${formatCurrency(yapePlinDiferencia)}`}
              </td>
            </tr>

            {/* TRANSFERENCIA */}
            <tr className="hover:bg-zinc-50/50 transition-colors">
              <td className="p-3 font-semibold text-zinc-900 flex items-center gap-2">
                <span className="p-1 rounded bg-blue-50 text-blue-600"><Coins className="h-3.5 w-3.5" /></span>
                Transferencia
              </td>
              <td className="p-3 text-right font-medium text-zinc-650">{formatCurrency(systemStats.transferenciasVentas)}</td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={actualCount.transferencia}
                    onChange={(e) => onActualCountChange("transferencia", e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-right h-8 text-xs font-bold border-zinc-300 focus:border-secondary focus:ring-0 text-zinc-800"
                  />
                </div>
              </td>
              <td className={`p-3 text-right font-bold ${transferDiferencia === 0 ? "text-emerald-600" : transferDiferencia < 0 ? "text-rose-600" : "text-amber-600"}`}>
                {transferDiferencia === 0 ? formatCurrency(0) : `${transferDiferencia > 0 ? "+" : ""}${formatCurrency(transferDiferencia)}`}
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-zinc-50 border-t-2 border-border font-bold">
            <tr>
              <td className="p-3 uppercase text-zinc-700 tracking-wider">Totales Consolidados</td>
              <td className="p-3 text-right text-zinc-800">{formatCurrency(expectedTotals)}</td>
              <td className="p-3 text-right text-zinc-900 pr-5">{formatCurrency(actualTotals)}</td>
              <td className={`p-3 text-right text-sm ${totalDiferencia === 0 ? "text-emerald-600" : totalDiferencia < 0 ? "text-rose-600" : "text-amber-600"}`}>
                {totalDiferencia === 0 ? `${formatCurrency(0)} (Cuadrado)` : `${totalDiferencia > 0 ? "+" : ""}${formatCurrency(totalDiferencia)}`}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Card>
  );
}
