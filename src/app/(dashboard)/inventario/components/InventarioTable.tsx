"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ArrowUpDown,
  Plus,
  Minus,
  SlidersHorizontal,
  Package,
  CheckCircle2,
  AlertTriangle,
  TrendingDown,
  History,
  Pencil,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatCurrency } from "@/lib/formats";

export interface Insumo {
  id: string;
  nombre: string;
  descripcion: string | null;
  unidad: string | null;
  stock: string | null;
  stockMinimo: string | null;
  precioCompra: string | null;
  proveedor: string | null;
  activo: boolean | null;
}

interface InventarioTableProps {
  insumos: Insumo[];
  onAdjustStock: (insumo: Insumo) => void;
  onViewKardex?: (insumo: Insumo) => void;
  onEditInsumo: (insumo: Insumo) => void;
  onQuickAdjust?: (insumo: Insumo, tipo: "entrada" | "salida", delta: number) => void;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
}

export function InventarioTable({
  insumos,
  onAdjustStock,
  onViewKardex,
  onEditInsumo,
  onQuickAdjust,
  onClearFilters,
  hasActiveFilters,
}: InventarioTableProps) {
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const [sortField, setSortField] = useState<"nombre" | "stock" | "precio" | "total">("nombre");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Ordenamiento
  const sorted = useMemo(() => {
    return [...insumos].sort((a, b) => {
      let valA: string | number = "";
      let valB: string | number = "";

      if (sortField === "nombre") {
        valA = a.nombre.toLowerCase();
        valB = b.nombre.toLowerCase();
      } else if (sortField === "stock") {
        valA = parseFloat(a.stock || "0");
        valB = parseFloat(b.stock || "0");
      } else if (sortField === "precio") {
        valA = parseFloat(a.precioCompra || "0");
        valB = parseFloat(b.precioCompra || "0");
      } else if (sortField === "total") {
        valA = (parseFloat(a.stock || "0") * parseFloat(a.precioCompra || "0"));
        valB = (parseFloat(b.stock || "0") * parseFloat(b.precioCompra || "0"));
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [insumos, sortField, sortOrder]);

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = sorted.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const toggleSort = useCallback(
    (field: "nombre" | "stock" | "precio" | "total") => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    },
    [sortField]
  );

  const renderSortIcon = (field: "nombre" | "stock" | "precio" | "total") => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1 text-muted-foreground/40" />;
    }
    return (
      <ChevronDown
        className={`h-3 w-3 ml-1 text-secondary transition-transform duration-200 ${
          sortOrder === "desc" ? "rotate-180" : ""
        }`}
      />
    );
  };

  if (insumos.length === 0) {
    return (
      <Card className="p-12 border-dashed border-2 border-border/80 bg-card/50 text-center flex flex-col items-center justify-center space-y-3 rounded-3xl shadow-xs">
        <div className="size-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
          <Package className="h-7 w-7" />
        </div>
        <h4 className="text-sm font-bold text-foreground">No se encontraron insumos</h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          {hasActiveFilters
            ? "No hay productos que coincidan con la búsqueda o filtros aplicados."
            : "No hay insumos registrados en el catálogo. Registra tu primer producto con el botón 'Agregar Insumo'."}
        </p>
        {hasActiveFilters && onClearFilters && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="mt-2 text-xs font-bold rounded-xl cursor-pointer"
          >
            Limpiar todos los filtros
          </Button>
        )}
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card p-0 overflow-hidden rounded-3xl shadow-xs">
      <div className="overflow-x-auto">
        <Table className="min-w-[860px]">
          <TableHeader>
            <TableRow className="bg-muted/40 border-b border-border hover:bg-transparent">
              <TableHead className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort("nombre")}
                  className="flex items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Insumo & Detalle
                  {renderSortIcon("nombre")}
                </button>
              </TableHead>
              <TableHead className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort("stock")}
                  className="flex items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Nivel de Stock
                  {renderSortIcon("stock")}
                </button>
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Mínimo
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Salud de Stock
              </TableHead>
              <TableHead className="py-3.5 px-4 text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Proveedor
              </TableHead>
              <TableHead className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort("precio")}
                  className="flex items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Costo Unitario
                  {renderSortIcon("precio")}
                </button>
              </TableHead>
              <TableHead className="py-3.5 px-4">
                <button
                  type="button"
                  onClick={() => toggleSort("total")}
                  className="flex items-center text-[10px] uppercase font-black tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  Valor Total
                  {renderSortIcon("total")}
                </button>
              </TableHead>
              <TableHead className="py-3.5 pr-4 text-right text-[10px] uppercase font-black tracking-wider text-muted-foreground">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40 text-xs">
            {paginatedData.map((item) => {
              const stVal = parseFloat(item.stock || "0");
              const minVal = parseFloat(item.stockMinimo || "0");
              const costoUnitario = parseFloat(item.precioCompra || "0");
              const valorTotal = stVal * costoUnitario;

              const status =
                stVal === 0 ? "agotado" : stVal <= minVal ? "bajo" : "suficiente";

              // Cálculo de porcentaje para el medidor visual
              const targetCap = minVal > 0 ? minVal * 2.5 : 10;
              const healthPercent = Math.min(100, Math.round((stVal / targetCap) * 100));

              return (
                <TableRow
                  key={item.id}
                  className="hover:bg-muted/30 transition-colors group"
                >
                  {/* Nombre y especificación */}
                  <TableCell className="py-3.5 px-4">
                    <div className="font-extrabold text-foreground text-xs sm:text-sm">
                      {item.nombre}
                    </div>
                    {item.descripcion && (
                      <div className="text-[11px] text-muted-foreground font-medium mt-0.5 line-clamp-1">
                        {item.descripcion}
                      </div>
                    )}
                  </TableCell>

                  {/* Stock actual con Barra de Salud y Steppers */}
                  <TableCell className="py-3.5 px-4 min-w-[170px]">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-black text-xs sm:text-sm text-foreground">
                          {stVal.toFixed(2)}{" "}
                          <span className="text-[10px] font-bold text-muted-foreground font-sans">
                            {item.unidad}
                          </span>
                        </span>

                        {/* Micro-ajustes rápidos directos */}
                        {onQuickAdjust && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => onQuickAdjust(item, "salida", 1)}
                              disabled={stVal <= 0}
                              className="size-6 rounded-md flex items-center justify-center bg-muted hover:bg-rose-500/15 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                              title="Despachar 1 unidad (-1)"
                            >
                              <Minus className="size-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => onQuickAdjust(item, "entrada", 1)}
                              className="size-6 rounded-md flex items-center justify-center bg-muted hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-600 transition-colors cursor-pointer"
                              title="Ingresar 1 unidad (+1)"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Medidor visual de salud de stock */}
                      <div className="w-full bg-muted/70 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            status === "agotado"
                              ? "w-0 bg-transparent"
                              : status === "bajo"
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.max(6, healthPercent)}%` }}
                        />
                      </div>
                    </div>
                  </TableCell>

                  {/* Mínimo */}
                  <TableCell className="py-3.5 px-4 font-mono text-muted-foreground font-bold">
                    {minVal.toFixed(2)} {item.unidad}
                  </TableCell>

                  {/* Estado / Salud */}
                  <TableCell className="py-3.5 px-4">
                    {status === "suficiente" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        Óptimo
                      </span>
                    ) : status === "bajo" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <AlertTriangle className="size-3" />
                        Bajo Mínimo
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <TrendingDown className="size-3" />
                        Agotado
                      </span>
                    )}
                  </TableCell>

                  {/* Proveedor */}
                  <TableCell className="py-3.5 px-4">
                    {item.proveedor ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-medium border-border/80 bg-muted/30"
                      >
                        {item.proveedor}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground/50 italic">—</span>
                    )}
                  </TableCell>

                  {/* Costo Unitario */}
                  <TableCell className="py-3.5 px-4 font-mono text-foreground font-bold">
                    {costoUnitario > 0 ? (
                      formatCurrency(costoUnitario)
                    ) : (
                      <span className="text-muted-foreground/50 italic">—</span>
                    )}
                  </TableCell>

                  {/* Valor Total Valorizado */}
                  <TableCell className="py-3.5 px-4 font-mono text-secondary font-black">
                    {valorTotal > 0 ? (
                      formatCurrency(valorTotal)
                    ) : (
                      <span className="text-muted-foreground/50 italic">—</span>
                    )}
                  </TableCell>

                  {/* Acciones: Kardex, Ajustar, Editar */}
                  <TableCell className="py-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link href={`/inventario/kardex?insumoId=${item.id}`}>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2.5 rounded-xl text-muted-foreground hover:text-secondary hover:bg-secondary/10 text-[11px] font-bold cursor-pointer transition-colors"
                          title="Ver historial en Libro Kardex"
                        >
                          <BookOpen className="size-3.5 sm:mr-1 text-secondary" />
                          <span className="hidden sm:inline">Kardex</span>
                        </Button>
                      </Link>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onAdjustStock(item)}
                        className="h-8 px-2.5 rounded-xl border-border hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary text-[11px] font-bold cursor-pointer transition-colors shadow-2xs"
                        title="Ajustar stock manual"
                      >
                        <SlidersHorizontal className="size-3 sm:mr-1" />
                        <span className="hidden sm:inline">Ajustar</span>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditInsumo(item)}
                        className="size-8 p-0 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors"
                        title="Editar insumo"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {sorted.length > 0 && (
        <div className="p-4 border-t border-border bg-card/40">
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={setPage}
            showInfo
            totalItems={sorted.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </Card>
  );
}
