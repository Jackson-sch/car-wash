"use client";

import { Clock, Layers, Sparkles, Car, Edit3, Trash2, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import { cn } from "@/lib/utils";

export interface Categoria {
  id: string;
  nombre: string;
  orden: number | null;
}

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  duracionMin: number | null;
  aplicaA: string[] | null;
  activo: boolean | null;
  categoriaId: string | null;
  categoriaNombre: string | null;
  totalInsumosReceta?: number;
}

const VEHICULO_OPCIONES = [
  { id: "sedan", label: "Sedán" },
  { id: "suv", label: "SUV" },
  { id: "pickup", label: "Pick-up" },
  { id: "moto", label: "Moto" },
  { id: "camion", label: "Camión" },
  { id: "furgon", label: "Furgón" },
  { id: "otro", label: "Otro" },
];

interface ServiciosGridProps {
  servicios: Servicio[];
  categorias: Categoria[];
  searchQuery: string;
  activeTab: string;
  isPending: boolean;
  onEdit: (servicio: Servicio) => void;
  onReceta: (servicio: Servicio) => void;
  onDelete: (id: string) => void;
  onLoadDemo: () => void;
  onAddClick: () => void;
}

export function ServiciosGrid({
  servicios,
  categorias: _categorias,
  searchQuery,
  activeTab,
  isPending,
  onEdit,
  onReceta,
  onDelete,
  onLoadDemo,
  onAddClick,
}: ServiciosGridProps) {
  // Filtrado de servicios
  const filteredServicios = servicios.filter((serv) => {
    const matchesSearch =
      serv.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (serv.descripcion && serv.descripcion.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === "todos") return matchesSearch;
    return matchesSearch && serv.categoriaId === activeTab;
  });

  if (filteredServicios.length === 0) {
    return (
      <Card className="p-12 rounded-3xl border border-dashed border-border bg-card flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4 shadow-xs">
        <div className="h-12 w-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
          <Layers className="h-6 w-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-sm font-bold text-foreground">No se encontraron servicios</h3>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {servicios.length === 0
              ? "Aún no has registrado ningún servicio en este catálogo. Puedes agregar uno manualmente o cargar el catálogo de demostración."
              : "No hay servicios que coincidan con la búsqueda o la categoría seleccionada."}
          </p>
        </div>
        {servicios.length === 0 && (
          <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={onLoadDemo}
              className="border-border hover:bg-muted text-secondary text-xs font-bold h-9 gap-2 rounded-xl cursor-pointer"
            >
              <Sparkles className="h-4 w-4" />
              Cargar Catálogo Demo
            </Button>
            <Button
              type="button"
              onClick={onAddClick}
              className="bg-secondary hover:bg-secondary/90 text-white text-xs font-bold h-9 rounded-xl cursor-pointer"
            >
              Crear Servicio Manual
            </Button>
          </div>
        )}
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
      {filteredServicios.map((serv) => (
        <Card
          key={serv.id}
          className="group relative p-5 sm:p-6 border-border bg-card rounded-2xl shadow-xs flex flex-col justify-between hover:border-secondary/40 hover:shadow-md transition-all duration-300 overflow-hidden"
        >
          {/* Subtle top indicator bar on hover */}
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-secondary/50 via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="space-y-4">
            {/* Header Card */}
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold text-secondary tracking-wider bg-secondary/10 px-2.5 py-0.5 rounded-md border border-secondary/20">
                  {serv.categoriaNombre || "General"}
                </span>
                <h3 className="text-base font-extrabold text-foreground tracking-tight group-hover:text-secondary transition-colors truncate">
                  {serv.nombre}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xl font-black text-foreground font-mono">
                  {formatCurrency(parseFloat(serv.precio))}
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end mt-0.5 font-bold">
                  <Clock className="h-3 w-3 text-amber-500" />
                  <span>{serv.duracionMin || 30} min</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed min-h-[48px]">
              {serv.descripcion || "Sin descripción proporcionada para este servicio."}
            </p>

            {/* Compatibility Vehicles */}
            {serv.aplicaA && serv.aplicaA.length > 0 && (
              <div className="pt-1 flex flex-wrap gap-1.5">
                {serv.aplicaA.map((type) => {
                  const found = VEHICULO_OPCIONES.find((v) => v.id === type);
                  return (
                    <span
                      key={type}
                      className="px-2 py-0.5 bg-muted/60 text-[10px] text-muted-foreground font-bold rounded-md border border-border/80 flex items-center gap-1"
                    >
                      <Car className="h-2.5 w-2.5 text-secondary" />
                      {found?.label || type}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-between border-t border-border/70 pt-4 mt-5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onReceta(serv)}
              className={cn(
                "text-[11px] font-extrabold h-8 gap-1.5 rounded-xl cursor-pointer transition-all",
                (serv.totalInsumosReceta ?? 0) > 0
                  ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/20"
                  : "text-muted-foreground border-border hover:bg-muted"
              )}
            >
              <FlaskConical className="h-3.5 w-3.5" />
              {(serv.totalInsumosReceta ?? 0) > 0
                ? `Receta (${serv.totalInsumosReceta} insumo${serv.totalInsumosReceta === 1 ? "" : "s"})`
                : "Configurar Receta"}
            </Button>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onEdit(serv)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer"
                title="Editar servicio"
              >
                <Edit3 className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDelete(serv.id)}
                className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                title="Eliminar servicio"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
