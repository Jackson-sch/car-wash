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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Servicios Realizados */}
        <Card className="p-6 border border-border bg-card shadow-sm hover:border-emerald-500/30 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Servicios Lavados
            </span>
            <div className="text-2xl font-black text-foreground group-hover:text-emerald-500 transition-colors">
              {kpis.totalServicios}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
            <WashingMachine className="h-5 w-5" />
          </div>
        </Card>

        {/* KPI 2: Ingresos Generados */}
        <Card className="p-6 border border-border bg-card shadow-sm hover:border-blue-500/30 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Monto Lavados
            </span>
            <div className="text-2xl font-black text-foreground group-hover:text-blue-500 transition-colors">
              {formatCurrency(kpis.montoTotal)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
            <Coins className="h-5 w-5" />
          </div>
        </Card>

        {/* KPI 3: Comisión Acumulada */}
        <Card className="p-6 border border-border bg-card shadow-sm hover:border-secondary/30 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Comisión Acumulada (30%)
            </span>
            <div className="text-2xl font-black text-secondary">
              {formatCurrency(kpis.comisionAcumulada)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-secondary/15 text-secondary group-hover:scale-110 transition-transform">
            <TrendingUp className="h-5 w-5" />
          </div>
        </Card>

        {/* KPI 4: Ticket Promedio */}
        <Card className="p-6 border border-border bg-card shadow-sm hover:border-purple-500/30 transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Promedio por Servicio
            </span>
            <div className="text-2xl font-black text-foreground group-hover:text-purple-500 transition-colors">
              {formatCurrency(kpis.ticketPromedio)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
            <Receipt className="h-5 w-5" />
          </div>
        </Card>
      </div>
    );
  }

  // Cajero / Admin / Supervisor
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* KPI 1: Órdenes Registradas */}
      <Card className="p-6 border border-border bg-card shadow-sm hover:border-emerald-500/30 transition-all duration-300 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Órdenes Registradas
          </span>
          <div className="text-2xl font-black text-foreground group-hover:text-emerald-500 transition-colors">
            {kpis.totalServicios}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
          <ClipboardList className="h-5 w-5" />
        </div>
      </Card>

      {/* KPI 2: Monto Total Procesado */}
      <Card className="p-6 border border-border bg-card shadow-sm hover:border-blue-500/30 transition-all duration-300 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Monto Total Cobrado
          </span>
          <div className="text-2xl font-black text-foreground group-hover:text-blue-500 transition-colors">
            {formatCurrency(kpis.montoTotal)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
          <Coins className="h-5 w-5" />
        </div>
      </Card>

      {/* KPI 3: Turnos de Caja Gestionados */}
      <Card className="p-6 border border-border bg-card shadow-sm hover:border-amber-500/30 transition-all duration-300 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Turnos de Caja
          </span>
          <div className="text-2xl font-black text-foreground group-hover:text-amber-500 transition-colors">
            {kpis.turnosTotales}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
          <CalendarCheck2 className="h-5 w-5" />
        </div>
      </Card>

      {/* KPI 4: Ticket Promedio */}
      <Card className="p-6 border border-border bg-card shadow-sm hover:border-purple-500/30 transition-all duration-300 flex items-center justify-between group">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Ticket Promedio
          </span>
          <div className="text-2xl font-black text-foreground group-hover:text-purple-500 transition-colors">
            {formatCurrency(kpis.ticketPromedio)}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform">
          <Receipt className="h-5 w-5" />
        </div>
      </Card>
    </div>
  );
}
