import { AlertTriangle, CheckCircle2, FileText, Lock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface CierreAlertsProps {
  tieneDescuadre: boolean;
  totalDiferencia: number;
  obsCierre: string;
  isPending: boolean;
  onObsChange: (val: string) => void;
  onFinalize: () => void;
}

export function CierreAlerts({ 
  tieneDescuadre, 
  totalDiferencia, 
  obsCierre, 
  isPending, 
  onObsChange, 
  onFinalize 
}: CierreAlertsProps) {
  return (
    <Card className="p-5 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4">
      <h2 className="text-xs uppercase font-black text-zinc-700 tracking-wider border-b border-border pb-1">
        Estado de Caja y Justificación
      </h2>

      {tieneDescuadre ? (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 space-y-1 text-[11px] leading-normal font-semibold">
          <div className="flex items-center gap-1 text-amber-700 font-bold uppercase tracking-wider text-[9px]">
            <AlertTriangle className="h-3.5 w-3.5" /> Descuadre Detectado
          </div>
          <p>
            Hay una diferencia total de <strong>S/ {totalDiferencia.toFixed(2)}</strong>. 
            Debes ingresar una explicación obligatoria en las observaciones antes de cerrar.
          </p>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 space-y-1 text-[11px] leading-normal font-semibold">
          <div className="flex items-center gap-1 text-emerald-700 font-bold uppercase tracking-wider text-[9px]">
            <CheckCircle2 className="h-3.5 w-3.5" /> Caja Cuadrada
          </div>
          <p>La conciliación reporta un balance perfecto. ¡Excelente control de caja!</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="obs" className="text-xs font-bold text-zinc-750 flex items-center gap-0.5">
          <FileText className="h-3.5 w-3.5 text-zinc-400" /> Observaciones del Cierre
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
          className="w-full bg-card border border-zinc-300 focus:border-secondary focus:ring-0 rounded-lg text-xs p-2.5 text-zinc-800 outline-none resize-none font-medium placeholder:text-muted-foreground/60"
        />
      </div>

      <Button
        onClick={onFinalize}
        disabled={isPending}
        className="w-full h-10 text-xs font-bold gap-2 rounded-lg bg-black hover:bg-zinc-800 text-white cursor-pointer shadow-sm mt-2"
      >
        <Lock className="h-4 w-4" />
        {isPending ? "Confirmando Cierre..." : "Confirmar Cierre y Entregar Caja"}
      </Button>
    </Card>
  );
}
