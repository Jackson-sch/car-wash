"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StatusFilter = "todos" | "suficiente" | "bajo" | "agotado";

interface InventarioToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (val: StatusFilter) => void;
  unitFilter: string;
  onUnitFilterChange: (val: string) => void;
  availableUnits: string[];
  counts: {
    total: number;
    suficiente: number;
    bajo: number;
    agotado: number;
  };
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function InventarioToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  unitFilter,
  onUnitFilterChange,
  availableUnits,
  counts,
  onClearFilters,
  hasActiveFilters,
}: InventarioToolbarProps) {
  const statusPills: { id: StatusFilter; label: string; count: number; color?: string }[] = [
    { id: "todos", label: "Todos", count: counts.total },
    {
      id: "suficiente",
      label: "Óptimos",
      count: counts.suficiente,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "bajo",
      label: "Bajo Mínimo",
      count: counts.bajo,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: "agotado",
      label: "Agotados",
      count: counts.agotado,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Fila 1: Píldoras de Estado Rápido */}
      <div className="flex flex-wrap items-center gap-2">
        {statusPills.map((pill) => {
          const isActive = statusFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onStatusFilterChange(pill.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-xs scale-[1.02]"
                  : pill.color || "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <span>{pill.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                  isActive
                    ? "bg-black/20 text-white"
                    : "bg-muted-foreground/15 text-foreground"
                }`}
              >
                {pill.count}
              </span>
            </button>
          );
        })}

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1 ml-auto cursor-pointer"
          >
            <X className="size-3" />
            <span>Limpiar filtros</span>
          </Button>
        )}
      </div>

      {/* Fila 2: Buscador y Filtro por Unidad */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por insumo, descripción o proveedor (ej. Sonax, microfibra, cera)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 bg-card border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl text-foreground placeholder:text-muted-foreground/70"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Filtro por Unidad */}
        <div className="w-full sm:w-56">
          <Select value={unitFilter} onValueChange={(val: string | null) => onUnitFilterChange(val || "todas")}>
            <SelectTrigger className="w-full bg-card border-border text-xs h-10 rounded-xl px-3.5 text-foreground cursor-pointer">
              <SelectValue placeholder="Todas las unidades">
                {unitFilter === "todas" ? "Todas las unidades" : unitFilter}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border border-border">
              <SelectItem value="todas">Todas las unidades</SelectItem>
              {availableUnits.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
