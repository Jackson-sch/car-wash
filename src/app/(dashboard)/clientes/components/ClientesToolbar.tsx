"use client";

import { Search, X, Award, Car, Users, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export type ClienteTierFilter = "todos" | "vip" | "silver" | "con_autos" | "sin_puntos";

interface ClientesToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  tierFilter: ClienteTierFilter;
  onTierFilterChange: (val: ClienteTierFilter) => void;
  counts: {
    total: number;
    vip: number;
    silver: number;
    conAutos: number;
    sinPuntos: number;
  };
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function ClientesToolbar({
  searchQuery,
  onSearchChange,
  tierFilter,
  onTierFilterChange,
  counts,
  onClearFilters,
  hasActiveFilters,
}: ClientesToolbarProps) {
  const pills: {
    id: ClienteTierFilter;
    label: string;
    count: number;
    icon: typeof Users;
    color?: string;
  }[] = [
    { id: "todos", label: "Todos", count: counts.total, icon: Users },
    {
      id: "vip",
      label: "VIP Gold (≥100 pts)",
      count: counts.vip,
      icon: Award,
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    },
    {
      id: "silver",
      label: "Silver (≥50 pts)",
      count: counts.silver,
      icon: Sparkles,
      color: "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/20",
    },
    {
      id: "con_autos",
      label: "Con Autos Registrados",
      count: counts.conAutos,
      icon: Car,
      color: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
  ];

  return (
    <div className="space-y-3.5">
      {/* Fila 1: Píldoras de Fidelización */}
      <div className="flex flex-wrap items-center gap-2">
        {pills.map((pill) => {
          const Icon = pill.icon;
          const isActive = tierFilter === pill.id;
          return (
            <button
              key={pill.id}
              type="button"
              onClick={() => onTierFilterChange(pill.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                isActive
                  ? "bg-secondary text-secondary-foreground border-secondary shadow-xs scale-[1.02]"
                  : pill.color || "bg-card text-muted-foreground border-border hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon className="size-3.5" />
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

      {/* Fila 2: Buscador */}
      <div className="relative">
        <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente por nombre, DNI, RUC, celular o placa..."
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
    </div>
  );
}
