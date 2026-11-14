"use client";

import { useState, useMemo } from "react";
import { 
  Sparkles, 
  Search, 
  Clock, 
  Check, 
  Plus, 
  Flame
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/formats";
import type { Servicio } from "../hooks/useNuevaOrden";

interface ServicesPOSGridProps {
  servicios: Servicio[];
  serviciosSeleccionados: string[];
  onToggleServicio: (id: string) => void;
  calculateServicePrice: (basePrice: string) => string;
  searchInputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ServicesPOSGrid({
  servicios,
  serviciosSeleccionados,
  onToggleServicio,
  calculateServicePrice,
  searchInputRef,
}: ServicesPOSGridProps) {
  const [search, setSearch] = useState("");
  const [selectedCategoria, setSelectedCategoria] = useState<string>("todos");

  const selectedSet = useMemo(() => new Set(serviciosSeleccionados), [serviciosSeleccionados]);

  // Extract distinct categories
  const categories = useMemo(() => {
    const map = new Map<string, string>();
    servicios.forEach((s) => {
      if (s.categoriaId && s.categoriaNombre) {
        map.set(s.categoriaId, s.categoriaNombre);
      }
    });
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [servicios]);

  // Top / Frecuentes: first 4 or 5 services (or those tagged)
  const topServices = useMemo(() => {
    return servicios.slice(0, 4);
  }, [servicios]);

  // Filtered services
  const filteredServicios = useMemo(() => {
    let list = servicios;

    if (selectedCategoria !== "todos") {
      list = list.filter((s) => s.categoriaId === selectedCategoria);
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.nombre.toLowerCase().includes(q) ||
          (s.categoriaNombre && s.categoriaNombre.toLowerCase().includes(q)) ||
          (s.descripcion && s.descripcion.toLowerCase().includes(q))
      );
    }

    return list;
  }, [servicios, selectedCategoria, search]);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
            <Sparkles className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Catálogo de Servicios & Lavados
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Haz clic para agregar o remover del ticket de la orden
            </p>
          </div>
        </div>

        {/* Buscador de servicios con atajo [/] */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar servicio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 pr-8 h-9 text-xs bg-background border-border rounded-xl focus:border-secondary"
          />
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.2 rounded border border-border">
            /
          </span>
        </div>
      </div>

      {/* Servicios Rápidos / Más Pedidos (One-click fast chips) */}
      {!search && selectedCategoria === "todos" && topServices.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-500 uppercase tracking-wider">
            <Flame className="size-3.5 fill-amber-500" />
            <span>Accesos Rápidos (Servicios Frecuentes)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {topServices.map((serv) => {
              const isSelected = selectedSet.has(serv.id);
              const price = calculateServicePrice(serv.precio);

              return (
                <button
                  key={`top-${serv.id}`}
                  type="button"
                  onClick={() => onToggleServicio(serv.id)}
                  className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-secondary/15 border-secondary ring-1 ring-secondary/50 shadow-xs"
                      : "bg-background hover:bg-muted/70 border-border hover:border-secondary/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <p className="text-xs font-bold text-foreground line-clamp-1">
                      {serv.nombre}
                    </p>
                    <div
                      className={`size-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected ? "bg-secondary text-slate-950" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {isSelected ? <Check className="size-2.5" /> : <Plus className="size-2.5" />}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="size-3" />
                      {serv.duracionMin || 30}m
                    </span>
                    <span className="font-extrabold text-foreground">
                      {formatCurrency(parseFloat(price))}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filtro por Categorías (Tabs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        <button
          type="button"
          onClick={() => setSelectedCategoria("todos")}
          className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategoria === "todos"
              ? "bg-secondary text-slate-950 font-bold"
              : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
          }`}
        >
          Todos ({servicios.length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategoria(cat.id)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedCategoria === cat.id
                ? "bg-secondary text-slate-950 font-bold"
                : "bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {/* Grid General de Servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
        {filteredServicios.map((serv) => {
          const isSelected = selectedSet.has(serv.id);
          const price = calculateServicePrice(serv.precio);

          return (
            <div
              key={serv.id}
              onClick={() => onToggleServicio(serv.id)}
              className={`p-3 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-secondary/10 border-secondary ring-1 ring-secondary/40 shadow-xs"
                  : "bg-background hover:bg-muted/50 border-border hover:border-border/80"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    {serv.categoriaNombre || "General"}
                  </span>
                  <div
                    className={`size-4 rounded-md flex items-center justify-center shrink-0 ${
                      isSelected
                        ? "bg-secondary text-slate-950 font-black"
                        : "border border-border text-transparent"
                    }`}
                  >
                    <Check className="size-3" />
                  </div>
                </div>

                <h4 className="text-xs font-bold text-foreground leading-snug line-clamp-1">
                  {serv.nombre}
                </h4>

                {serv.descripcion && (
                  <p className="text-[11px] text-muted-foreground line-clamp-2 mt-0.5">
                    {serv.descripcion}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/60">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Clock className="size-3" />
                  {serv.duracionMin || 30} min
                </span>
                <span className="text-sm font-black text-foreground">
                  {formatCurrency(parseFloat(price))}
                </span>
              </div>
            </div>
          );
        })}

        {filteredServicios.length === 0 && (
          <div className="col-span-full py-8 text-center text-muted-foreground text-xs">
            No se encontraron servicios con el filtro aplicado.
          </div>
        )}
      </div>
    </div>
  );
}
