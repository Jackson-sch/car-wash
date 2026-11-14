"use client";

import { useState, useMemo } from "react";
import { Check, Search, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/formats";
import type { ServicioOption } from "./types";

interface ServicioSelectorProps {
  servicios: ServicioOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function ServicioSelector({ servicios, selectedIds, onToggle }: ServicioSelectorProps) {
  const [filterQuery, setFilterQuery] = useState("");
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const filteredServicios = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    return servicios.filter(
      (s) =>
        s.nombre &&
        (!q ||
          s.nombre.toLowerCase().includes(q) ||
          (s.categoriaNombre && s.categoriaNombre.toLowerCase().includes(q)))
    );
  }, [servicios, filterQuery]);

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          Selecciona los servicios incluidos en el combo:
        </p>
        <Badge
          variant="outline"
          className="text-[10px] font-bold bg-secondary/10 text-secondary border-secondary/20"
        >
          {selectedIds.length} seleccionados
        </Badge>
      </div>

      {servicios.length > 4 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Filtrar servicios por nombre o categoría..."
            className="h-8 pl-8 text-xs bg-muted/20 border-border"
          />
        </div>
      )}

      <div className="space-y-1.5 max-h-64 overflow-y-auto border border-border rounded-xl p-2 bg-muted/10">
        {filteredServicios.map((s) => {
          const isSelected = selectedSet.has(s.id);
          return (
            <div
              key={s.id}
              role="checkbox"
              aria-checked={isSelected}
              tabIndex={0}
              onClick={() => onToggle(s.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(s.id);
                }
              }}
              className={`flex items-center gap-3 p-2.5 rounded-lg cursor-pointer transition-all border ${
                isSelected
                  ? "bg-secondary/10 border-secondary/40 shadow-2xs"
                  : "border-transparent hover:bg-muted/50"
              }`}
            >
              <div
                className={`size-4.5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                  isSelected
                    ? "bg-secondary border-secondary text-white"
                    : "border-muted-foreground/40 bg-background"
                }`}
              >
                {isSelected && <Check className="size-3 stroke-[3]" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-foreground truncate">{s.nombre}</span>
                  {s.categoriaNombre && (
                    <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.2 rounded">
                      {s.categoriaNombre}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 mt-0.5 text-[11px] text-muted-foreground">
                  <span className="font-mono font-bold text-foreground/80">
                    {formatCurrency(parseFloat(s.precio) || 0)}
                  </span>
                  {s.duracionMin ? (
                    <span className="inline-flex items-center gap-0.5">
                      <Clock className="size-2.5" />
                      {s.duracionMin} min
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })}
        {filteredServicios.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-6">
            {servicios.length === 0
              ? "No hay servicios disponibles en el catálogo"
              : "No se encontraron servicios con ese filtro"}
          </p>
        )}
      </div>
    </div>
  );
}
