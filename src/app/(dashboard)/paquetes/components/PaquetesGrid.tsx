"use client";

import { useMemo } from "react";
import {
  Package,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Layers,
  Sparkles,
  Clock,
  FlaskConical,
  Copy,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/formats";
import type { PaqueteItem, ServicioOption } from "./types";

interface PaquetesGridProps {
  data: PaqueteItem[];
  servicios?: ServicioOption[];
  searchQuery: string;
  onEdit: (paquete: PaqueteItem) => void;
  onDuplicate?: (paquete: PaqueteItem) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onNew?: () => void;
}

export function PaquetesGrid({
  data,
  servicios = [],
  searchQuery,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onNew,
}: PaquetesGridProps) {
  const serviciosMap = useMemo(() => {
    const map = new Map<string, ServicioOption>();
    servicios.forEach((s) => map.set(s.id, s));
    return map;
  }, [servicios]);

  if (data.length === 0) {
    return (
      <Card className="border border-border bg-card/60 rounded-2xl p-6 shadow-xs">
        <EmptyState
          icon={Package}
          title={
            searchQuery
              ? "Sin resultados para tu búsqueda"
              : "No hay paquetes registrados"
          }
          description={
            searchQuery
              ? "Intenta con otras palabras clave o limpia el filtro de búsqueda."
              : "Crea tu primer paquete combinando servicios con un precio preferencial atractivo para tus clientes."
          }
          action={
            !searchQuery && onNew
              ? {
                  label: "Crear Primer Paquete",
                  onClick: onNew,
                  icon: PlusCircle,
                }
              : undefined
          }
        />
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {data.map((p) => {
        const regularPrice = p.servicios.reduce(
          (acc, s) => acc + (parseFloat(serviciosMap.get(s.id)?.precio || "0") || 0),
          0
        );
        const totalDuration = p.servicios.reduce(
          (acc, s) => acc + (serviciosMap.get(s.id)?.duracionMin ?? 30),
          0
        );
        const totalRecipeCost = p.servicios.reduce(
          (acc, s) => acc + (serviciosMap.get(s.id)?.costoReceta || 0),
          0
        );

        const comboPrice = parseFloat(p.precio) || 0;
        const savings = regularPrice > comboPrice ? regularPrice - comboPrice : 0;
        const savingsPercent =
          regularPrice > 0 && savings > 0
            ? Math.round((savings / regularPrice) * 100)
            : 0;

        const grossMarginPct =
          comboPrice > 0
            ? Math.round(((comboPrice - totalRecipeCost) / comboPrice) * 100)
            : 0;

        return (
          <Card
            key={p.id}
            className={`group relative overflow-hidden flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 shadow-xs ${
              p.activo
                ? "bg-card hover:border-secondary/50 hover:shadow-md"
                : "bg-muted/30 border-dashed border-border/70 opacity-75"
            }`}
          >
            {/* Top Info */}
            <div className="space-y-4">
              <div className="flex justify-between items-start gap-3">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-extrabold text-base sm:text-lg text-foreground tracking-tight group-hover:text-secondary transition-colors truncate">
                    {p.nombre}
                  </h3>
                  {p.descripcion ? (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {p.descripcion}
                    </p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground mt-0.5">
                      Paquete de servicios combinados
                    </p>
                  )}
                </div>

                <Badge
                  variant={p.activo ? "default" : "secondary"}
                  className={`text-[10px] font-bold tracking-wider uppercase shrink-0 ${
                    p.activo
                      ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-xs"
                      : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                  }`}
                >
                  {p.activo ? (
                    <span className="flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      Activo
                    </span>
                  ) : (
                    "Inactivo"
                  )}
                </Badge>
              </div>

              {/* Meta chips: Duración & Costo Receta */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-muted/40 border border-border/60 px-2 py-0.5 rounded-lg">
                  <Clock className="size-3 text-secondary" />
                  ~{totalDuration} min total
                </span>
                {totalRecipeCost > 0 && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-lg">
                    <FlaskConical className="size-3" />
                    Insumos {formatCurrency(totalRecipeCost)} · Margen {grossMarginPct}%
                  </span>
                )}
              </div>

              {/* Services List */}
              <div className="space-y-2 pt-0.5">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-muted-foreground/70 block">
                  Servicios Incluidos ({p.servicios.length})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {p.servicios.length === 0 ? (
                    <span className="text-xs italic text-muted-foreground font-medium">
                      No tiene servicios vinculados
                    </span>
                  ) : (
                    p.servicios.map((s) => (
                      <Badge
                        key={s.id}
                        variant="outline"
                        className="text-[11px] font-semibold py-1 px-2.5 bg-muted/40 hover:bg-muted/70 text-foreground border-border/80 transition-colors rounded-xl flex items-center gap-1.5"
                      >
                        <Layers className="size-3 text-secondary shrink-0" />
                        {s.nombre}
                      </Badge>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Area: Pricing & Savings */}
            <div className="mt-5 pt-4 border-t border-border/60 flex items-end justify-between gap-3">
              <div>
                {savings > 0 && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full mb-1.5">
                    <Sparkles className="size-3" />
                    Ahorras {formatCurrency(savings)} ({savingsPercent}% OFF)
                  </span>
                )}

                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black font-mono text-foreground tracking-tight">
                    {formatCurrency(comboPrice)}
                  </span>
                  {regularPrice > comboPrice && (
                    <span className="text-xs text-muted-foreground line-through font-mono">
                      {formatCurrency(regularPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Actions group */}
              <div className="flex items-center gap-0.5 bg-muted/40 p-1 rounded-xl border border-border/60">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(p)}
                  className="size-8 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title="Editar paquete"
                >
                  <Pencil className="size-3.5" />
                </Button>
                {onDuplicate && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDuplicate(p)}
                    className="size-8 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Duplicar paquete"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onToggleStatus(p.id)}
                  className="size-8 rounded-lg hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                  title={p.activo ? "Pausar paquete" : "Activar paquete"}
                >
                  {p.activo ? (
                    <PowerOff className="size-3.5 text-muted-foreground hover:text-foreground" />
                  ) : (
                    <Power className="size-3.5 text-emerald-500" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(p.id)}
                  className="size-8 rounded-lg hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                  title="Eliminar paquete"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
