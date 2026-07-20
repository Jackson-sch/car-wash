"use client";

import Link from "next/link";
import { formatCurrency } from "@/lib/formats";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Card } from "@/components/ui/card";
import { ExternalLink } from "lucide-react";

interface OrdenReciente {
  id: string;
  nroTicket: string | null;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  total: string | null;
  createdAt: Date | null;
  placa: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoTipo: "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro" | null;
  clienteNombre: string;
  clienteApellido: string | null;
}

interface RecentOrdersListProps {
  ordenes: OrdenReciente[];
}

const ESTADOS_BADGES: Record<string, string> = {
  pendiente: "border-amber-200 text-amber-800 bg-amber-50 dark:border-amber-800/40 dark:text-amber-300 dark:bg-amber-950/20",
  en_proceso: "border-sky-200 text-sky-800 bg-sky-50 dark:border-sky-800/40 dark:text-sky-300 dark:bg-sky-950/20",
  completado: "border-emerald-200 text-emerald-800 bg-emerald-50 dark:border-emerald-800/40 dark:text-emerald-300 dark:bg-emerald-950/20",
  cobrado: "border-indigo-200 text-indigo-800 bg-indigo-50 dark:border-indigo-800/40 dark:text-indigo-300 dark:bg-indigo-950/20",
  cancelado: "border-rose-200 text-rose-800 bg-rose-50 dark:border-rose-800/40 dark:text-rose-300 dark:bg-rose-950/20",
};

export function RecentOrdersList({ ordenes }: RecentOrdersListProps) {
  return (
    <Card className="p-6 border border-border bg-card shadow-sm hover:border-zinc-350 transition-colors duration-300 space-y-4">
      <div>
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider">
          Últimas Órdenes Procesadas
        </h2>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Historial de los últimos 10 servicios registrados con participación de este empleado
        </p>
      </div>

      {ordenes.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground font-bold">
          No hay órdenes recientes registradas para este empleado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[11px] text-left border-collapse">
            <thead>
              <tr className="border-b border-border text-muted-foreground uppercase font-bold text-[9px] tracking-wider">
                <th className="py-2.5 px-3">Ticket</th>
                <th className="py-2.5 px-3">Vehículo</th>
                <th className="py-2.5 px-3 hidden sm:table-cell">Cliente</th>
                <th className="py-2.5 px-3">Fecha</th>
                <th className="py-2.5 px-3">Estado</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3 text-center">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {ordenes.map((order) => {
                const formattedDate = order.createdAt
                  ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm", { locale: es })
                  : "N/A";
                const totalVal = parseFloat(order.total || "0");

                return (
                  <tr
                    key={order.id}
                    className="hover:bg-muted/40 transition-colors group"
                  >
                    <td className="py-3 px-3 font-bold text-foreground">
                      {order.nroTicket || "S/N"}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-foreground uppercase block">
                        {order.placa}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {order.vehiculoMarca || ""} {order.vehiculoModelo || ""}
                        {order.vehiculoTipo ? ` (${order.vehiculoTipo})` : ""}
                      </span>
                    </td>
                    <td className="py-3 px-3 hidden sm:table-cell text-muted-foreground font-medium">
                      {order.clienteNombre} {order.clienteApellido || ""}
                    </td>
                    <td className="py-3 px-3 text-muted-foreground font-medium">
                      {formattedDate}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block text-[9px] font-bold rounded px-1.5 py-0.5 border uppercase ${
                          ESTADOS_BADGES[order.estado] || ""
                        }`}
                      >
                        {order.estado === "en_proceso" ? "en proceso" : order.estado}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-foreground">
                      {formatCurrency(totalVal)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Link
                        href={`/ordenes?search=${order.nroTicket || ""}`}
                        className="inline-flex items-center justify-center h-7 w-7 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
                        title="Ver en órdenes"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
