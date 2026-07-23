"use client";

import { useCallback } from "react";
import { Car, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatShortDate } from "@/lib/formats";
import { TipoIcon } from "./TipoIcon";
import type { VehiculoData } from "../types";
import { TIPO_LABELS } from "../types";

interface EspecificacionesCardProps {
  vehiculo: VehiculoData;
}

export function EspecificacionesCard({ vehiculo }: EspecificacionesCardProps) {
  // Helper to resolve CSS hex color from color names
  const getColorHex = useCallback((colorName: string | null) => {
    if (!colorName) return null;
    const name = colorName.toLowerCase().trim();
    switch (name) {
      case "blanco":
        return "#ffffff";
      case "negro":
        return "#18181b";
      case "rojo":
        return "#ef4444";
      case "azul":
        return "#3b82f6";
      case "gris":
      case "plomo":
        return "#71717a";
      case "plata":
        return "#cbd5e1";
      case "verde":
        return "#22c55e";
      case "amarillo":
        return "#eab308";
      case "naranja":
        return "#f97316";
      default:
        return null;
    }
  }, []);

  const swatchColor = getColorHex(vehiculo.color);

  return (
    <Card className="p-6 border-border bg-card shadow-sm hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors duration-300 rounded-2xl">
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-5 flex items-center gap-2">
        <Car className="h-4 w-4 text-secondary" />
        Especificaciones Técnicas
      </h3>
      
      <div className="space-y-3 text-sm font-semibold">
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground">Marca</span>
          <span className="font-extrabold text-foreground">{vehiculo.marca || "—"}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground">Modelo</span>
          <span className="font-extrabold text-foreground">{vehiculo.modelo || "—"}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground">Color</span>
          <span className="font-extrabold text-foreground flex items-center gap-2">
            {vehiculo.color && (
              <span 
                className="inline-block h-3.5 w-3.5 rounded-full border border-border/60 shadow-xs" 
                style={{ 
                  backgroundColor: swatchColor || "#e4e4e7"
                }} 
              />
            )}
            {vehiculo.color || "—"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground">Carrocería</span>
          <span className="font-extrabold text-foreground flex items-center gap-1.5">
            <TipoIcon tipo={vehiculo.tipo} className="h-4 w-4 text-secondary" />
            {TIPO_LABELS[vehiculo.tipo || ""] || vehiculo.tipo || "—"}
          </span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-xs text-muted-foreground">Año</span>
          <span className="font-extrabold text-foreground font-mono">{vehiculo.anio || "—"}</span>
        </div>
        <div className="flex justify-between items-center py-2">
          <span className="text-xs text-muted-foreground">Registro</span>
          <span className="font-extrabold text-foreground font-mono">
            {vehiculo.createdAt ? formatShortDate(vehiculo.createdAt) : "—"}
          </span>
        </div>
        
        {vehiculo.notas && (
          <div className="pt-4 mt-2 border-t border-border/80">
            <div className="flex items-start gap-2.5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 p-3.5 rounded-xl text-amber-800 dark:text-amber-250">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-amber-500" />
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-extrabold tracking-wider leading-none text-amber-600 dark:text-amber-400">Notas u Observaciones</p>
                <p className="text-xs font-semibold leading-relaxed mt-0.5">{vehiculo.notas}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
