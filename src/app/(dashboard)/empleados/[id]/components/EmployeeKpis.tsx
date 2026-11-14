import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import { 
  WashingMachine, 
  Coins, 
  TrendingUp, 
  Receipt,
  ClipboardList,
  CalendarCheck2
} from "lucide-react";

interface EmployeeKpisProps {
  rol: string;
  kpis: {
    totalServicios: number;
    montoTotal: number;
    comisionAcumulada: number;
    ticketPromedio: number;
    turnosTotales: number;
  };
}

export function EmployeeKpis({ rol, kpis }: EmployeeKpisProps) {
  const isLavador = rol === "lavador";

  if (isLavador) {
    return (
      <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
          {/* 1. Servicios Lavados */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
            <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
              <WashingMachine className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
                Servicios Lavados
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                  {kpis.totalServicios}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  autos
                </span>
              </div>
            </div>
          </div>

          {/* 2. Monto Lavados */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
            <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
              <Coins className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
                Monto Lavados
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                  {formatCurrency(kpis.montoTotal)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  facturado
                </span>
              </div>
            </div>
          </div>

          {/* 3. Comisión Acumulada */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
            <div className="size-9 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <TrendingUp className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block truncate">
                Comisión (30%)
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-secondary leading-none">
                  {formatCurrency(kpis.comisionAcumulada)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  a liquidar
                </span>
              </div>
            </div>
          </div>

          {/* 4. Promedio por Servicio */}
          <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
            <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <Receipt className="size-4.5" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block truncate">
                Ticket Promedio
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-lg sm:text-xl font-black font-mono text-purple-500 leading-none">
                  {formatCurrency(kpis.ticketPromedio)}
                </span>
                <span className="text-[10px] text-muted-foreground font-medium truncate">
                  por auto
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Cajero / Admin / Supervisor
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-0 overflow-hidden shadow-xs">
      <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-border/50">
        {/* 1. Órdenes Registradas */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <ClipboardList className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block truncate">
              Órdenes Registradas
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-emerald-600 dark:text-emerald-400 leading-none">
                {kpis.totalServicios}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                tickets
              </span>
            </div>
          </div>
        </div>

        {/* 2. Monto Total Cobrado */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Coins className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block truncate">
              Monto Cobrado
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-blue-600 dark:text-blue-400 leading-none">
                {formatCurrency(kpis.montoTotal)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                total
              </span>
            </div>
          </div>
        </div>

        {/* 3. Turnos de Caja */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
            <CalendarCheck2 className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block truncate">
              Turnos de Caja
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
                {kpis.turnosTotales}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                arqueados
              </span>
            </div>
          </div>
        </div>

        {/* 4. Ticket Promedio */}
        <div className="p-3 sm:p-3.5 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <div className="size-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
            <Receipt className="size-4.5" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-bold text-purple-500 uppercase tracking-wider block truncate">
              Ticket Promedio
            </span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg sm:text-xl font-black font-mono text-purple-500 leading-none">
                {formatCurrency(kpis.ticketPromedio)}
              </span>
              <span className="text-[10px] text-muted-foreground font-medium truncate">
                por cobro
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
