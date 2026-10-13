"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Search,
  Package,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Plus,
  Minus,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  onQuickAdjust?: (insumo: Insumo, tipo: "entrada" | "salida", delta: number) => void;
}

type StatusFilter = "todos" | "suficiente" | "bajo" | "agotado";

export function InventarioTable({
  insumos,
  onAdjustStock,
  onQuickAdjust,
}: InventarioTableProps) {
  const [searchQuery, setSearchQuery] = useQueryState("search", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [page, setPage] = useQueryState(
    "page",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("todos");
  const [sortField, setSortField] = useState<"nombre" | "stock" | "precio">("nombre");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Filtrado
  const filtered = useMemo(() => {
    return insumos.filter((item) => {
      const q = (searchQuery || "").toLowerCase();
      const matchSearch =
        item.nombre.toLowerCase().includes(q) ||
        (item.proveedor && item.proveedor.toLowerCase().includes(q)) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q));

      if (!matchSearch) return false;

      const st = parseFloat(item.stock || "0");
      const min = parseFloat(item.stockMinimo || "0");

      if (statusFilter === "suficiente") return st > min;
      if (statusFilter === "bajo") return st <= min && st > 0;
      if (statusFilter === "agotado") return st === 0;

      return true;
    });
  }, [insumos, searchQuery, statusFilter]);

  // Ordenamiento
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
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
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortOrder]);

  // Paginación
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = sorted.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const toggleSort = useCallback(
    (field: "nombre" | "stock" | "precio") => {
      if (sortField === field) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortOrder("asc");
      }
    },
    [sortField]
  );

  const renderSortIcon = (field: "nombre" | "stock" | "precio") => {
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

  const statsBarLow = insumos.filter((i) => {
    const st = parseFloat(i.stock || "0");
    const min = parseFloat(i.stockMinimo || "0");
    return st <= min && st > 0;
  }).length;

  const statsBarOut = insumos.filter((i) => parseFloat(i.stock || "0") === 0).length;

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por insumo o proveedor..."
            value={searchQuery || ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(null);
            }}
            className="pl-9 bg-card border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-xl text-foreground"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val: string | null) => {
            if (val) setStatusFilter(val as StatusFilter);
            setPage(null);
          }}
        >
          <SelectTrigger className="w-full sm:w-44 bg-card border-border text-xs h-9 rounded-xl px-3 text-foreground">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground border border-border">
            <SelectItem value="todos">Todos los Estados</SelectItem>
            <SelectItem value="suficiente">Stock Suficiente</SelectItem>
            <SelectItem value="bajo">Stock Bajo Mínimo</SelectItem>
            <SelectItem value="agotado">Agotados (0)</SelectItem>
          </SelectContent>
        </Select>

        {filtered.length > 0 && (
          <div className="hidden sm:flex items-center gap-2.5 ml-auto text-[11px] font-bold text-muted-foreground">
            {statsBarLow > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                <span className="size-2 rounded-full bg-amber-500" />
                {statsBarLow} bajo mínimo
              </span>
            )}
            {statsBarOut > 0 && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                <span className="size-2 rounded-full bg-rose-500 animate-pulse" />
                {statsBarOut} agotados
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table / Empty State */}
      {filtered.length === 0 ? (
        <Card className="p-12 border border-border bg-card text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto rounded-3xl shadow-xs">
          <Package className="h-8 w-8 text-muted-foreground" />
          <h4 className="text-sm font-bold text-foreground">Catálogo vacío</h4>
          <p className="text-xs text-muted-foreground">
            {searchQuery || statusFilter !== "todos"
              ? "No se encontraron insumos con los filtros seleccionados."
              : "No hay insumos registrados. Agrega tu primer producto."}
          </p>
        </Card>
      ) : (
        <Card className="border border-border bg-card p-0 overflow-hidden rounded-3xl shadow-xs">
          <div className="overflow-x-auto">
            <Table className="min-w-[780px]">
              <TableHeader>
                <TableRow className="bg-muted/40 border-b border-border hover:bg-transparent">
                  <TableHead className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort("nombre")}
                      className="flex items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Insumo
                      {renderSortIcon("nombre")}
                    </button>
                  </TableHead>
                  <TableHead className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort("stock")}
                      className="flex items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Nivel de Stock
                      {renderSortIcon("stock")}
                    </button>
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Mínimo Requerido
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Estado
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Proveedor
                  </TableHead>
                  <TableHead className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleSort("precio")}
                      className="flex items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Costo Compra
                      {renderSortIcon("precio")}
                    </button>
                  </TableHead>
                  <TableHead className="py-3.5 pr-4 text-right text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40 text-xs">
                {paginatedData.map((item) => {
                  const stVal = parseFloat(item.stock || "0");
                  const minVal = parseFloat(item.stockMinimo || "0");
                  const status =
                    stVal === 0 ? "agotado" : stVal <= minVal ? "bajo" : "suficiente";

                  // Porcentaje visual para barra de salud (relativo a 2x el mínimo)
                  const targetCap = minVal > 0 ? minVal * 2.5 : 10;
                  const healthPercent = Math.min(100, Math.round((stVal / targetCap) * 100));

                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Insumo y descripción */}
                      <TableCell className="py-3.5 px-4">
                        <div className="font-extrabold text-foreground">{item.nombre}</div>
                        {item.descripcion && (
                          <div className="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-1">
                            {item.descripcion}
                          </div>
                        )}
                      </TableCell>

                      {/* Stock actual con Barra de Salud */}
                      <TableCell className="py-3.5 px-4 min-w-[150px]">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-black text-xs sm:text-sm text-foreground">
                              {stVal.toFixed(2)}{" "}
                              <span className="text-[10px] font-bold text-muted-foreground">
                                {item.unidad}
                              </span>
                            </span>

                            {/* Micro-ajustes directos */}
                            {onQuickAdjust && (
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => onQuickAdjust(item, "salida", 1)}
                                  className="size-5 rounded flex items-center justify-center bg-muted hover:bg-rose-500/15 text-muted-foreground hover:text-rose-600 transition-colors cursor-pointer"
                                  title="Despachar 1 unidad (-1)"
                                >
                                  <Minus className="size-2.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onQuickAdjust(item, "entrada", 1)}
                                  className="size-5 rounded flex items-center justify-center bg-muted hover:bg-emerald-500/15 text-muted-foreground hover:text-emerald-600 transition-colors cursor-pointer"
                                  title="Ingresar 1 unidad (+1)"
                                >
                                  <Plus className="size-2.5" />
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Progress Health Meter */}
                          <div className="w-full bg-muted/60 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                status === "agotado"
                                  ? "w-0 bg-transparent"
                                  : status === "bajo"
                                  ? "bg-amber-500"
                                  : "bg-emerald-500"
                              }`}
                              style={{ width: `${Math.max(5, healthPercent)}%` }}
                            />
                          </div>
                        </div>
                      </TableCell>

                      {/* Mínimo */}
                      <TableCell className="py-3.5 px-4 font-mono text-muted-foreground font-semibold">
                        {minVal.toFixed(2)} {item.unidad}
                      </TableCell>

                      {/* Estado */}
                      <TableCell className="py-3.5 px-4">
                        {status === "suficiente" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="size-3" />
                            Óptimo
                          </span>
                        ) : status === "bajo" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="size-3" />
                            Bajo Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="size-3" />
                            Agotado
                          </span>
                        )}
                      </TableCell>

                      {/* Proveedor */}
                      <TableCell className="py-3.5 px-4 text-muted-foreground font-semibold">
                        {item.proveedor ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] font-normal border-border/80 bg-muted/20"
                          >
                            {item.proveedor}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground/40 italic">—</span>
                        )}
                      </TableCell>

                      {/* Costo */}
                      <TableCell className="py-3.5 px-4 font-mono text-foreground font-semibold">
                        {item.precioCompra ? (
                          formatCurrency(parseFloat(item.precioCompra))
                        ) : (
                          <span className="text-muted-foreground/40 italic">—</span>
                        )}
                      </TableCell>

                      {/* Acción */}
                      <TableCell className="py-3.5 pr-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onAdjustStock(item)}
                          className="h-8 px-3 rounded-xl border-border hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary text-[11px] font-extrabold cursor-pointer transition-colors"
                        >
                          <SlidersHorizontal className="size-3 mr-1" />
                          Ajustar
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filtered.length > 0 && (
            <div className="p-4 border-t border-border bg-card/40">
              <PaginationControls
                activePage={activePage}
                totalPages={totalPages}
                onPageChange={setPage}
                showInfo
                totalItems={filtered.length}
                itemsPerPage={itemsPerPage}
              />
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
