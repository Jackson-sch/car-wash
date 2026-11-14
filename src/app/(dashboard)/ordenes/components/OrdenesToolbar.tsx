"use client";

import Link from "next/link";
import {
  Car,
  Search,
  Plus,
  LayoutGrid,
  List,
  Tv,
  Layers,
  Clock,
  Droplets,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface StatusCounts {
  todos: number;
  pendiente: number;
  en_proceso: number;
  completado: number;
  cobrado: number;
}

interface OrdenesToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  activeFilter: string;
  onFilterChange: (value: string) => void;
  viewMode: string;
  onViewModeChange: (mode: string) => void;
  onPageReset: () => void;
  counts?: StatusCounts;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function OrdenesToolbar({
  searchQuery,
  onSearchChange,
  activeFilter,
  onFilterChange,
  viewMode,
  onViewModeChange,
  onPageReset,
  counts = { todos: 0, pendiente: 0, en_proceso: 0, completado: 0, cobrado: 0 },
  searchInputRef,
}: OrdenesToolbarProps) {
  const filterTabs = [
    { id: "todos", label: "Todas", count: counts.todos, icon: Layers },
    { id: "pendiente", label: "En Espera", count: counts.pendiente, icon: Clock },
    { id: "en_proceso", label: "Bahía Lavado", count: counts.en_proceso, icon: Droplets },
    { id: "completado", label: "Listos Entrega", count: counts.completado, icon: CheckCircle2 },
    { id: "cobrado", label: "Cobrados", count: counts.cobrado, icon: CreditCard },
  ];

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
          {/* Segmented View Toggle (Patio vs Lista) con Hotkeys */}
          <div className="bg-muted/40 backdrop-blur-md p-1 rounded-xl border border-border flex items-center shadow-xs">
            <button
              type="button"
              onClick={() => {
                onViewModeChange("patio");
                onPageReset();
              }}
              title="Ver en tablero Kanban de patio (Tecla: P)"
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "patio"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <LayoutGrid className="size-3.5" />
              <span>Patio</span>
              <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-muted text-[9px] font-mono font-bold text-muted-foreground">
                P
              </kbd>
            </button>
            <button
              type="button"
              onClick={() => {
                onViewModeChange("lista");
                onPageReset();
              }}
              title="Ver en formato tabla con paginación (Tecla: L)"
              className={`flex items-center gap-1.5 px-3 py-1.5 min-h-[34px] text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${
                viewMode === "lista"
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <List className="size-3.5" />
              <span>Lista</span>
              <kbd className="hidden sm:inline px-1 py-0.2 rounded bg-muted text-[9px] font-mono font-bold text-muted-foreground">
                L
              </kbd>
            </button>
          </div>

          {/* Botón Modo TV para Pantalla de Taller */}
          <Link href="/patio" target="_blank" passHref>
            <Button
              variant="outline"
              className="font-bold gap-2 cursor-pointer h-9.5 rounded-xl border-border/80 bg-card/60 hover:bg-muted text-foreground px-3.5 shadow-xs transition-colors"
              title="Abrir vista en pantalla completa para Smart TV de taller (Tecla: T)"
            >
              <Tv className="size-4 text-emerald-500" />
              <span className="hidden sm:inline text-xs">Modo TV</span>
              <kbd className="hidden md:inline px-1 py-0.2 rounded bg-muted text-[9px] font-mono font-bold text-muted-foreground">
                T
              </kbd>
            </Button>
          </Link>

          {/* Botón Nueva Orden con Hotkey N */}
          <Link href="/ordenes/nueva" passHref>
            <Button
              className="bg-secondary hover:bg-sky-400 text-slate-950 font-black text-xs gap-2 cursor-pointer h-9.5 rounded-xl shadow-md shadow-secondary/20 px-4 transition-transform active:scale-95 group"
              title="Crear nueva orden en el terminal POS (Tecla: N)"
            >
              <Plus className="size-4 text-slate-950" />
              <span>Nueva Orden</span>
              <kbd className="px-1.5 py-0.2 rounded bg-slate-950/20 text-slate-950 font-mono font-black text-[10px] group-hover:scale-105 transition-transform">
                N
              </kbd>
            </Button>
          </Link>
        </div>
      </div>

      {/* Controls Bar: Search & Status Filter Pills */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between pt-1">
        {/* Input Buscador con / hotkey */}
        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="absolute left-3.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar placa, cliente o ticket..."
            value={searchQuery || ""}
            onChange={(e) => {
              onSearchChange(e.target.value);
              onPageReset();
            }}
            className="pl-10 pr-8 bg-card/80 backdrop-blur-md border-border/80 hover:border-border focus-visible:border-secondary focus-visible:ring-secondary/20 text-xs h-9.5 rounded-xl text-foreground placeholder:text-muted-foreground transition-colors shadow-xs font-medium"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground border border-border">
            /
          </kbd>
        </div>

        {/* Status Filter Pills Interactivos */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 pt-0.5">
          {filterTabs.map((tab) => {
            const isActive = activeFilter === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  onFilterChange(tab.id);
                  onPageReset();
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? "bg-secondary text-slate-950 shadow-xs ring-1 ring-secondary/50 font-black"
                    : "bg-card/70 hover:bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="size-3.5 shrink-0" />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-black ${
                    isActive
                      ? "bg-slate-950/20 text-slate-950"
                      : "bg-muted text-foreground border border-border/60"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
