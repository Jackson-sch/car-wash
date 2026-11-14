"use client";

import { Search, X, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InsumoSimple } from "../types";

export type KardexTipoFilter = "todos" | "entrada" | "salida" | "ajuste";

interface KardexToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  tipoFilter: KardexTipoFilter;
  onTipoFilterChange: (val: KardexTipoFilter) => void;
  insumoFilter: string;
  onInsumoFilterChange: (val: string) => void;
  insumos: InsumoSimple[];
  counts: {
    total: number;
    entrada: number;
    salida: number;
    ajuste: number;
  };
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function KardexToolbar({
  searchQuery,
  onSearchChange,
  tipoFilter,
  onTipoFilterChange,
  insumoFilter,
  onInsumoFilterChange,
  insumos,
  counts,
  onClearFilters,
  hasActiveFilters,
}: KardexToolbarProps) {
  const tipoPills: { id: KardexTipoFilter; label: string; count: number; color?: string }[] = [
    { id: "todos", label: "Todos", count: counts.total },
    {
      id: "entrada",
      label: "Entradas",
      count: counts.entrada,
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      id: "salida",
      label: "Salidas / Consumo",
      count: counts.salida,
      color: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    },
    {
      id: "ajuste",
      label: "Ajustes",
      count: counts.ajuste,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
  ];

  const selectedInsumo = insumos.find((i) => i.id === insumoFilter);

  return (
    <div className="space-y-3.5">
      {/* Fila 1: Píldoras de Tipo de Movimiento */}
      <div className="flex flex-wrap items-center gap-2">
        {tipoPills.map((pill) => {
          const isActive = tipoFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onTipoFilterChange(pill.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-xs scale-[1.02]"
                  : pill.color ||
                    "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
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

      {/* Fila 2: Buscador Omnibox y Selector de Insumo */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por motivo, N° de factura, orden de servicio, proveedor o usuario..."
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

        {/* Filtro por Insumo Específico */}
        <div className="w-full sm:w-72">
          <Select
            value={insumoFilter}
            onValueChange={(val: string | null) => onInsumoFilterChange(val || "todos")}
          >
            <SelectTrigger className="w-full bg-card border-border text-xs h-10 rounded-xl px-3.5 text-foreground cursor-pointer">
              <SelectValue placeholder="Todos los insumos">
                {insumoFilter === "todos"
                  ? "Todos los insumos"
                  : selectedInsumo?.nombre || "Insumo filtrado"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-popover text-popover-foreground border border-border max-h-60">
              <SelectItem value="todos">Todos los insumos</SelectItem>
              {insumos.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  <div className="flex items-center justify-between gap-3 w-full">
                    <span>{i.nombre}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      Stock: {parseFloat(i.stock || "0").toFixed(0)} {i.unidad || ""}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
