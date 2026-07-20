import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle2, FileText, Lock, ShieldAlert, Sparkles, UserCheck } from "lucide-react";
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
  supervisorAprobado: { nombre: string; email: string } | null;
  onSolicitarAprobacion: () => void;
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
  onSolicitarAprobacion
}: CierreAlertsProps) {
  return (
    <Card className="p-5 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4 print:shadow-none print:bg-white">
      <h2 className="text-xs uppercase font-black text-zinc-700 tracking-wider border-b border-border pb-1">
        Estado de Caja y Justificación
      </h2>

      {!reconciliado ? (
        // Estado inicial: Arqueo a Ciegas
        <div className="space-y-4">
          <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl text-zinc-700 dark:text-zinc-300 space-y-1 text-[11px] leading-normal font-semibold">
            <div className="flex items-center gap-1 text-blue-600 font-bold uppercase tracking-wider text-[9px]">
              <Sparkles className="size-3.5" /> Arqueo a Ciegas
            </div>
            <p>
              Por favor cuente el efectivo físico en caja e ingrese los totales de Tarjeta, Yape/Plin y Transferencia.
            </p>
          </div>

          <Button
            type="button"
            onClick={onReconciliar}
            disabled={isReconciling}
            className="w-full h-10 text-xs font-bold gap-2 rounded-lg bg-secondary hover:bg-secondary/90 text-white cursor-pointer shadow-xs disabled:opacity-60"
          >
            {isReconciling ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Conciliando...
              </>
            ) : (
              'Verificar y Conciliar Saldos'
            )}
          </Button>
        </div>
      ) : (
        // Estado conciliado
        <div className="space-y-4">
          {tieneDescuadre ? (
            <div className="space-y-3">
              <div className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-red-900 dark:text-red-400 space-y-1.5 text-[11px] leading-normal font-semibold">
                <div className="flex items-center gap-1 text-red-600 font-bold uppercase tracking-wider text-[9px]">
                  <AlertTriangle className="size-3.5" /> Descuadre Detectado
                </div>
                <p>
                  Hay una diferencia total de <span className="font-extrabold">{formatCurrency(totalDiferencia)}</span>.
                </p>
                <p className="text-[10px] text-zinc-500">
                  Debes ingresar una explicación obligatoria en las observaciones justificando el descuadre.
                </p>
              </div>

              {supervisorAprobado ? (
                // Autorizado por supervisor
                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-950 dark:text-emerald-400 space-y-1 text-[11px] leading-normal font-semibold">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold uppercase tracking-wider text-[9px]">
                    <UserCheck className="size-3.5" /> Autorización Concedida
                  </div>
                  <p>
                    Cierre aprobado por: <span className="font-bold">{supervisorAprobado.nombre}</span>
                  </p>
                  <p className="text-[9px] text-emerald-600/70 font-medium">({supervisorAprobado.email})</p>
                </div>
              ) : (
                // Bloqueado hasta aprobación
                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-xl text-amber-900 dark:text-amber-400 space-y-2 text-[11px] leading-normal font-semibold">
                  <div className="flex items-center gap-1 text-amber-600 font-bold uppercase tracking-wider text-[9px]">
                    <ShieldAlert className="size-3.5" /> Cierre Bloqueado
                  </div>
                  <p>
                    Por políticas de seguridad, los cierres descuadrados requieren autorización de un Supervisor.
                  </p>
                  <Button
                    type="button"
                    onClick={onSolicitarAprobacion}
                    size="sm"
                    className="w-full text-[10px] font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-lg h-7 mt-1 cursor-pointer"
                  >
                    Autorizar con Supervisor
                  </Button>
                </div>
              )}
            </div>
          ) : (
            // Caja Cuadrada
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-emerald-950 dark:text-emerald-400 space-y-1 text-[11px] leading-normal font-semibold">
              <div className="flex items-center gap-1 text-emerald-600 font-bold uppercase tracking-wider text-[9px]">
                <CheckCircle2 className="size-3.5" /> Caja Cuadrada
              </div>
              <p>La conciliación reporta un balance perfecto. ¡Excelente control de caja!</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="obs" className="text-xs font-bold text-zinc-750 flex items-center gap-0.5 print:hidden">
              <FileText className="size-3.5 text-zinc-400" /> Observaciones del Cierre
              {tieneDescuadre && <span className="text-rose-600 font-bold ml-0.5">*</span>}
            </Label>
            <textarea
              id="obs"
              required={tieneDescuadre}
              rows={3}
              placeholder={
                tieneDescuadre
                  ? "Explique detalladamente el motivo del descuadre detectado (Ej: Error en vuelto de ticket #1042)..."
                  : "Notas opcionales de entrega de turno (Ej: Se entrega sencillo de S/ 150 en caja)..."
              }
              value={obsCierre}
              onChange={(e) => onObsChange(e.target.value)}
              className="w-full bg-card border border-zinc-350 focus:border-secondary focus:ring-0 rounded-lg text-xs p-2.5 text-zinc-800 outline-none resize-none font-medium placeholder:text-muted-foreground/60 print:hidden"
            />
            {obsCierre && (
              <p className="hidden print:block text-xs text-zinc-800 leading-relaxed whitespace-pre-wrap">
                {obsCierre}
              </p>
            )}
          </div>

          <Button
            onClick={onFinalize}
            disabled={isPending || (tieneDescuadre && !supervisorAprobado)}
            className="w-full h-10 text-xs font-bold gap-2 rounded-lg cursor-pointer shadow-sm mt-2  disabled:opacity-50"
            variant="default"
          >
            <Lock className="size-4" />
            {isPending ? "Confirmando Cierre..." : "Confirmar Cierre y Entregar Caja"}
          </Button>
        </div>
      )}
    </Card>
  );
}
