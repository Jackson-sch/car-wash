import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Lock, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { TurnoActivo, SystemStats } from "../types";

interface CierreHeaderProps {
  turno: TurnoActivo;
  systemStats: SystemStats;
  isPending: boolean;
  onFinalize: () => void;
  onPrint: () => void;
}

export function CierreHeader({ turno, systemStats, isPending, onFinalize, onPrint }: CierreHeaderProps) {
  const router = useRouter();

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-4 print:hidden">
        <div className="space-y-1">
          <button 
            onClick={() => router.push("/caja")}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium mb-1 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-3 w-3" /> Volver a Caja
          </button>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-secondary" />
            Cierre de Turno (Corte de Caja)
          </h1>
          <p className="text-xs text-muted-foreground">
            Reconcilie todos los métodos de pago, realice el arqueo de efectivo y finalice el turno activo.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex-1 md:flex-none text-xs font-bold gap-1.5 h-9 rounded-lg"
          >
            <Printer className="h-4 w-4" /> Vista de Impresión
          </Button>
          <Button
            onClick={onFinalize}
            disabled={isPending}
            className="flex-1 md:flex-none text-xs font-bold gap-1.5 h-9 rounded-lg bg-black hover:bg-zinc-800 text-white"
          >
            <Lock className="h-4 w-4" /> 
            {isPending ? "Procesando..." : "Finalizar y Cerrar Caja"}
          </Button>
        </div>
      </div>

      <div className="hidden print:block border-b border-zinc-300 pb-4 mb-4">
        <h1 className="text-2xl font-bold text-center">WASHMASTER PRO - REPORTE DE CIERRE DE CAJA</h1>
        <div className="grid grid-cols-2 gap-2 text-xs mt-4">
          <p><strong>Cajero:</strong> {turno.nombreEmpleado} {turno.apellidoEmpleado}</p>
          <p suppressHydrationWarning><strong>Fecha Apertura:</strong> {new Date(turno.apertura).toLocaleString()}</p>
          <p suppressHydrationWarning><strong>Fecha Cierre:</strong> {new Date().toLocaleString()}</p>
          <p><strong>Monto Inicial de Caja:</strong> S/ {systemStats.openingCash.toFixed(2)}</p>
        </div>
      </div>
    </>
  );
}
