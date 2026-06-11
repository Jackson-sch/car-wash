import { AlertTriangle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formats";

interface TurnoCajaSimple {
  id: string;
  montoInicial: string;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  totalVentasEfectivo: number;
  totalVentasEstimado: number;
}

interface TurnoCajaPanelProps {
  turnoActivo: TurnoCajaSimple | null;
}

export function TurnoCajaPanel({ turnoActivo }: TurnoCajaPanelProps) {
  return (
    <div className="space-y-6">
      <div className="p-6 rounded-lg border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4 hover:border-secondary transition-colors duration-300">
        <h3 className="text-xs font-bold text-foreground uppercase tracking-wider">Turno de Caja</h3>
        {turnoActivo ? (
          <>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Caja Abierta</h4>
                <p className="text-[10px] text-muted-foreground mt-0.5">Operado por {turnoActivo.nombreEmpleado} {turnoActivo.apellidoEmpleado || ""}</p>
              </div>
            </div>
            <div className="border-t border-border/60 pt-4 flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Monto Apertura</span>
              <span className="font-bold text-foreground">
                {formatCurrency(parseFloat(turnoActivo.montoInicial))}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground font-semibold">Total Caja Estimado</span>
              <span className="font-black text-secondary">
                {formatCurrency(parseFloat(turnoActivo.montoInicial) + turnoActivo.totalVentasEfectivo)}
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-4 space-y-3">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
            <h4 className="text-xs font-bold text-foreground">Caja Cerrada</h4>
            <p className="text-[10px] text-muted-foreground">Es necesario abrir el turno de caja para procesar pagos de lavado.</p>
          </div>
        )}
        <Link href="/caja" passHref className="block mt-2">
          <Button variant="outline" className="w-full text-xs font-bold h-9 cursor-pointer border-border hover:bg-muted">
            Gestionar Caja
          </Button>
        </Link>
      </div>
    </div>
  );
}
