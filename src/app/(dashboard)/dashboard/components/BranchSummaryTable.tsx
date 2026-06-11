import { formatCurrency } from "@/lib/formats";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

interface BranchSummary {
  id: string;
  nombre: string;
  ventasHoy: number;
  ordenesActivas: number;
  ticketPromedio: number;
}

interface BranchSummaryTableProps {
  sucursales: BranchSummary[];
}

export function BranchSummaryTable({ sucursales }: BranchSummaryTableProps) {
  if (sucursales.length === 0) return null;

  const totalVentas = sucursales.reduce((sum, s) => sum + s.ventasHoy, 0);
  const totalOrdenes = sucursales.reduce((sum, s) => sum + s.ordenesActivas, 0);

  return (
    <div className="p-6 rounded-lg border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] space-y-4 hover:border-secondary transition-colors duration-300">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <div>
          <h2 className="text-base font-bold text-foreground">Resumen por Sucursal</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {sucursales.length} sucursal{sucursales.length !== 1 ? "es" : ""} activa{sucursales.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/configuracion/sucursales"
          className="text-xs font-bold text-secondary hover:text-secondary/80 flex items-center gap-0.5"
        >
          Gestionar <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              <th className="py-3 pl-3">Sucursal</th>
              <th className="py-3 text-right">Ventas Hoy</th>
              <th className="py-3 text-center">Órdenes Activas</th>
              <th className="py-3 text-right pr-3">Ticket Promedio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20 text-foreground bg-card">
            {sucursales.map((s) => (
              <tr key={s.id} className="hover:bg-muted/45 transition-colors">
                <td className="py-3 pl-3 font-bold text-foreground">{s.nombre}</td>
                <td className="py-3 text-right font-mono font-bold text-secondary">
                  {formatCurrency(s.ventasHoy)}
                </td>
                <td className="py-3 text-center">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    s.ordenesActivas > 0
                      ? "bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {s.ordenesActivas}
                  </span>
                </td>
                <td className="py-3 text-right pr-3 font-mono text-foreground">
                  {formatCurrency(s.ticketPromedio)}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border bg-muted/20 font-bold">
              <td className="py-3 pl-3 text-foreground">Total General</td>
              <td className="py-3 text-right font-mono text-secondary">
                {formatCurrency(totalVentas)}
              </td>
              <td className="py-3 text-center">
                <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary">
                  {totalOrdenes}
                </span>
              </td>
              <td className="py-3 text-right pr-3 font-mono text-muted-foreground">
                —
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
