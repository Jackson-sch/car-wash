"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Package,
  CheckCircle,
  AlertTriangle,
  ChevronDown,
  ArrowUpDown,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  SelectItem,
  SelectContent,
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
}

type StatusFilter = "todos" | "suficiente" | "bajo" | "agotado";

export function InventarioTable({ insumos, onAdjustStock }: InventarioTableProps) {
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
  const [sortBy, setSortBy] = useState<"nombre" | "stock" | "precio">("nombre");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const getStatus = (st: number, min: number): StatusFilter => {
    if (st === 0) return "agotado";
    if (st <= min) return "bajo";
    return "suficiente";
  };

  const filtered = useMemo(() => {
    let result = insumos.filter((item) => {
      const q = (searchQuery || "").toLowerCase();
      const matchesSearch =
        !q ||
        item.nombre.toLowerCase().includes(q) ||
        (item.descripcion && item.descripcion.toLowerCase().includes(q)) ||
        (item.proveedor && item.proveedor.toLowerCase().includes(q));

      if (!matchesSearch) return false;

      if (statusFilter === "todos") return true;

      const st = parseFloat(item.stock || "0");
      const min = parseFloat(item.stockMinimo || "0");
      return getStatus(st, min) === statusFilter;
    });

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === "nombre") {
        cmp = a.nombre.localeCompare(b.nombre);
      } else if (sortBy === "stock") {
        cmp = parseFloat(a.stock || "0") - parseFloat(b.stock || "0");
      } else if (sortBy === "precio") {
        cmp = (parseFloat(a.precioCompra || "0")) - (parseFloat(b.precioCompra || "0"));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return result;
  }, [insumos, searchQuery, statusFilter, sortBy, sortDir]);

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const activePage = page || 1;
  const paginatedData = filtered.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  );

  const toggleSort = (field: "nombre" | "stock" | "precio") => {
    if (sortBy === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir("asc");
    }
  };

  const SortIcon = ({ field }: { field: "nombre" | "stock" | "precio" }) => {
    if (sortBy !== field) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-30" />;
    return (
      <ChevronDown
        className={`h-3 w-3 ml-1 transition-transform ${sortDir === "desc" ? "rotate-180" : ""}`}
      />
    );
  };

  const statsBarLow = filtered.filter((i) => {
    const st = parseFloat(i.stock || "0");
    const min = parseFloat(i.stockMinimo || "0");
    return st <= min && st > 0;
  }).length;

  const statsBarOut = filtered.filter((i) => parseFloat(i.stock || "0") === 0).length;

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar insumos..."
            value={searchQuery || ""}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(null);
            }}
            className="pl-9 bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
          />
        </div>

        <Select
          value={statusFilter}
          onValueChange={(val: string | null) => {
            if (val) setStatusFilter(val as StatusFilter);
            setPage(null);
          }}
        >
          <SelectTrigger className="w-full sm:w-40 bg-background border-border text-xs h-9 rounded-lg px-3">
            <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover text-popover-foreground border border-border">
            <SelectItem value="todos">Todos los Estados</SelectItem>
            <SelectItem value="suficiente">Suficiente</SelectItem>
            <SelectItem value="bajo">Stock Bajo</SelectItem>
            <SelectItem value="agotado">Agotado</SelectItem>
          </SelectContent>
        </Select>

        {filtered.length > 0 && (
          <div className="hidden sm:flex items-center gap-3 ml-auto text-[10px] font-bold text-muted-foreground">
            {statsBarLow > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                {statsBarLow} bajo stock
              </span>
            )}
            {statsBarOut > 0 && (
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                {statsBarOut} agotados
              </span>
            )}
          </div>
        )}
      </div>

      {/* Table / Empty State */}
      {filtered.length === 0 ? (
        <Card className="p-12 border border-border bg-card text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
          <Package className="h-6 w-6 text-muted-foreground" />
          <h4 className="text-sm font-bold text-foreground">Catálogo vacío</h4>
          <p className="text-xs text-muted-foreground">
            {searchQuery || statusFilter !== "todos"
              ? "No se encontraron insumos con los filtros seleccionados."
              : "No hay insumos registrados. Agrega tu primer producto."}
          </p>
        </Card>
      ) : (
        <Card className="border border-border bg-card overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
          <div className="overflow-x-auto">
            <Table className="min-w-[750px]">
              <TableHeader>
                <TableRow className="bg-muted/40 border-b border-border">
                  <TableHead className="py-3.5 px-4">
                    <button
                      onClick={() => toggleSort("nombre")}
                      className="flex items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Insumo
                      <SortIcon field="nombre" />
                    </button>
                  </TableHead>
                  <TableHead className="py-3.5 px-4">
                    <button
                      onClick={() => toggleSort("stock")}
                      className="flex items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Stock Actual
                      <SortIcon field="stock" />
                    </button>
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Mínimo
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Estado
                  </TableHead>
                  <TableHead className="py-3.5 px-4 text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Proveedor
                  </TableHead>
                  <TableHead className="py-3.5 px-4">
                    <button
                      onClick={() => toggleSort("precio")}
                      className="flex items-center text-[10px] uppercase font-bold tracking-wider text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    >
                      Costo
                      <SortIcon field="precio" />
                    </button>
                  </TableHead>
                  <TableHead className="py-3.5 pr-4 text-right text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                    Acción
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-border/40 text-xs">
                {paginatedData.map((item) => {
                  const stVal = parseFloat(item.stock || "0");
                  const minVal = parseFloat(item.stockMinimo || "0");
                  const status = stVal === 0 ? "agotado" : stVal <= minVal ? "bajo" : "suficiente";

                  return (
                    <TableRow
                      key={item.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      <TableCell className="py-3.5 px-4">
                        <div className="font-extrabold text-foreground">{item.nombre}</div>
                        {item.descripcion && (
                          <div className="text-[10px] text-muted-foreground font-medium mt-0.5 line-clamp-1">
                            {item.descripcion}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        <span className="font-extrabold text-foreground">
                          {stVal.toFixed(2)}
                        </span>
                        <span className="text-muted-foreground ml-1 text-[10px] font-medium">
                          {item.unidad}
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-muted-foreground font-semibold">
                        {minVal.toFixed(2)} {item.unidad}
                      </TableCell>
                      <TableCell className="py-3.5 px-4">
                        {status === "suficiente" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                            <CheckCircle className="h-2.5 w-2.5" />
                            Suficiente
                          </span>
                        ) : status === "bajo" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Stock Bajo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="h-2.5 w-2.5" />
                            Agotado
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 text-muted-foreground font-semibold">
                        {item.proveedor || (
                          <span className="text-muted-foreground/50 italic">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3.5 px-4 font-mono text-foreground font-semibold">
                        {item.precioCompra
                          ? formatCurrency(parseFloat(item.precioCompra))
                          : <span className="text-muted-foreground/50 italic">—</span>}
                      </TableCell>
                      <TableCell className="py-3.5 pr-4 text-right">
                        <Button
                          variant="outline"
                          onClick={() => onAdjustStock(item)}
                          className="border-border hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] font-bold h-7.5 px-2.5 rounded-lg cursor-pointer"
                        >
                          Ajustar Stock
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      <PaginationControls
        activePage={activePage}
        totalPages={totalPages}
        onPageChange={setPage}
        showInfo
        totalItems={filtered.length}
        itemsPerPage={itemsPerPage}
      />
    </div>
  );
}
