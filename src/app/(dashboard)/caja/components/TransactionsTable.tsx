"use client";

import { useMemo, useState } from "react";
import {
  Search,
  X,
  Printer,
  User,
  Receipt,
  Banknote,
  Smartphone,
  CreditCard,
  Landmark,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { VehiclePlate } from "@/components/shared/VehiclePlate";
import { formatCurrency, formatDate } from "@/lib/formats";
import { cn } from "@/lib/utils";
import type { TransaccionDetallada } from "./types";

interface TransactionsTableProps {
  transacciones: TransaccionDetallada[];
}

type MethodFilter = "all" | "efectivo" | "yape_plin" | "tarjeta" | "transferencia";

export function TransactionsTable({ transacciones }: TransactionsTableProps) {
  const [methodFilter, setMethodFilter] = useState<MethodFilter>("all");
  const [searchQuery, setSearchQuery] = useQueryState("q", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const itemsPerPage = 6;

  const activePage = currentPage || 1;

  // Conteo para las pestañas de método
  const counts = useMemo(() => {
    let efectivo = 0;
    let yapePlin = 0;
    let tarjeta = 0;
    let transferencia = 0;

    transacciones.forEach((t) => {
      if (t.metodo === "efectivo") efectivo++;
      else if (t.metodo === "yape" || t.metodo === "plin") yapePlin++;
      else if (t.metodo === "tarjeta") tarjeta++;
      else if (t.metodo === "transferencia") transferencia++;
    });

    return {
      all: transacciones.length,
      efectivo,
      yapePlin,
      tarjeta,
      transferencia,
    };
  }, [transacciones]);

  const filteredTransactions = useMemo(() => {
    const query = (searchQuery || "").toLowerCase().trim();

    return transacciones.filter((t) => {
      // Filtro por método
      if (methodFilter === "efectivo" && t.metodo !== "efectivo") return false;
      if (
        methodFilter === "yape_plin" &&
        t.metodo !== "yape" &&
        t.metodo !== "plin"
      )
        return false;
      if (methodFilter === "tarjeta" && t.metodo !== "tarjeta") return false;
      if (methodFilter === "transferencia" && t.metodo !== "transferencia")
        return false;

      // Filtro por búsqueda
      if (!query) return true;
      return (
        (t.nroTicket || "").toLowerCase().includes(query) ||
        (t.placa || "").toLowerCase().includes(query) ||
        (t.clienteNombre || "").toLowerCase().includes(query) ||
        (t.servicios || "").toLowerCase().includes(query) ||
        t.metodo.toLowerCase().includes(query)
      );
    });
  }, [transacciones, searchQuery, methodFilter]);

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredTransactions.slice(start, start + itemsPerPage);
  }, [filteredTransactions, activePage]);

  const handlePrintTicket = (ordenId?: string) => {
    if (!ordenId || typeof window === "undefined") return;
    window.open(
      `/api/pdf/ticket/${ordenId}`,
      "_blank",
      "width=420,height=650,menubar=no,toolbar=no,location=no,status=no"
    );
  };

  const renderMethodBadge = (metodo: string) => {
    switch (metodo) {
      case "efectivo":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
            <Banknote className="size-3" /> Efectivo
          </span>
        );
      case "yape":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-purple-500/10 text-purple-400 border border-purple-500/25">
            <Smartphone className="size-3" /> Yape
          </span>
        );
      case "plin":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
            <Smartphone className="size-3" /> Plin
          </span>
        );
      case "tarjeta":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-sky-500/10 text-sky-400 border border-sky-500/25">
            <CreditCard className="size-3" /> Tarjeta POS
          </span>
        );
      case "transferencia":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-amber-500/10 text-amber-400 border border-amber-500/25">
            <Landmark className="size-3" /> Transfer
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-muted text-muted-foreground border border-border">
            {metodo}
          </span>
        );
    }
  };

  return (
    <Card className="bg-card border border-border/90 shadow-sm overflow-hidden p-0 rounded-2xl">
      {/* Header y Filtros */}
      <div className="p-4 sm:p-5 border-b border-border/70 bg-muted/20 space-y-3.5">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-sm font-black text-foreground flex items-center gap-2">
              <Receipt className="size-4 text-secondary" />
              Cobros Recientes del Turno
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Transacciones auditadas y asentadas en este turno
            </span>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por placa, cliente o ticket..."
              value={searchQuery || ""}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(null);
              }}
              className="pl-8 pr-8 h-9 text-xs w-full bg-card border-border/80 rounded-xl focus:border-secondary"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(null);
                }}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Pestañas de Filtro por Método */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            type="button"
            onClick={() => {
              setMethodFilter("all");
              setCurrentPage(null);
            }}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              methodFilter === "all"
                ? "bg-secondary text-slate-950 shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Layers className="size-3" />
            <span>Todos</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10">
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMethodFilter("efectivo");
              setCurrentPage(null);
            }}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              methodFilter === "efectivo"
                ? "bg-emerald-500 text-slate-950 shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Banknote className="size-3" />
            <span>Efectivo</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10">
              {counts.efectivo}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMethodFilter("yape_plin");
              setCurrentPage(null);
            }}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              methodFilter === "yape_plin"
                ? "bg-purple-500 text-white shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Smartphone className="size-3" />
            <span>Yape / Plin</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10">
              {counts.yapePlin}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMethodFilter("tarjeta");
              setCurrentPage(null);
            }}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              methodFilter === "tarjeta"
                ? "bg-sky-500 text-slate-950 shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <CreditCard className="size-3" />
            <span>Tarjeta POS</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10">
              {counts.tarjeta}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMethodFilter("transferencia");
              setCurrentPage(null);
            }}
            className={cn(
              "px-3 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap",
              methodFilter === "transferencia"
                ? "bg-amber-500 text-slate-950 shadow-sm"
                : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Landmark className="size-3" />
            <span>Transfer</span>
            <span className="text-[10px] font-mono px-1 rounded bg-black/10 dark:bg-white/10">
              {counts.transferencia}
            </span>
          </button>
        </div>
      </div>

      {/* Tabla de Resultados */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/80 hover:bg-transparent text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <TableHead className="w-[100px]">Hora</TableHead>
              <TableHead className="w-[120px]">Ticket</TableHead>
              <TableHead className="w-[140px]">Vehículo / Placa</TableHead>
              <TableHead className="w-[180px]">Cliente</TableHead>
              <TableHead>Servicios Realizados</TableHead>
              <TableHead className="w-[130px]">Método</TableHead>
              <TableHead className="text-right w-[110px]">Monto</TableHead>
              <TableHead className="text-center w-[90px]">Ticket</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="p-10 text-center text-xs text-muted-foreground"
                >
                  No se encontraron cobros registrados con los filtros aplicados.
                </TableCell>
              </TableRow>
            ) : (
              paginatedTransactions.map((t) => (
                <TableRow
                  key={t.id}
                  className="hover:bg-muted/40 transition-colors border-b border-border/50 text-xs"
                >
                  <TableCell
                    className="text-muted-foreground font-mono font-medium whitespace-nowrap text-[11px]"
                    suppressHydrationWarning
                  >
                    {formatDate(t.createdAt, "hh:mm a")}
                  </TableCell>

                  <TableCell className="font-mono font-bold text-foreground">
                    #{t.nroTicket || "S/N"}
                  </TableCell>

                  <TableCell>
                    {t.placa ? (
                      <VehiclePlate plate={t.placa} size="xs" />
                    ) : (
                      <span className="text-muted-foreground font-mono text-[11px]">
                        Sin Placa
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="max-w-[180px]">
                    <span className="font-bold text-foreground truncate block flex items-center gap-1.5">
                      <User className="size-3 text-secondary shrink-0" />
                      <span className="truncate">{t.clienteNombre || "Cliente General"}</span>
                    </span>
                  </TableCell>

                  <TableCell
                    className="max-w-xs truncate font-medium text-muted-foreground"
                    title={t.servicios}
                  >
                    {t.servicios}
                  </TableCell>

                  <TableCell>{renderMethodBadge(t.metodo)}</TableCell>

                  <TableCell className="text-right font-black font-mono text-foreground text-sm">
                    {formatCurrency(t.monto)}
                  </TableCell>

                  <TableCell className="text-center">
                    {t.ordenId ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handlePrintTicket(t.ordenId)}
                        title="Reimprimir ticket de servicio"
                        className="size-8 rounded-lg hover:bg-secondary/15 hover:text-secondary cursor-pointer text-muted-foreground"
                      >
                        <Printer className="size-3.5" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-[10px]">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="p-3 border-t border-border/70 bg-muted/10">
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
