import { formatCurrency } from "@/lib/formats";
import { ArrowUpRight, Play, Clock } from "lucide-react";
import Link from "next/link";

interface OrdenCola {
  ticket: string;
  placa: string;
  vehiculo: string;
  servicios: string[];
  empleado: string;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  total: number;
  hora: string;
}

interface OrdenesColaTableProps {
  ordenes: OrdenCola[];
}

export function OrdenesColaTable({ ordenes }: OrdenesColaTableProps) {
  return (
    <div className="lg:col-span-2 p-6 rounded-lg border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-6 hover:border-secondary transition-colors duration-300">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Órdenes en Cola</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Órdenes activas de lavado hoy</p>
        </div>
        <Link
          href="/ordenes"
          className="text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-0.5"
        >
          Ver todas <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        {ordenes.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground text-xs">
            No hay órdenes activas en cola actualmente.
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                <th className="py-3 pl-3">Ticket</th>
                <th className="py-3">Placa</th>
                <th className="py-3">Vehículo</th>
                <th className="py-3">Lavador</th>
                <th className="py-3 text-center">Estado</th>
                <th className="py-3 text-right pr-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20 text-foreground bg-card">
              {ordenes.map((ord) => (
                <tr key={ord.ticket} className="hover:bg-muted/45 transition-colors">
                  <td className="py-3.5 pl-3 font-bold text-foreground">{ord.ticket}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 bg-muted text-foreground font-mono font-bold rounded border border-border">
                      {ord.placa}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <div className="font-semibold text-foreground">{ord.vehiculo}</div>
                    <div className="text-[10px] text-muted-foreground font-normal mt-0.5 truncate max-w-[150px]">
                      {ord.servicios.join(", ")}
                    </div>
                  </td>
                  <td className="py-3.5 text-foreground/80 font-semibold">{ord.empleado}</td>
                  <td className="py-3.5">
                    <div className="flex items-center justify-center">
                      {ord.estado === "en_proceso" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/25">
                          <Play className="h-2.5 w-2.5 fill-current text-current animate-pulse" />
                          Lavando
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                          <Clock className="h-2.5 w-2.5" />
                          Espera
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 text-right pr-3 font-mono text-foreground">
                    {formatCurrency(ord.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
