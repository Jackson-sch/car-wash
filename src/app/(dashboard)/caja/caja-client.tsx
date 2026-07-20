"use client";

import { useTransition } from "react";
import { Wallet } from "lucide-react";
import { abrirTurnoCaja } from "@/lib/actions/caja";
import { toast } from "sonner";
import { CajaCerrada } from "./components/CajaCerrada";
import { CajaAbierta } from "./components/CajaAbierta";
import { HistorialTurnos } from "./components/HistorialTurnos";

interface TurnoActivo {
  id: string;
  empleadoId: string;
  apertura: Date;
  montoInicial: string;
  observaciones: string | null;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
  pagos: { metodo: string; total: number }[];
  ventasPorCategoria: { categoria: string; total: number }[];
  ventasPorHora: { hora: string; total: number }[];
  transaccionesDetalladas: {
    id: string;
    monto: number;
    metodo: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" | "otro";
    createdAt: Date;
    nroTicket: string | null;
    servicios: string;
  }[];
}

interface TurnoHistorial {
  id: string;
  apertura: Date;
  cierre: Date | null;
  montoInicial: string;
  montoFinal: string | null;
  observaciones: string | null;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
}

interface CajaClientProps {
  turnoActivo: TurnoActivo | null;
  initialHistorial: TurnoHistorial[];
}

export function CajaClient({ turnoActivo, initialHistorial }: CajaClientProps) {
  // Se usa el prop directamente (nunca se modifica localmente)
  const turno = turnoActivo;
  const historial = initialHistorial;
  const [isPending, startTransition] = useTransition();

  // Acción: Abrir Caja
  const handleAbrirCaja = async (monto: string) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await abrirTurnoCaja(monto);
        if (res.success && res.data) {
          toast.success("Caja abierta con éxito");
          window.location.reload();
        } else {
          toast.error(res.error || "Ocurrió un error");
        }
        resolve();
      });
    });
  };

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Wallet className="size-7 text-secondary" />
          Caja y Turnos
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Apertura de caja diaria, arqueo de billetes y validación de cobros para evitar descuadres.
        </p>
      </div>

      {/* Operaciones de Caja */}
      {!turno ? (
        <CajaCerrada isPending={isPending} onOpenCaja={handleAbrirCaja} />
      ) : (
        <CajaAbierta turno={turno} />
      )}

      {/* Historial de Turnos */}
      <HistorialTurnos historial={historial} />
    </div>
  );
}
