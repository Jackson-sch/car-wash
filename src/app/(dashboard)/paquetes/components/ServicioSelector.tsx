"use client";

import { Check } from "lucide-react";
import { formatCurrency } from "@/lib/formats";
import { useMemo } from "react";

interface ServicioOption {
  id: string;
  nombre: string;
  precio: string;
}

interface ServicioSelectorProps {
  servicios: ServicioOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function ServicioSelector({ servicios, selectedIds, onToggle }: ServicioSelectorProps) {
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const filteredServicios = useMemo(() => servicios.filter((s) => s.nombre), [servicios]);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        Selecciona los servicios que forman parte de este paquete.
      </p>
      <div className="space-y-2 max-h-80 overflow-y-auto border border-border rounded-lg p-3">
        {filteredServicios.map((s) => (
            <div
              key={s.id}
              role="checkbox"
              aria-checked={selectedSet.has(s.id)}
              tabIndex={0}
              onClick={() => onToggle(s.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(s.id);
                }
              }}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div
                className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                  selectedSet.has(s.id)
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                }`}
              >
                {selectedSet.has(s.id) && <Check className="h-3 w-3" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{s.nombre}</div>
                <div className="text-xs text-muted-foreground">
                  {formatCurrency(parseFloat(s.precio))}
                </div>
              </div>
            </div>
          ))}
        {servicios.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay servicios disponibles
          </p>
        )}
      </div>
    </div>
  );
}
