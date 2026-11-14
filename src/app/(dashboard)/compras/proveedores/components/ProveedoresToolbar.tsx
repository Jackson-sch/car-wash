"use client";

import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ProveedorFilterType = "todos" | "activos" | "con_ruc" | "con_banco" | "inactivos";

interface ProveedoresToolbarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  filterType: ProveedorFilterType;
  onFilterChange: (type: ProveedorFilterType) => void;
  counts: {
    todos: number;
    activos: number;
    con_ruc: number;
    con_banco: number;
    inactivos: number;
  };
}

export function ProveedoresToolbar({
  searchTerm,
  onSearchChange,
  filterType,
  onFilterChange,
  counts,
}: ProveedoresToolbarProps) {
  const isFiltered = searchTerm !== "" || filterType !== "todos";

  const pills: { key: ProveedorFilterType; label: string; count: number }[] = [
    { key: "todos", label: "Todos", count: counts.todos },
    { key: "activos", label: "Activos", count: counts.activos },
    { key: "con_ruc", label: "Con RUC", count: counts.con_ruc },
    { key: "con_banco", label: "Con Cta. Bancaria", count: counts.con_banco },
    { key: "inactivos", label: "Inactivos", count: counts.inactivos },
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por RUC, razón social, teléfono o contacto..."
            className="pl-9.5 pr-8 h-9.5 rounded-xl border-border bg-card/60 backdrop-blur-sm text-xs font-medium focus-visible:ring-1 focus-visible:ring-secondary/50"
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

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

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        {pills.map((p) => (
          <button
            key={p.key}
            onClick={() => onFilterChange(p.key)}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer text-xs ${
              filterType === p.key
                ? "bg-secondary text-secondary-foreground shadow-xs"
                : "bg-card/60 text-muted-foreground hover:bg-muted/40 hover:text-foreground border border-border/60"
            }`}
          >
            {p.label} ({p.count})
          </button>
        ))}
      </div>
    </div>
  );
}
