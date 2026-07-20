"use client";

import Link from "next/link";
import { ClipboardList, Search, Plus, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface OrdenesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onPageReset: () => void;
}

export function OrdenesToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onPageReset,
}: OrdenesToolbarProps) {
  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-secondary" />
            Bandeja de Órdenes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitorea el progreso de lavado, asigna personal y gestiona cobros de ticket en tiempo real.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Toggle Vista */}
          <div className="bg-background backdrop-blur-md p-1 rounded-lg border border-border flex items-center shadow-sm">
            <button type="button" onClick={() => { onViewModeChange("patio"); onPageReset(); }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === "patio"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <LayoutGrid className="size-4" />
              Patio
            </button>
            <button type="button" onClick={() => { onViewModeChange("lista"); onPageReset(); }}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                viewMode === "lista"
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              }`}
            >
              <List className="size-4" />
              Lista
            </button>
          </div>

          <Link href="/ordenes/nueva" passHref>
            <Button variant="secondary" className="font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-4">
              <Plus className="size-4.5" />
              Nueva Orden
            </Button>
          </Link>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, ticket o cliente..."
              value={searchQuery || ""}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageReset();
              }}
              className="pl-9 bg-card/60 backdrop-blur-md border-border hover:border-zinc-400 focus-visible:border-secondary focus-visible:ring-secondary/20 text-xs h-9 rounded-lg text-foreground placeholder:text-muted-foreground transition-all shadow-sm"
            />
          </div>

          {/* Status Dropdown Selector */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-card/45 border border-border hover:border-zinc-400 dark:hover:border-zinc-700 rounded-lg text-xs font-bold shadow-xs h-9">
            <span className="text-muted-foreground">Estado:</span>
            <select
              value={activeFilter || "todos"}
              onChange={(e) => {
                onFilterChange(e.target.value);
                onPageReset();
              }}
              aria-label="Filtrar por estado"
              className="bg-transparent border-none focus:ring-0 font-bold text-foreground py-0 pl-1 pr-6 cursor-pointer focus:outline-none"
            >
              <option value="todos" className="bg-card text-foreground font-bold">Todos</option>
              <option value="pendiente" className="bg-card text-foreground font-bold">En Espera</option>
              <option value="en_proceso" className="bg-card text-foreground font-bold">En Proceso</option>
              <option value="completado" className="bg-card text-foreground font-bold">Completados</option>
              <option value="cobrado" className="bg-card text-foreground font-bold">Cobrados</option>
            </select>
          </div>
        </div>
      </div>
    </>
  );
}
