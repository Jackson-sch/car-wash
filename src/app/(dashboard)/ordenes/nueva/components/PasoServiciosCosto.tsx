"use client";

import { useMemo } from "react";
import { Clock, CheckCircle, Coins, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formats";
import { Separator } from "@/components/ui/separator";
import { useQueryState } from "nuqs";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  duracionMin: number | null;
  aplicaA: string[] | null;
  categoriaId: string | null;
  categoriaNombre: string | null;
}

interface PasoServiciosCostoProps {
  servicios: Servicio[];
  serviciosSeleccionados: string[];
  onServiceToggle: (id: string) => void;
  vehiculoTipo: string;
  descuento: string;
  setDescuento: (v: string) => void;
  subtotal: number;
  total: number;
  sucursalConfig: { multipliers?: Record<string, number> };
}

const defaultMultipliers: Record<string, number> = {
  sedan: 1.0,
  suv: 1.2,
  pickup: 1.4,
  moto: 0.8,
  camion: 2.0,
  furgon: 1.8,
  otro: 1.0,
};

const EMPTY_MULTIPLIERS: Record<string, number> = {};

export function PasoServiciosCosto({
  servicios,
  serviciosSeleccionados,
  onServiceToggle,
  vehiculoTipo,
  descuento,
  setDescuento,
  subtotal,
  total,
  sucursalConfig,
}: PasoServiciosCostoProps) {

  const selectedSet = useMemo(() => new Set(serviciosSeleccionados), [serviciosSeleccionados]);

  const dbMultipliers = sucursalConfig.multipliers || EMPTY_MULTIPLIERS;
  const multiplier = useMemo(() => {
    return dbMultipliers[vehiculoTipo] ?? defaultMultipliers[vehiculoTipo] ?? 1.0;
  }, [dbMultipliers, vehiculoTipo]);

  const calculateServicePrice = (basePrice: string) => {
    const base = parseFloat(basePrice) || 0;
    return (base * multiplier).toFixed(2);
  };

  const [searchQuery, setSearchQuery] = useQueryState("ss", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });

  const filteredServicios = useMemo(() => {
    const term = (searchQuery || "").toLowerCase();
    if (!term) return servicios;
    return servicios.filter(
      (s) =>
        s.nombre.toLowerCase().includes(term) ||
        (s.categoriaNombre || "").toLowerCase().includes(term)
    );
  }, [servicios, searchQuery]);

  const groupedByCategory = useMemo(() => {
    const groups: Record<string, Servicio[]> = {};
    for (const s of filteredServicios) {
      const cat = s.categoriaNombre || "General";
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(s);
    }
    return groups;
  }, [filteredServicios]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
      {/* Services Grid Selection */}
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xs font-bold uppercase tracking-wider">
            Selecciona Servicios de Lavado
          </h2>
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar servicio..."
              value={searchQuery || ""}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-8 h-8 text-xs"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery("")}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {servicios.length === 0 ? (
          <Card className="p-6 border-border bg-card text-center text-muted-foreground shadow-sm">
            No hay servicios registrados en la base de datos. Regístralos en el Catálogo.
          </Card>
        ) : (
          <div className="max-h-[420px] overflow-y-auto space-y-6 pr-1">
            {Object.entries(groupedByCategory).map(([categoria, items]) => (
              <div key={categoria} className="space-y-3">
                <h3 className="text-[10px] font-bold uppercase tracking-wider sticky top-0 bg-background border border-border p-2 rounded-md z-10">
                  {categoria}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {items.map((serv) => {
                    const isSelected = selectedSet.has(serv.id);
                    const calculatedPrice = calculateServicePrice(serv.precio);

                    return (
                      <button
                        key={serv.id}
                        type="button"
                        onClick={() => onServiceToggle(serv.id)}
                        className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-32 cursor-pointer ${
                          isSelected
                            ? "bg-secondary/5 border-secondary text-secondary"
                            : "bg-card border-border/60 text-zinc-750 hover:border-zinc-400/60 dark:hover:border-zinc-650/60 shadow-sm"
                        }`}
                      >
                        <div>
                          <h4 className="text-xs font-bold text-foreground mt-1 line-clamp-1">
                            {serv.nombre}
                          </h4>
                          <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-semibold">
                            {serv.descripcion || "Sin descripción"}
                          </p>
                        </div>
                        <Separator className="w-full mt-2" />
                        <div className="flex items-center justify-between w-full pt-2 mt-2">
                          <span className={`text-[10px] font-extrabold ${isSelected ? "text-secondary" : "text-muted-foreground"}`}>
                            {formatCurrency(parseFloat(calculatedPrice))}
                          </span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-bold">
                            <Clock className="h-3 w-3" />
                            {serv.duracionMin} min
                          </span>
                        </div>
                        {isSelected && (
                          <div className="absolute top-2 right-2 text-secondary">
                            <CheckCircle className="size-4 fill-secondary/5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
            {filteredServicios.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ningún servicio coincide con la búsqueda.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Price Calculations Column */}
      <Card className="p-6 border-border bg-card shadow-sm h-fit space-y-4">
        <h2 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
          <Coins className="size-4 text-secondary" />
          Resumen de Costos
        </h2>

        <div className="space-y-3 text-xs">
          <div className="flex justify-between font-bold">
            <span>Vehículo</span>
            <span className="text-muted-foreground capitalize">{vehiculoTipo}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Factor Multiplicador</span>
            <span className="text-secondary font-extrabold">x{multiplier.toFixed(1)}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Servicios Elegidos</span>
            <span className="text-muted-foreground">{serviciosSeleccionados.length}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
          <div className="flex justify-between text-xs font-bold">
            <span>Subtotal Servicios</span>
            <span className="text-muted-foreground">{formatCurrency(subtotal)}</span>
          </div>

          <div className="space-y-2 flex justify-between items-center">
            <Label htmlFor="desc" className="text-[10px] font-bold">
              Descuento Manual (S/)
            </Label>
            <Input
              id="desc"
              type="number"
              value={descuento}
              onChange={(e) => setDescuento(e.target.value)}
              className="bg-card border-zinc-300 focus-visible:border-secondary text-xs h-8 w-24 rounded-lg text-foreground animate-none text-right"
              placeholder="0"
            />
          </div>
        </div>

        <Separator />

        <div className="flex justify-between items-baseline pt-2">
          <span className="text-xs font-bold text-foreground uppercase tracking-wider">
            Total Estimado
          </span>
          <span className="text-2xl font-extrabold text-secondary">
            {formatCurrency(total)}
          </span>
        </div>
      </Card>
    </div>
  );
}
