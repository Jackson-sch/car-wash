"use client";

import { Clock, Coins, Layers, Sparkles, Car, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";

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
  onDelete: (id: string) => void;
  onLoadDemo: () => void;
  onAddClick: () => void;
}

export function ServiciosGrid({
  servicios,
  categorias,
  searchQuery,
  activeTab,
  isPending,
  onEdit,
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
      <div className="p-12 rounded-2xl border border-dashed border-zinc-300 bg-card flex flex-col items-center justify-center text-center max-w-xl mx-auto space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-muted-foreground">
          <Layers className="h-6 w-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-bold text-zinc-900">No se encontraron servicios</h3>
          <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
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
              className="border-zinc-300 hover:bg-zinc-50 text-secondary text-xs font-bold h-9 gap-2"
            >
              <Sparkles className="h-4 w-4" />
              Cargar Catálogo Demo
            </Button>
            <Button
              type="button"
              onClick={onAddClick}
              className="bg-black hover:bg-zinc-800 text-white text-xs font-bold h-9"
            >
              Crear Servicio Manual
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-305">
      {filteredServicios.map((serv) => (
        <Card
          key={serv.id}
          className="p-6 border-border bg-card/50 shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] flex flex-col justify-between hover:border-zinc-400 hover:shadow-md transition-all duration-300 relative overflow-hidden"
        >
          <div className="space-y-4">
            {/* Header Card */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-secondary tracking-wider bg-blue-50 px-2 py-0.5 rounded border border-blue-150">
                  {serv.categoriaNombre || "Sin Categoría"}
                </span>
                <h3 className="text-base font-bold text-zinc-900 mt-2">
                  {serv.nombre}
                </h3>
              </div>
              <div className="text-right">
                <div className="text-base font-extrabold text-zinc-900">
                  {formatCurrency(parseFloat(serv.precio))}
                </div>
                <div className="text-[10px] text-zinc-500 flex items-center gap-1 justify-end mt-0.5 font-bold">
                  <Clock className="h-3 w-3" />
                  {serv.duracionMin} min
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed min-h-[50px]">
              {serv.descripcion || "Sin descripción proporcionada para este servicio."}
            </p>

            {/* Compatibility Vehicles */}
            {serv.aplicaA && serv.aplicaA.length > 0 && (
              <div className="pt-2 flex flex-wrap gap-1">
                {serv.aplicaA.map((type) => {
                  const found = VEHICULO_OPCIONES.find((v) => v.id === type);
                  return (
                    <span
                      key={type}
                      className="px-2 py-0.5 bg-zinc-50 text-[9px] text-zinc-600 font-bold rounded border border-zinc-200 flex items-center gap-1"
                    >
                      <Car className="h-2.5 w-2.5 text-zinc-550" />
                      {found?.label || type}
                    </span>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions Footer */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 mt-6">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onEdit(serv)}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
            >
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(serv.id)}
              className="h-8 w-8 text-zinc-500 hover:text-rose-600 hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
