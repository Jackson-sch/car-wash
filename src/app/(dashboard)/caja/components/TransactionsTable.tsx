"use client";

import { useMemo } from "react";
import { Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { TransaccionDetallada } from "./types";

interface TransactionsTableProps {
  transacciones: TransaccionDetallada[];
}

export function TransactionsTable({ transacciones }: TransactionsTableProps) {
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const itemsPerPage = 5;

  const activePage = currentPage || 1;

  const filteredTransactions = useMemo(() => {
    const query = (searchQuery || "").toLowerCase().trim();
    if (!query) return transacciones;

    return transacciones.filter((t) => {
      return (
        (t.nroTicket || "").toLowerCase().includes(query) ||
        (t.servicios || "").toLowerCase().includes(query) ||
        t.metodo.toLowerCase().includes(query)
      );
    });
  }, [transacciones, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, activePage]);

  return (
    <Card className="bg-card border border-border shadow-sm overflow-hidden p-0">
      <div className="p-4 border-b border-border bg-muted/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
          Cobros Recientes del Turno
        </h3>
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por ticket, servicio o método..."
            value={searchQuery || ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(null);
            }}
            className="pl-8 pr-8 h-8 text-xs w-full bg-card border-border focus:border-secondary"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(null);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <TableHead>Hora</TableHead>
              <TableHead>Ticket</TableHead>
              <TableHead>Servicios Realizados</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Monto</TableHead>
              <TableHead className="text-center">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="p-8 text-center text-xs text-muted-foreground">
                  No se encontraron transacciones registradas.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow key={t.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell
                    className="text-muted-foreground font-semibold whitespace-nowrap"
                    suppressHydrationWarning
                  >
                    {new Date(t.createdAt).toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell className="font-bold text-foreground">
                    {t.nroTicket || "S/N"}
                  </TableCell>
                  <TableCell
                    className="max-w-sm truncate font-medium text-muted-foreground"
                    title={t.servicios}
                  >
                    {t.servicios}
                  </TableCell>
                  <TableCell className="capitalize font-semibold text-muted-foreground">
                    {t.metodo === "yape" || t.metodo === "plin" ? (
                      <span className="text-purple-600 dark:text-purple-400">
                        Billetera ({t.metodo})
                      </span>
                    ) : (
                      t.metodo
                    )}
                  </TableCell>
                  <TableCell className="text-right font-extrabold text-foreground">
                    S/ {t.monto.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      Cobrado
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="p-3 border-t border-border bg-transparent">
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showInfo
            totalItems={filteredTransactions.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </Card>
  );
}
