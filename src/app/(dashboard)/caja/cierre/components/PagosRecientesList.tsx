import { Card } from "@/components/ui/card";
import { formatCurrency, formatTime } from "@/lib/formats";
import type { PagoReciente } from "../types";

interface PagosRecientesListProps {
  pagos: PagoReciente[];
}

export function PagosRecientesList({ pagos }: PagosRecientesListProps) {
  return (
    <Card className="border border-border bg-card shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] overflow-hidden print:shadow-none print:bg-white">
      <div className="p-4 border-b border-border bg-muted/30 flex justify-between items-center">
        <h2 className="text-xs uppercase font-black text-muted-foreground tracking-wider">
          Últimos Cobros Realizados
        </h2>
      </div>
      <div className="divide-y divide-border/40 max-h-[220px] overflow-y-auto">
        {pagos.length === 0 ? (
          <p className="p-4 text-center text-[10px] text-muted-foreground font-semibold">
            Aún no se registran cobros en este turno.
          </p>
        ) : (
          pagos.map((p) => (
            <div
              key={p.id}
              className="p-3 hover:bg-muted/30 transition-colors flex justify-between items-center text-xs"
            >
              <div>
                <p className="font-bold text-foreground">
                  Ticket: {p.nroTicket || "N/A"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 capitalize">
                  {p.metodo} • {formatTime(p.createdAt)}
                </p>
              </div>
              <span className="font-extrabold text-foreground">
                {formatCurrency(p.monto)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
