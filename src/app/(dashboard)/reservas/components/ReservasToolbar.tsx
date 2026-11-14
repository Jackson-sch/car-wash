"use client";

import { LayoutGrid, List, Layers, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface ReservasToolbarProps {
  statusFilter: "todas" | "pendiente" | "en_proceso" | "completado";
  setStatusFilter: (filter: "todas" | "pendiente" | "en_proceso" | "completado") => void;
  viewMode: "bahias" | "timeline" | "lista";
  setViewMode: (mode: "bahias" | "timeline" | "lista") => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  counts: {
    total: number;
    pendiente: number;
    enProceso: number;
    completado: number;
  };
}

export function ReservasToolbar({
  statusFilter,
  setStatusFilter,
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
  counts,
}: ReservasToolbarProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
      {/* Filtros de Estado */}
      <div className="flex flex-wrap items-center gap-1.5 p-1 bg-card border border-border rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setStatusFilter("todas")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "todas"
              ? "bg-secondary text-secondary-foreground shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Todas ({counts.total})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("pendiente")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "pendiente"
              ? "bg-amber-500 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          En Espera ({counts.pendiente})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("en_proceso")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "en_proceso"
              ? "bg-cyan-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          En Bahía ({counts.enProceso})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter("completado")}
          className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
            statusFilter === "completado"
              ? "bg-emerald-600 text-white shadow-xs"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Completadas ({counts.completado})
        </button>
      </div>

      {/* Buscador y Selector de Vista */}
      <div className="flex items-center gap-2.5">
        <div className="relative w-full sm:w-60">
          <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar placa o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9 text-xs rounded-xl bg-card border-border"
          />
        </div>

        <div className="flex items-center gap-1 bg-card border border-border p-1 rounded-xl shadow-xs shrink-0">
          <button
            type="button"
            onClick={() => setViewMode("bahias")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              viewMode === "bahias"
                ? "bg-secondary/15 text-secondary border border-secondary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Vista de Bahías de Lavado"
          >
            <Layers className="size-3.5" />
            <span className="hidden sm:inline">Bahías</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              viewMode === "timeline"
                ? "bg-secondary/15 text-secondary border border-secondary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Vista por Turnos y Horarios"
          >
            <LayoutGrid className="size-3.5" />
            <span className="hidden sm:inline">Horarios</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode("lista")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              viewMode === "lista"
                ? "bg-secondary/15 text-secondary border border-secondary/30"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Vista de Lista Directa"
          >
            <List className="size-3.5" />
            <span className="hidden sm:inline">Lista</span>
          </button>
        </div>
      </div>
    </div>
  );
}
