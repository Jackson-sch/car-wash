"use client";

import {
  CreditCard,
  Wallet,
  Coins,
  Smartphone,
  ArrowDownRight,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldAlert,
  UserCheck,
} from "lucide-react";
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
  tieneDescuadre?: boolean;
  supervisorAprobado?: { nombre: string; email: string; rol?: string } | null;
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
  tieneDescuadre = false,
  supervisorAprobado = null,
}: ConciliacionTableProps) {
  // REGLA ANTIFRAUDE:
  // Los montos del sistema y las diferencias solo se revelan si la caja está cuadrada al 100%
  // o si un Supervisor ya introdujo sus credenciales para desbloquear la auditoría.
  const shouldReveal = reconciliado && (!tieneDescuadre || !!supervisorAprobado);

  const renderDifferenceBadge = (diff: number) => {
    if (!reconciliado) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-semibold uppercase bg-muted/50 px-2 py-0.5 rounded-md border border-border/50">
          <Lock className="size-3" /> Pendiente
        </span>
      );
    }

    if (tieneDescuadre && !supervisorAprobado) {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
          <ShieldAlert className="size-3" /> Requiere Supervisor
        </span>
      );
    }

    if (Math.abs(diff) < 0.01) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
          <CheckCircle2 className="size-3" /> S/ 0.00
        </span>
      );
    }

    if (diff > 0) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
          <AlertTriangle className="size-3" /> +{formatCurrency(diff)} (Sobrante)
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20">
        <AlertTriangle className="size-3" /> {formatCurrency(diff)} (Faltante)
      </span>
    );
  };

  return (
    <Card className="border border-border bg-card shadow-xs overflow-hidden print:shadow-none print:bg-white">
      {/* Header */}
      <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-secondary/15 border border-secondary/25 flex items-center justify-center text-secondary">
            <CreditCard className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">
              Paso 2: Conciliación de Métodos de Pago
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Compare el conteo real frente a los registros del sistema.
            </p>
          </div>
        </div>

        <span
          className={`text-[10px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto flex items-center gap-1 ${
            shouldReveal
              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              : reconciliado && tieneDescuadre
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : "bg-secondary/10 text-secondary border-secondary/20"
          }`}
        >
          {shouldReveal ? (
            tieneDescuadre ? (
              <>
                <UserCheck className="size-3" /> Auditoría Desbloqueada por Supervisor
              </>
            ) : (
              <>
                <CheckCircle2 className="size-3" /> Caja Cuadrada
              </>
            )
          ) : reconciliado && tieneDescuadre ? (
            <>
              <ShieldAlert className="size-3" /> Bloqueado por Discrepancia
            </>
          ) : (
            <>
              <Lock className="size-3" /> Arqueo a Ciegas Antifraude
            </>
          )}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="p-3.5 pl-4">Método de Cobro</th>
              <th className="p-3.5 text-right">Esperado (Sistema)</th>
              <th className="p-3.5 text-right w-48">Contado / Reportado</th>
              <th className="p-3.5 text-right pr-4">Diferencia</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {/* EFECTIVO */}
            <tr className="hover:bg-muted/20 transition-colors">
              <td className="p-3.5 pl-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <Wallet className="size-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground block">Efectivo en Gaveta</span>
                    <span className="text-[10px] text-muted-foreground">
                      Fondo inicial + ventas - egresos
                    </span>
                  </div>
                </div>
              </td>
              <td className="p-3.5 text-right font-mono font-medium">
                {shouldReveal ? (
                  <span className="font-bold text-foreground">
                    {formatCurrency(systemStats.expectedEfectivo)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono font-semibold uppercase bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    <Lock className="size-3" /> Ciego
                  </span>
                )}
              </td>
              <td className="p-3.5 text-right">
                <div className="relative flex items-center justify-end">
                  <span className="absolute left-2.5 text-xs text-muted-foreground font-bold">S/</span>
                  <Input
                    type="text"
                    readOnly
                    value={totalEfectivoContado.toFixed(2)}
                    className="w-full pl-8 pr-3 text-right h-9 text-xs bg-muted/40 text-foreground font-mono font-bold border-border cursor-not-allowed"
                    title="Se calcula automáticamente del Arqueo de Billetes y Monedas"
                  />
                </div>
                <span className="text-[9px] text-secondary font-medium block mt-1">
                  Sincronizado con Paso 1
                </span>
              </td>
              <td className="p-3.5 text-right pr-4 font-mono">
                {renderDifferenceBadge(cashDiferencia)}
              </td>
            </tr>

            {/* EGRESOS REGISTRADOS */}
            {systemStats.totalEgresos > 0 && (
              <tr className="bg-rose-500/5 hover:bg-rose-500/10 transition-colors border-l-2 border-rose-500">
                <td className="p-3.5 pl-4">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shrink-0">
                      <ArrowDownRight className="size-3.5" />
                    </div>
                    <div>
                      <span className="font-bold text-rose-500 block">Egresos de Caja Chica (-)</span>
                      <span className="text-[10px] text-muted-foreground">
                        Salidas aprobadas durante el turno
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3.5 text-right font-mono font-bold text-rose-500">
                  -{formatCurrency(systemStats.totalEgresos)}
                </td>
                <td className="p-3.5 text-right text-xs font-semibold text-rose-500 pr-3">
                  Descontado de gaveta
                </td>
                <td className="p-3.5 text-right pr-4 font-mono text-[10px] text-muted-foreground font-semibold">
                  Aplicado
                </td>
              </tr>
            )}

            {/* TARJETA / POS */}
            <tr className="hover:bg-muted/20 transition-colors">
              <td className="p-3.5 pl-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
                    <CreditCard className="size-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      Tarjeta / POS
                      <span className="text-rose-500 font-bold" title="Campo obligatorio">*</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Cierre de lote terminal Niubiz / Izipay
                    </span>
                  </div>
                </div>
              </td>
              <td className="p-3.5 text-right font-mono font-medium">
                {shouldReveal ? (
                  <span className="font-bold text-foreground">
                    {formatCurrency(systemStats.tarjetaVentas)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono font-semibold uppercase bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    <Lock className="size-3" /> Ciego
                  </span>
                )}
              </td>
              <td className="p-3.5 text-right">
                <div className="relative flex items-center justify-end">
                  <span className="absolute left-2.5 text-xs text-muted-foreground font-bold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={actualCount.tarjeta}
                    onChange={(e) => onActualCountChange("tarjeta", e.target.value)}
                    className="w-full pl-8 pr-3 text-right h-9 text-xs font-mono font-bold border-border focus:border-secondary focus:ring-1 focus:ring-secondary text-foreground bg-card rounded-lg"
                  />
                </div>
              </td>
              <td className="p-3.5 text-right pr-4 font-mono">
                {renderDifferenceBadge(tarjetaDiferencia)}
              </td>
            </tr>

            {/* YAPE / PLIN */}
            <tr className="hover:bg-muted/20 transition-colors">
              <td className="p-3.5 pl-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
                    <Smartphone className="size-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      Yape / Plin
                      <span className="text-rose-500 font-bold" title="Campo obligatorio">*</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Total según confirmaciones en celular
                    </span>
                  </div>
                </div>
              </td>
              <td className="p-3.5 text-right font-mono font-medium">
                {shouldReveal ? (
                  <span className="font-bold text-foreground">
                    {formatCurrency(systemStats.yapePlinVentas)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono font-semibold uppercase bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    <Lock className="size-3" /> Ciego
                  </span>
                )}
              </td>
              <td className="p-3.5 text-right">
                <div className="relative flex items-center justify-end">
                  <span className="absolute left-2.5 text-xs text-muted-foreground font-bold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={actualCount.yapePlin}
                    onChange={(e) => onActualCountChange("yapePlin", e.target.value)}
                    className="w-full pl-8 pr-3 text-right h-9 text-xs font-mono font-bold border-border focus:border-secondary focus:ring-1 focus:ring-secondary text-foreground bg-card rounded-lg"
                  />
                </div>
              </td>
              <td className="p-3.5 text-right pr-4 font-mono">
                {renderDifferenceBadge(yapePlinDiferencia)}
              </td>
            </tr>

            {/* TRANSFERENCIA */}
            <tr className="hover:bg-muted/20 transition-colors">
              <td className="p-3.5 pl-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-500 shrink-0">
                    <Coins className="size-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-foreground flex items-center gap-1">
                      Transferencia Bancaria
                      <span className="text-rose-500 font-bold" title="Campo obligatorio">*</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      Depósitos y transferencias confirmadas
                    </span>
                  </div>
                </div>
              </td>
              <td className="p-3.5 text-right font-mono font-medium">
                {shouldReveal ? (
                  <span className="font-bold text-foreground">
                    {formatCurrency(systemStats.transferenciasVentas)}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono font-semibold uppercase bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    <Lock className="size-3" /> Ciego
                  </span>
                )}
              </td>
              <td className="p-3.5 text-right">
                <div className="relative flex items-center justify-end">
                  <span className="absolute left-2.5 text-xs text-muted-foreground font-bold">S/</span>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={actualCount.transferencia}
                    onChange={(e) => onActualCountChange("transferencia", e.target.value)}
                    className="w-full pl-8 pr-3 text-right h-9 text-xs font-mono font-bold border-border focus:border-secondary focus:ring-1 focus:ring-secondary text-foreground bg-card rounded-lg"
                  />
                </div>
              </td>
              <td className="p-3.5 text-right pr-4 font-mono">
                {renderDifferenceBadge(transferDiferencia)}
              </td>
            </tr>
          </tbody>

          {/* TOTALES CONSOLIDADOS */}
          <tfoot className="bg-muted/50 border-t-2 border-border font-bold">
            <tr>
              <td className="p-3.5 pl-4 uppercase text-xs tracking-wider text-muted-foreground">
                Totales Consolidados
              </td>
              <td className="p-3.5 text-right font-mono font-extrabold text-foreground">
                {shouldReveal ? (
                  formatCurrency(expectedTotals)
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-mono font-semibold uppercase">
                    <Lock className="size-3" /> Oculto
                  </span>
                )}
              </td>
              <td className="p-3.5 text-right font-mono font-extrabold text-foreground">
                {formatCurrency(actualTotals)}
              </td>
              <td className="p-3.5 text-right pr-4 font-mono">
                {shouldReveal ? (
                  renderDifferenceBadge(totalDiferencia)
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-semibold uppercase">
                    <Lock className="size-3" /> Pendiente
                  </span>
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {!reconciliado && (
        <div className="p-3 bg-muted/30 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="text-rose-500 font-bold">*</span>
            <span>
              Ingrese el monto contado en cada canal digital (ingrese <strong>0</strong> si no hubo transacciones).
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
