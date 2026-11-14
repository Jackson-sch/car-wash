"use client";

import { Search, X, LayoutGrid, List, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { CuponFilterType } from "../types";

interface CuponesToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: CuponFilterType;
  onFilterChange: (type: CuponFilterType) => void;
  counts: {
    todos: number;
    activos: number;
    porcentaje: number;
    fijo: number;
    agotados_expirados: number;
  };
  viewMode: "cards" | "table";
  onViewModeChange: (mode: "cards" | "table") => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function CuponesToolbar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  counts,
  viewMode,
  onViewModeChange,
  onClearFilters,
  hasActiveFilters,
}: CuponesToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      {/* Barra de búsqueda y botón limpiar */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por código (ej: BIENVENIDO, CERAMIC)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-10 text-xs rounded-xl bg-card border-border text-foreground font-mono"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-10 text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 gap-1 rounded-xl cursor-pointer shrink-0"
          >
            <FilterX className="size-3.5" />
            <span className="hidden sm:inline">Limpiar</span>
          </Button>
        )}
      </div>

      {/* Filtros por Categoría de Beneficio y Selector de Vista */}
      <div className="flex items-center gap-2 flex-wrap justify-between lg:justify-end">
        {/* Pills de Filtro */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-card border border-border rounded-xl shadow-xs">
          <button
            type="button"
            onClick={() => onFilterChange("todos")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "todos"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Todos ({counts.todos})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("activos")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "activos"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Activos ({counts.activos})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("porcentaje")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "porcentaje"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            % Descuento ({counts.porcentaje})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("fijo")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "fijo"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            S/ Fijo ({counts.fijo})
          </button>

          <button
            type="button"
            onClick={() => onFilterChange("agotados_expirados")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "agotados_expirados"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Agotados / Vencidos ({counts.agotados_expirados})
          </button>
        </div>

        {/* Toggle Vista: Vouchers / Tabla */}
        <div className="flex items-center bg-card border border-border rounded-xl p-1 shadow-xs">
          <button
            type="button"
            onClick={() => onViewModeChange("cards")}
            title="Vista Cuadrícula de Vouchers"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "cards"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutGrid className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("table")}
            title="Vista Tabla Ejecutiva"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <List className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
