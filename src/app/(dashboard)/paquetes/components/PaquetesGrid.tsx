"use client";

import { Package, Pencil, Power, PowerOff, Trash2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import { PaqueteItem } from "./types";

interface PaquetesGridProps {
  data: PaqueteItem[];
  searchQuery: string;
  onEdit: (paquete: PaqueteItem) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaquetesGrid({
  data,
  searchQuery,
  onEdit,
  onToggleStatus,
  onDelete,
}: PaquetesGridProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-20 bg-card border border-border rounded-2xl p-8 shadow-sm">
        <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/35 animate-bounce duration-1000" />
        <p className="font-bold text-lg text-foreground">
          {searchQuery ? "Sin resultados para tu búsqueda" : "No hay paquetes registrados"}
        </p>
        <p className="text-xs mt-1 text-muted-foreground/70 max-w-sm mx-auto">
          {searchQuery
            ? "Intenta con otras palabras clave o limpia el filtro de búsqueda"
            : "Crea tu primer paquete combinando servicios con precio preferencial."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map((p) => (
        <Card
          key={p.id}
          className={`group relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 ${
            p.activo
              ? "bg-gradient-to-br from-card via-card to-secondary/3 hover:border-zinc-400/50 dark:hover:border-zinc-700/50 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgba(0,0,0,0.3)] border-border/80"
              : "bg-muted/30 border-dashed border-border/60 opacity-80"
          }`}
        >
          {/* Top Info */}
          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight group-hover:text-primary transition-colors">
                  {p.nombre}
                </h3>
                {p.descripcion ? (
                  <p className="text-xs text-muted-foreground/80 mt-1 line-clamp-2 leading-relaxed">
                    {p.descripcion}
                  </p>
                ) : (
                  <p className="text-xs italic text-muted-foreground/40 mt-1">Sin descripción</p>
                )}
              </div>
              <Badge
                variant={p.activo ? "default" : "secondary"}
                className={`text-[10px] font-bold tracking-wider uppercase shrink-0 ${
                  p.activo
                    ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs"
                    : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                }`}
              >
                {p.activo ? (
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Activo
                  </span>
                ) : (
                  "Inactivo"
                )}
              </Badge>
            </div>

            {/* Services List */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground/60 block">
                Servicios Incluidos
              </span>
              <div className="flex flex-wrap gap-1.5">
                {p.servicios.length === 0 ? (
                  <span className="text-xs italic text-muted-foreground/50">
                    No tiene servicios vinculados
                  </span>
                ) : (
                  p.servicios.map((s) => (
                    <Badge
                      key={s.id}
                      variant="outline"
                      className="text-xs font-semibold py-0.5 px-2 bg-muted/40 hover:bg-muted/70 text-foreground border-border/60 transition-colors rounded-lg flex items-center gap-1"
                    >
                      <Layers className="h-3 w-3 text-secondary shrink-0" />
                      {s.nombre}
                    </Badge>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Bottom Area */}
          <div className="mt-6 pt-4 border-t border-border/50 flex items-center justify-between">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest text-muted-foreground/60 block">
                Precio Especial
              </span>
              <span className="text-2xl font-black text-foreground tracking-tight">
                {formatCurrency(parseFloat(p.precio))}
              </span>
            </div>

            {/* Actions group */}
            <div className="flex items-center gap-1 bg-muted/30 p-1 rounded-xl border border-border/40 opacity-90 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(p)}
                className="h-8 w-8 rounded-lg hover:bg-card hover:text-primary transition-all"
                title="Editar"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onToggleStatus(p.id)}
                className="h-8 w-8 rounded-lg hover:bg-card transition-all"
                title={p.activo ? "Desactivar" : "Activar"}
              >
                {p.activo ? (
                  <PowerOff className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                ) : (
                  <Power className="h-4 w-4 text-emerald-500" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(p.id)}
                className="h-8 w-8 rounded-lg hover:bg-card hover:text-destructive hover:bg-destructive/10 transition-all"
                title="Eliminar"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
