"use client";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  FileText,
  Lock,
  ShieldAlert,
  Sparkles,
  UserCheck,
  Calculator,
  RotateCcw,
} from "lucide-react";
import { formatCurrency } from "@/lib/formats";

interface CierreAlertsProps {
  reconciliado: boolean;
  onReconciliar: () => void;
  isReconciling?: boolean;
  tieneDescuadre: boolean;
  totalDiferencia: number;
  obsCierre: string;
  isPending: boolean;
  onObsChange: (val: string) => void;
  onFinalize: () => void;
  supervisorAprobado: { nombre: string; email: string; rol?: string } | null;
  onSolicitarAprobacion: () => void;
  onHabilitarReconteo?: () => void;
}

export function CierreAlerts({
  reconciliado,
  onReconciliar,
  isReconciling = false,
  tieneDescuadre,
  totalDiferencia,
  obsCierre,
  isPending,
  onObsChange,
  onFinalize,
  supervisorAprobado,
  onSolicitarAprobacion,
  onHabilitarReconteo,
}: CierreAlertsProps) {
  return (
    <Card className="p-4 sm:p-5 border-border bg-card shadow-xs space-y-4 print:shadow-none print:bg-white">
      <div className="flex items-center justify-between border-b border-border pb-2.5">
        <div className="flex items-center gap-2">
          <Calculator className="size-4 text-secondary" />
          <h2 className="text-xs uppercase font-black text-muted-foreground tracking-wider">
            Paso 3: Verificación y Cuadre Z
          </h2>
        </div>
        <span
          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            reconciliado
              ? tieneDescuadre
                ? supervisorAprobado
                  ? "bg-amber-500/10 text-amber-500"
                  : "bg-rose-500/10 text-rose-500"
                : "bg-emerald-500/10 text-emerald-500"
              : "bg-muted text-muted-foreground"
          }`}
        >
          {reconciliado
            ? tieneDescuadre
              ? supervisorAprobado
                ? "Auditada c/ Descuadre"
                : "Bloqueada por Seguridad"
              : "Cuadrada"
            : "En Conteo Ciego"}
        </span>
      </div>

      {!reconciliado ? (
        // Estado 1: Arqueo a Ciegas (Falta verificar)
        <div className="space-y-3.5">
          <div className="p-3.5 bg-secondary/5 border border-secondary/20 rounded-xl space-y-1.5">
            <div className="flex items-center gap-1.5 text-secondary font-bold text-xs">
              <Sparkles className="size-3.5" />
              <span>Verificación de Saldos (Antifraude)</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Al presionar el botón, el sistema comparará sus montos declarados frente al balance esperado. Si hay coincidencia exacta, se cerrará de inmediato.
            </p>
          </div>

          <Button
            type="button"
            onClick={onReconciliar}
            disabled={isReconciling}
            className="w-full h-11 text-xs font-bold gap-2 rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm cursor-pointer disabled:opacity-60"
          >
            {isReconciling ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary-foreground/30 border-t-secondary-foreground" />
                Validando arqueo...
              </>
            ) : (
              <>
                <Calculator className="size-4" />
                Verificar y Conciliar Saldos
              </>
            )}
          </Button>
        </div>
      ) : (
        // Estado 2: Reconciliado (Cuadrada o con Discrepancia)
        <div className="space-y-4">
          {tieneDescuadre ? (
            <div className="space-y-3">
              {supervisorAprobado ? (
                // SUPERVISOR DESBLOQUEÓ LA AUDITORÍA
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-emerald-500 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs">
                      <UserCheck className="size-4" />
                      <span>Auditoría Desbloqueada por Supervisor</span>
                    </div>
                    <p className="text-xs text-foreground font-medium">
                      Supervisor: <strong>{supervisorAprobado.nombre}</strong>
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {supervisorAprobado.email} • {supervisorAprobado.rol?.toUpperCase()}
                    </p>
                  </div>

                  <div className="p-3 bg-amber-500/10 border border-amber-500/25 rounded-xl space-y-1">
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider block">
                      Diferencia Auditada
                    </span>
                    <p className="text-sm font-black font-mono text-foreground">
                      {totalDiferencia > 0 ? "+" : ""}
                      {formatCurrency(totalDiferencia)}{" "}
                      <span className="text-xs font-semibold text-muted-foreground">
                        ({totalDiferencia > 0 ? "Sobrante en Caja" : "Faltante en Caja"})
                      </span>
                    </p>
                  </div>

                  {onHabilitarReconteo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onHabilitarReconteo}
                      className="w-full text-xs font-semibold h-9 rounded-lg border-border gap-1.5 cursor-pointer hover:bg-muted"
                    >
                      <RotateCcw className="size-3.5" />
                      Habilitar Reconteo Presencial con Cajero
                    </Button>
                  )}
                </div>
              ) : (
                // BLOQUEADO: NO SE REVELA EL MONTO NI SI FALTA O SOBRA AL CAJERO (ANTIFRAUDE PURO)
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-xl space-y-2.5">
                  <div className="flex items-center gap-1.5 text-rose-500 font-bold text-xs uppercase tracking-wide">
                    <ShieldAlert className="size-4" />
                    <span>Discrepancia Detectada en el Arqueo</span>
                  </div>
                  <p className="text-xs text-foreground font-medium leading-relaxed">
                    Los montos físicos declarados no coinciden con los registros del sistema.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Por política de seguridad y prevención de fraudes, <strong>los saldos del sistema permanecen ocultos</strong>. Se requiere la validación presencial de un supervisor para auditar la diferencia.
                  </p>
                  <Button
                    type="button"
                    onClick={onSolicitarAprobacion}
                    className="w-full text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-lg h-9.5 cursor-pointer shadow-xs gap-1.5"
                  >
                    <Lock className="size-3.5" /> Solicitar Autorización de Supervisor
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Caja Cuadrada
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-500 font-bold text-xs uppercase tracking-wide">
                <CheckCircle2 className="size-4" />
                <span>Caja Cuadrada al 100%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                El efectivo y los canales digitales coinciden perfectamente con las ventas del turno.
              </p>
            </div>
          )}

          {/* Observaciones */}
          <div className="space-y-1.5">
            <Label
              htmlFor="obs"
              className="text-xs font-bold text-foreground flex items-center justify-between"
            >
              <span className="flex items-center gap-1">
                <FileText className="size-3.5 text-muted-foreground" />
                Observaciones del Cierre
                {tieneDescuadre && <span className="text-rose-500 ml-0.5">*</span>}
              </span>
              <span className="text-[10px] text-muted-foreground font-normal">
                {tieneDescuadre ? "Obligatorio por Supervisor" : "Opcional"}
              </span>
            </Label>
            <textarea
              id="obs"
              required={tieneDescuadre}
              rows={3}
              placeholder={
                tieneDescuadre
                  ? "Explique el motivo del descuadre auditado (ej: cliente dejó propina sin ticket / descuadre autorizado por supervisión)..."
                  : "Notas opcionales de entrega de turno a siguiente cajero..."
              }
              value={obsCierre}
              onChange={(e) => onObsChange(e.target.value)}
              className="w-full bg-card border border-border focus:border-secondary focus:ring-1 focus:ring-secondary rounded-xl text-xs p-3 text-foreground outline-none resize-none font-medium placeholder:text-muted-foreground/60 transition-colors"
            />
          </div>

          {/* Botón Finalizar Cierre */}
          <Button
            type="button"
            onClick={onFinalize}
            disabled={isPending || (tieneDescuadre && !supervisorAprobado)}
            className="w-full h-11 text-xs font-bold gap-2 rounded-xl cursor-pointer shadow-sm bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            <Lock className="size-4" />
            {isPending
              ? "Confirmando Cierre Z..."
              : tieneDescuadre
              ? "Confirmar Cierre con Descuadre (Corte Z)"
              : "Finalizar y Cerrar Turno (Corte Z)"}
          </Button>
        </div>
      )}
    </Card>
  );
}
