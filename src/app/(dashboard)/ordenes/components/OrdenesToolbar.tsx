"use client";

import Link from "next/link";
import {
  Car,
  Search,
  Plus,
  LayoutGrid,
  List,
  Tv,
  Filter,
} from "lucide-react";
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary">
              <Car className="size-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Bandeja de Órdenes
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 pl-0.5">
            Monitorea el progreso de lavado, asigna personal y gestiona cobros de ticket en tiempo real.
          </p>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
          {/* Segmented View Toggle (Patio vs Lista) */}
          <div className="bg-muted/40 backdrop-blur-md p-1 rounded-xl border border-border flex items-center shadow-xs">
            <button
              type="button"
              onClick={() => {
                onViewModeChange("patio");
                onPageReset();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "patio"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Patio</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onViewModeChange("lista");
                onPageReset();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "lista"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span>Lista</span>
            </button>
          </div>

          {/* Botón Modo TV para Pantalla de Taller */}
          <Link href="/patio" target="_blank" passHref>
            <Button
              variant="outline"
              className="font-bold gap-2 cursor-pointer h-9.5 rounded-xl border-border/80 bg-card/60 hover:bg-muted text-foreground px-3.5 shadow-xs transition-colors"
              title="Abrir vista en pantalla completa para Smart TV de taller"
            >
              <Tv className="size-4 text-emerald-500" />
              <span className="hidden sm:inline text-xs">Modo TV</span>
            </Button>
          </Link>

          {/* Botón Nueva Orden */}
          <Link href="/ordenes/nueva" passHref>
            <Button
              className="bg-secondary hover:bg-secondary/90 text-white font-black text-xs gap-2 cursor-pointer h-9.5 rounded-xl shadow-md shadow-secondary/20 px-4 transition-transform active:scale-95"
            >
              <Plus className="size-4" />
              <span>Nueva Orden</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between pt-1">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          {/* Input Buscador */}
          <div className="relative w-full sm:w-88">
            <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa (ej: D2F-111), cliente o ticket..."
              value={searchQuery || ""}
              onChange={(e) => {
                onSearchChange(e.target.value);
                onPageReset();
              }}
              className="pl-10 bg-card/80 backdrop-blur-md border-border/80 hover:border-border focus-visible:border-secondary focus-visible:ring-secondary/20 text-xs h-9.5 rounded-xl text-foreground placeholder:text-muted-foreground transition-colors shadow-xs"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2 px-3 bg-card/80 backdrop-blur-md border border-border/80 rounded-xl text-xs font-semibold shadow-xs h-9.5">
            <Filter className="size-3.5 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground text-[11px] font-bold">Estado:</span>
            <select
              value={activeFilter || "todos"}
              onChange={(e) => {
                onFilterChange(e.target.value);
                onPageReset();
              }}
              aria-label="Filtrar por estado"
              className="bg-transparent border-none focus:ring-0 font-bold text-foreground text-xs py-0 pl-1 pr-6 cursor-pointer focus:outline-none"
            >
              <option value="todos" className="bg-card text-foreground font-bold">
                Todos los estados
              </option>
              <option value="pendiente" className="bg-card text-foreground font-bold">
                ⏳ Cola de Espera
              </option>
              <option value="en_proceso" className="bg-card text-foreground font-bold">
                🫧 Bahía de Lavado
              </option>
              <option value="completado" className="bg-card text-foreground font-bold">
                ✨ Listos para Entrega
              </option>
              <option value="cobrado" className="bg-card text-foreground font-bold">
                💳 Cobrados
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
