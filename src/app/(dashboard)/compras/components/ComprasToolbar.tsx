"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CompraFilterType } from "../types";

interface ComprasToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filterType: CompraFilterType;
  onFilterChange: (type: CompraFilterType) => void;
  counts: {
    todos: number;
    factura: number;
    boleta: number;
    completada: number;
    anulada: number;
  };
}

export function ComprasToolbar({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  counts,
}: ComprasToolbarProps) {
  const isFiltered = searchTerm !== "" || filterType !== "todos";

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Input de Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por N° factura, proveedor, RUC o insumo..."
            className="pl-9.5 pr-8 h-9.5 rounded-xl border-border bg-card/60 backdrop-blur-sm text-xs font-medium focus-visible:ring-1 focus-visible:ring-secondary/50"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Botón resetear filtros */}
        {isFiltered && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSearchChange("");
              onFilterChange("todos");
            }}
            className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Limpiar filtros
          </Button>
        )}
      </div>

      {/* Pills de Filtrado Rápido */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => onFilterChange("todos")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer text-xs ${
            filterType === "todos"
              ? "bg-secondary text-secondary-foreground shadow-xs"
              : "bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-border/60"
          }`}
        >
          Todos ({counts.todos})
        </button>

        <button
          onClick={() => onFilterChange("factura")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer text-xs ${
            filterType === "factura"
              ? "bg-secondary text-secondary-foreground shadow-xs"
              : "bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-border/60"
          }`}
        >
          Facturas ({counts.factura})
        </button>

        <button
          onClick={() => onFilterChange("boleta")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer text-xs ${
            filterType === "boleta"
              ? "bg-secondary text-secondary-foreground shadow-xs"
              : "bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-border/60"
          }`}
        >
          Boletas ({counts.boleta})
        </button>

        <button
          onClick={() => onFilterChange("completada")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer text-xs ${
            filterType === "completada"
              ? "bg-emerald-500 text-white shadow-xs"
              : "bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-border/60"
          }`}
        >
          Ingresadas ({counts.completada})
        </button>

        <button
          onClick={() => onFilterChange("anulada")}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer text-xs ${
            filterType === "anulada"
              ? "bg-rose-500 text-white shadow-xs"
              : "bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-border/60"
          }`}
        >
          Anuladas ({counts.anulada})
        </button>
      </div>
    </div>
  );
}
