import { Card } from "@/components/ui/card";
import type { PagoReciente } from "../types";

interface PagosRecientesListProps {
  pagos: PagoReciente[];
}

export function PagosRecientesList({ pagos }: PagosRecientesListProps) {
  return (
    <Card className="border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="p-4 border-b border-border bg-zinc-50/50 flex justify-between items-center">
        <h2 className="text-xs uppercase font-black text-zinc-700 tracking-wider">
          Últimos Cobros Realizados
        </h2>
      </div>
      <div className="divide-y divide-zinc-100 max-h-[220px] overflow-y-auto">
        {pagos.length === 0 ? (
          <p className="p-4 text-center text-[10px] text-muted-foreground font-semibold">
            Aún no se registran cobros en este turno.
          </p>
        ) : (
          pagos.map((p) => (
            <div key={p.id} className="p-3 hover:bg-zinc-50/50 transition-colors flex justify-between items-center text-xs">
              <div>
                <p className="font-bold text-zinc-800">Ticket: {p.nroTicket || "N/A"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 capitalize" suppressHydrationWarning>
                  {p.metodo} • {new Date(p.createdAt).toLocaleTimeString("es-PE", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>
              <span className="font-extrabold text-zinc-900">S/ {p.monto.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
