"use client";

import { Search, X, FilterX } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { VehiculoFilterType } from "../types";

interface VehiculosToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filterType: VehiculoFilterType;
  onFilterChange: (type: VehiculoFilterType) => void;
  counts: {
    todos: number;
    sedan: number;
    suv: number;
    pickup: number;
    moto: number;
    otros: number;
    con_ordenes: number;
  };
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function VehiculosToolbar({
  searchQuery,
  onSearchChange,
  filterType,
  onFilterChange,
  counts,
  onClearFilters,
  hasActiveFilters,
}: VehiculosToolbarProps) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
      {/* Search Input */}
      <div className="flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por placa, marca, modelo o cliente..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 pr-8 h-10 text-xs rounded-xl bg-card border-border text-foreground"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              title="Limpiar texto"
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

      {/* Pills de Categoría / Tipo */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card border border-border rounded-xl shadow-xs self-start lg:self-auto">
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

        {counts.sedan > 0 && (
          <button
            type="button"
            onClick={() => onFilterChange("sedan")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "sedan"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sedán ({counts.sedan})
          </button>
        )}

        {counts.suv > 0 && (
          <button
            type="button"
            onClick={() => onFilterChange("suv")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "suv"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            SUV ({counts.suv})
          </button>
        )}

        {counts.pickup > 0 && (
          <button
            type="button"
            onClick={() => onFilterChange("pickup")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "pickup"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pick-up ({counts.pickup})
          </button>
        )}

        {counts.moto > 0 && (
          <button
            type="button"
            onClick={() => onFilterChange("moto")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "moto"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Moto ({counts.moto})
          </button>
        )}

        {counts.otros > 0 && (
          <button
            type="button"
            onClick={() => onFilterChange("otros")}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              filterType === "otros"
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Otros ({counts.otros})
          </button>
        )}

        <button
          type="button"
          onClick={() => onFilterChange("con_ordenes")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            filterType === "con_ordenes"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Con Órdenes ({counts.con_ordenes})
        </button>
      </div>
    </div>
  );
}
