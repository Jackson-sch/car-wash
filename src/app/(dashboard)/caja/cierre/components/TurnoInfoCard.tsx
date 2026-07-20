import { User, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { TurnoActivo, SystemStats } from "../types";

interface TurnoInfoCardProps {
  turno: TurnoActivo;
  systemStats: SystemStats;
}

export function TurnoInfoCard({ turno, systemStats }: TurnoInfoCardProps) {
  return (
    <Card className="p-4 border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center print:shadow-none print:bg-white">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-zinc-100 flex items-center justify-center border border-border text-zinc-500">
          <User className="h-5 w-5" />
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cajero en Turno</p>
          <p className="text-sm font-bold text-zinc-900">{turno.nombreEmpleado} {turno.apellidoEmpleado}</p>
        </div>
      </div>
      <div className="flex gap-6 text-xs">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center gap-0.5">
            <Clock className="h-3 w-3" /> Apertura
          </p>
          <p className="font-semibold text-zinc-800 mt-0.5" suppressHydrationWarning>
            {new Date(turno.apertura).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fondo Inicial</p>
          <p className="font-extrabold text-secondary mt-0.5">S/ {systemStats.openingCash.toFixed(2)}</p>
        </div>
      </div>
    </Card>
  );
}
