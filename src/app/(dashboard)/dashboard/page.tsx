import {
  Car,
  TrendingUp,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Play,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  // Datos simulados premium para KPIs
  const kpis = [
    {
      title: "Ventas de Hoy",
      value: "S/ 1,245.50",
      change: "+15.2% vs ayer",
      trend: "up",
      icon: TrendingUp,
      glow: "from-teal-500/20 to-emerald-500/20",
      iconColor: "text-teal-400",
    },
    {
      title: "Órdenes Activas",
      value: "14",
      change: "4 en proceso, 10 en espera",
      trend: "neutral",
      icon: Clock,
      glow: "from-blue-500/10 to-indigo-500/10",
      iconColor: "text-blue-400",
    },
    {
      title: "Ticket Promedio",
      value: "S/ 48.90",
      change: "+4.3% este mes",
      trend: "up",
      icon: Car,
      glow: "from-purple-500/10 to-pink-500/10",
      iconColor: "text-purple-400",
    },
    {
      title: "Alertas de Inventario",
      value: "2 ítems",
      change: "Bajo stock mínimo",
      trend: "down",
      icon: AlertTriangle,
      glow: "from-amber-500/10 to-rose-500/10",
      iconColor: "text-amber-400",
    },
  ];

  // Órdenes activas en cola
  const ordenesEnCola = [
    {
      ticket: "T-0482",
      placa: "ABC-123",
      vehiculo: "Toyota Corolla (Negro)",
      servicios: ["Lavado de Salón", "Encerado"],
      empleado: "Carlos Torres",
      estado: "en_proceso",
      total: "S/ 120.00",
      hora: "Hace 15 min",
    },
    {
      ticket: "T-0483",
      placa: "XYZ-987",
      vehiculo: "Hyundai Tucson (Gris)",
      servicios: ["Lavado Premium"],
      empleado: "Sin Asignar",
      estado: "pendiente",
      total: "S/ 50.00",
      hora: "Hace 22 min",
    },
    {
      ticket: "T-0484",
      placa: "F2G-456",
      vehiculo: "Honda Civic (Rojo)",
      servicios: ["Lavado de Motor", "Aspirado"],
      empleado: "Luis Mendoza",
      estado: "en_proceso",
      total: "S/ 85.00",
      hora: "Hace 28 min",
    },
    {
      ticket: "T-0485",
      placa: "M4T-789",
      vehiculo: "Yamaha R3 (Azul)",
      servicios: ["Lavado Moto"],
      empleado: "Sin Asignar",
      estado: "pendiente",
      total: "S/ 25.00",
      hora: "Hace 35 min",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Resumen Operativo
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Revisión del estado del autolavado en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/ordenes/nueva" passHref>
            <Button className="bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold gap-2 cursor-pointer h-10 rounded-lg">
              <Plus className="h-4.5 w-4.5" />
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div
              key={i}
              className={`p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm bg-gradient-to-br ${kpi.glow} relative overflow-hidden group hover:border-zinc-700 transition-all`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 tracking-wider">
                  {kpi.title}
                </span>
                <div className={`p-2 rounded-lg bg-zinc-950/60 ${kpi.iconColor}`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl sm:text-3xl font-extrabold text-white">
                  {kpi.value}
                </span>
                <p className="text-xs text-zinc-400 mt-1 font-semibold flex items-center gap-1">
                  {kpi.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Orders List */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Órdenes en Cola</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Órdenes pendientes de atención hoy</p>
            </div>
            <Link
              href="/ordenes"
              className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5"
            >
              Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                  <th className="pb-3 pl-2">Ticket</th>
                  <th className="pb-3">Placa</th>
                  <th className="pb-3">Vehículo</th>
                  <th className="pb-3">Lavador</th>
                  <th className="pb-3 text-center">Estado</th>
                  <th className="pb-3 text-right pr-2">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50 text-xs">
                {ordenesEnCola.map((ord) => (
                  <tr key={ord.ticket} className="hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 pl-2 font-bold text-white">{ord.ticket}</td>
                    <td className="py-4">
                      <span className="px-2 py-1 bg-zinc-800 rounded text-zinc-300 font-mono font-bold border border-zinc-700/50">
                        {ord.placa}
                      </span>
                    </td>
                    <td className="py-4 font-semibold">
                      <div>{ord.vehiculo}</div>
                      <div className="text-[10px] text-zinc-500 font-normal mt-0.5 truncate max-w-[150px]">
                        {ord.servicios.join(", ")}
                      </div>
                    </td>
                    <td className="py-4 text-zinc-400">{ord.empleado}</td>
                    <td className="py-4">
                      <div className="flex items-center justify-center">
                        {ord.estado === "en_proceso" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            <Play className="h-2.5 w-2.5 fill-blue-400" />
                            Lavando
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="h-2.5 w-2.5" />
                            Espera
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 text-right pr-2 font-bold text-teal-400">{ord.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Branch / Quick Tools panel */}
        <div className="space-y-6">
          {/* Quick Stats / Capacity panel */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Capacidad Sucursal</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-400">
                  <span>Bahías de Lavado</span>
                  <span className="text-white">2 / 3 Ocupadas</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full w-2/3" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1 text-zinc-400">
                  <span>Lavadores Disponibles</span>
                  <span className="text-white">1 / 4 Libres</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                  <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-full rounded-full w-3/4" />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/20 backdrop-blur-sm space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Turno de Caja</h3>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Caja Abierta</h4>
                <p className="text-[10px] text-zinc-500 mt-0.5">Operado por Administrador</p>
              </div>
            </div>
            <div className="border-t border-zinc-800/80 pt-4 flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-semibold">Monto Apertura</span>
              <span className="font-bold text-white">S/ 250.00</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-500 font-semibold">Total Caja Estimado</span>
              <span className="font-bold text-teal-400">S/ 1,495.50</span>
            </div>
            <Link href="/caja" passHref className="block mt-2">
              <Button variant="outline" className="w-full border-zinc-800 hover:bg-zinc-800 text-xs font-bold h-9">
                Gestionar Caja
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
