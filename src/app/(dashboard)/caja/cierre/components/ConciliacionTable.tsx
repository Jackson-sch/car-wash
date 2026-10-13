import { CreditCard, Wallet, Coins, EyeOff } from "lucide-react";
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
  reconciliado: boolean;
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
  reconciliado,
}: ConciliacionTableProps) {
  return (
    <Card className="border border-border bg-card shadow-xs overflow-hidden print:shadow-none print:bg-white">
      <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
        <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          <CreditCard className="h-4.5 w-4.5 text-secondary" />
          Conciliación de Métodos de Pago
        </h2>
        <span className="text-[10px] bg-secondary/10 text-secondary font-bold px-2 py-0.5 rounded-full">
          {reconciliado ? "Saldos Esperados vs Reales" : "Arqueo de Saldos a Ciegas"}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="p-3">Método de Pago</th>
              <th className="p-3 text-right">Esperado (Sistema)</th>
              <th className="p-3 text-right">Contado (Físico / Reporte)</th>
              <th className="p-3 text-right">Diferencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {/* EFECTIVO */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                <span className="p-1 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"><Wallet className="h-3.5 w-3.5" /></span>
                Efectivo (Caja)
              </td>
              <td className="p-3 text-right font-medium text-muted-foreground">
                {reconciliado ? (
                  formatCurrency(systemStats.expectedEfectivo)
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase bg-muted px-1.5 py-0.5 rounded"><EyeOff className="h-3 w-3" /> Ciego</span>
                )}
              </td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="text"
                    readOnly
                    value={totalEfectivoContado.toFixed(2)}
                    className="w-full pl-7 pr-2 py-1 text-right h-9 text-xs bg-muted/40 text-muted-foreground font-bold border-border cursor-not-allowed"
                  />
                </div>
              </td>
              <td className="p-3 text-right font-bold">
                {reconciliado ? (
                  <span className={cashDiferencia === 0 ? "text-emerald-600 dark:text-emerald-400" : cashDiferencia < 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
                    {cashDiferencia === 0 ? formatCurrency(0) : `${cashDiferencia > 0 ? "+" : ""}${formatCurrency(cashDiferencia)}`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase"><EyeOff className="h-3 w-3" /> Pendiente</span>
                )}
              </td>
            </tr>

            {/* EGRESOS DE CAJA CHICA */}
            {systemStats.totalEgresos > 0 && (
              <tr className="bg-red-500/5 hover:bg-red-500/10 transition-colors border-l-2 border-red-500">
                <td className="p-3 font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="p-1 rounded bg-red-500/10 text-red-600"><Coins className="h-3.5 w-3.5" /></span>
                  Egresos / Caja Chica (-)
                </td>
                <td className="p-3 text-right font-bold text-red-600 dark:text-red-400">
                  {reconciliado ? (
                    `-${formatCurrency(systemStats.totalEgresos)}`
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] text-red-600 font-bold uppercase bg-red-500/10 px-1.5 py-0.5 rounded">-${formatCurrency(systemStats.totalEgresos)}</span>
                  )}
                </td>
                <td className="p-3 text-right text-xs font-semibold text-red-600 dark:text-red-400">
                  Salidas registradas
                </td>
                <td className="p-3 text-right font-medium text-red-500 text-[11px]">
                  Descontado
                </td>
              </tr>
            )}

            {/* TARJETA */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400"><CreditCard className="h-3.5 w-3.5" /></span>
                Tarjeta / POS <span className="text-rose-500 font-bold ml-0.5" title="Requerido">*</span>
              </td>
              <td className="p-3 text-right font-medium text-muted-foreground">
                {reconciliado ? (
                  formatCurrency(systemStats.tarjetaVentas)
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase bg-muted px-1.5 py-0.5 rounded"><EyeOff className="h-3 w-3" /> Ciego</span>
                )}
              </td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={actualCount.tarjeta}
                    onChange={(e) => onActualCountChange("tarjeta", e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-right h-9 text-xs font-bold border-border focus:border-secondary focus:ring-0 text-foreground bg-card"
                  />
                </div>
              </td>
              <td className="p-3 text-right font-bold">
                {reconciliado ? (
                  <span className={tarjetaDiferencia === 0 ? "text-emerald-600 dark:text-emerald-400" : tarjetaDiferencia < 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
                    {tarjetaDiferencia === 0 ? formatCurrency(0) : `${tarjetaDiferencia > 0 ? "+" : ""}${formatCurrency(tarjetaDiferencia)}`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase"><EyeOff className="h-3 w-3" /> Pendiente</span>
                )}
              </td>
            </tr>

            {/* YAPE/PLIN */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                <span className="p-1 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400"><Wallet className="h-3.5 w-3.5" /></span>
                Yape / Plin <span className="text-rose-500 font-bold ml-0.5" title="Requerido">*</span>
              </td>
              <td className="p-3 text-right font-medium text-muted-foreground">
                {reconciliado ? (
                  formatCurrency(systemStats.yapePlinVentas)
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase bg-muted px-1.5 py-0.5 rounded"><EyeOff className="h-3 w-3" /> Ciego</span>
                )}
              </td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={actualCount.yapePlin}
                    onChange={(e) => onActualCountChange("yapePlin", e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-right h-9 text-xs font-bold border-border focus:border-secondary focus:ring-0 text-foreground bg-card"
                  />
                </div>
              </td>
              <td className="p-3 text-right font-bold">
                {reconciliado ? (
                  <span className={yapePlinDiferencia === 0 ? "text-emerald-600 dark:text-emerald-400" : yapePlinDiferencia < 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
                    {yapePlinDiferencia === 0 ? formatCurrency(0) : `${yapePlinDiferencia > 0 ? "+" : ""}${formatCurrency(yapePlinDiferencia)}`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase"><EyeOff className="h-3 w-3" /> Pendiente</span>
                )}
              </td>
            </tr>

            {/* TRANSFERENCIA */}
            <tr className="hover:bg-muted/30 transition-colors">
              <td className="p-3 font-semibold text-foreground flex items-center gap-2">
                <span className="p-1 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400"><Coins className="h-3.5 w-3.5" /></span>
                Transferencia <span className="text-rose-500 font-bold ml-0.5" title="Requerido">*</span>
              </td>
              <td className="p-3 text-right font-medium text-muted-foreground">
                {reconciliado ? (
                  formatCurrency(systemStats.transferenciasVentas)
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase bg-muted px-1.5 py-0.5 rounded"><EyeOff className="h-3 w-3" /> Ciego</span>
                )}
              </td>
              <td className="p-3 text-right w-44">
                <div className="relative flex items-center">
                  <span className="absolute left-2.5 text-muted-foreground font-semibold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={actualCount.transferencia}
                    onChange={(e) => onActualCountChange("transferencia", e.target.value)}
                    className="w-full pl-7 pr-2 py-1 text-right h-9 text-xs font-bold border-border focus:border-secondary focus:ring-0 text-foreground bg-card"
                  />
                </div>
              </td>
              <td className="p-3 text-right font-bold">
                {reconciliado ? (
                  <span className={transferDiferencia === 0 ? "text-emerald-600 dark:text-emerald-400" : transferDiferencia < 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
                    {transferDiferencia === 0 ? formatCurrency(0) : `${transferDiferencia > 0 ? "+" : ""}${formatCurrency(transferDiferencia)}`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase"><EyeOff className="h-3 w-3" /> Pendiente</span>
                )}
              </td>
            </tr>
          </tbody>
          <tfoot className="bg-muted/40 border-t-2 border-border font-bold">
            <tr>
              <td className="p-3 uppercase text-muted-foreground tracking-wider">Totales Consolidados</td>
              <td className="p-3 text-right text-foreground">
                {reconciliado ? (
                  formatCurrency(expectedTotals)
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase"><EyeOff className="h-3 w-3" /> Oculto</span>
                )}
              </td>
              <td className="p-3 text-right text-foreground pr-5">{formatCurrency(actualTotals)}</td>
              <td className="p-3 text-right text-sm">
                {reconciliado ? (
                  <span className={totalDiferencia === 0 ? "text-emerald-600 dark:text-emerald-400" : totalDiferencia < 0 ? "text-rose-600 dark:text-rose-400" : "text-amber-600 dark:text-amber-400"}>
                    {totalDiferencia === 0 ? `${formatCurrency(0)} (Cuadrado)` : `${totalDiferencia > 0 ? "+" : ""}${formatCurrency(totalDiferencia)}`}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-bold uppercase"><EyeOff className="h-3 w-3" /> Pendiente</span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {!reconciliado && (
        <div className="p-3.5 bg-amber-500/5 border-t border-border/50 text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1.5 leading-snug">
          <span className="text-rose-500 font-black text-sm leading-none shrink-0">*</span>
          <span>
            Debe ingresar obligatoriamente un valor numérico en los campos marcados con asterisco (<span className="text-rose-500 font-black">*</span>), incluso si es <strong>0</strong>.
          </span>
        </div>
      )}
    </Card>
  );
}
