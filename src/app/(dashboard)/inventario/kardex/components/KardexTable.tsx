"use client";

import { useState, useMemo } from "react";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Settings2,
  Calendar,
  User,
  Package,
  Layers,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { formatCurrency } from "@/lib/formats";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { useQueryState, parseAsInteger } from "nuqs";
import type { KardexMovimiento } from "../types";

interface KardexTableProps {
  movimientos: KardexMovimiento[];
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function KardexTable({
  movimientos,
  onClearFilters,
  hasActiveFilters,
}: KardexTableProps) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );

  const itemsPerPage = 12;
  const totalPages = Math.ceil(movimientos.length / itemsPerPage);
  const activePage = Math.min(Math.max(1, page || 1), Math.max(1, totalPages));

  const paginatedData = useMemo(() => {
    return movimientos.slice(
      (activePage - 1) * itemsPerPage,
      activePage * itemsPerPage
    );
  }, [movimientos, activePage, itemsPerPage]);

  return (
    <Card className="border border-border bg-card p-0 overflow-hidden rounded-3xl shadow-xs">
      <div className="overflow-x-auto">
        <Table className="min-w-[900px]">
          <TableHeader>
            <TableRow className="bg-muted/40 border-b border-border hover:bg-transparent">
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground w-40">
                Fecha & Hora
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground w-28 text-center">
                Tipo
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground min-w-[200px]">
                Insumo / Producto
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground w-32 text-right">
                Cantidad
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground w-32 text-right">
                Valor Aprox.
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Motivo / Referencia
              </TableHead>
              <TableHead className="py-3.5 pr-4 text-right text-[10px] uppercase font-black tracking-wider text-muted-foreground w-36">
                Responsable
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40 text-xs">
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto text-muted-foreground">
                    <Layers className="size-8 opacity-40 text-secondary" />
                    <p className="text-sm font-bold text-foreground">
                      No se encontraron movimientos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      No hay registros de compras, consumos o ajustes que coincidan con los filtros aplicados.
                    </p>
                    {hasActiveFilters && onClearFilters && (
                      <button
                        type="button"
                        onClick={onClearFilters}
                        className="mt-2 text-xs font-bold text-secondary hover:underline cursor-pointer"
                      >
                        Limpiar todos los filtros
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((mov) => {
                const isEntrada = mov.tipo === "entrada";
                const isSalida = mov.tipo === "salida";
                const isAjuste = mov.tipo === "ajuste";

                const dateObj = mov.createdAt ? new Date(mov.createdAt) : null;
                const formattedDate = dateObj
                  ? dateObj.toLocaleDateString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })
                  : "—";
                const formattedTime = dateObj
                  ? dateObj.toLocaleTimeString("es-PE", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "";

                return (
                  <TableRow
                    key={mov.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    {/* Fecha & Hora */}
                    <TableCell className="py-3 px-4 font-mono">
                      <div className="font-bold text-foreground text-xs">
                        {formattedDate}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {formattedTime}
                      </div>
                    </TableCell>

                    {/* Tipo */}
                    <TableCell className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          isEntrada
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isSalida
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {isEntrada ? (
                          <ArrowUpCircle className="size-3 shrink-0" />
                        ) : isSalida ? (
                          <ArrowDownCircle className="size-3 shrink-0" />
                        ) : (
                          <Settings2 className="size-3 shrink-0" />
                        )}
                        <span>{mov.tipo}</span>
                      </span>
                    </TableCell>

                    {/* Insumo */}
                    <TableCell className="py-3 px-4">
                      <div className="font-extrabold text-foreground text-xs sm:text-sm">
                        {mov.insumoNombre}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {mov.insumoUnidad}
                      </div>
                    </TableCell>

                    {/* Cantidad */}
                    <TableCell className="py-3 px-4 text-right font-mono">
                      <span
                        className={`text-xs sm:text-sm font-black ${
                          isEntrada
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isSalida
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isEntrada ? "+" : isSalida ? "-" : ""}
                        {mov.cantidad.toFixed(2)}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-sans ml-1 font-medium">
                        {mov.insumoUnidad}
                      </span>
                    </TableCell>

                    {/* Valor Aprox */}
                    <TableCell className="py-3 px-4 text-right font-mono font-bold text-foreground">
                      {mov.valorizadoAprox > 0 ? (
                        formatCurrency(mov.valorizadoAprox)
                      ) : (
                        <span className="text-muted-foreground/40 italic">—</span>
                      )}
                    </TableCell>

                    {/* Motivo / Referencia */}
                    <TableCell className="py-3 px-4">
                      <p className="text-xs font-medium text-foreground line-clamp-2">
                        {mov.motivo}
                      </p>
                    </TableCell>

                    {/* Responsable */}
                    <TableCell className="py-3 pr-4 text-right">
                      <div className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                        <User className="size-3 text-secondary shrink-0" />
                        <span className="truncate max-w-[120px]">
                          {mov.usuarioResponsable}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {movimientos.length > 0 && (
        <div className="p-4 border-t border-border bg-card/40">
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={setPage}
            showInfo
            totalItems={movimientos.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </Card>
  );
}
