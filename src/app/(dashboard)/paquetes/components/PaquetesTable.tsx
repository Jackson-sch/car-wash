"use client";

import { useMemo } from "react";
import {
  Package,
  Pencil,
  Power,
  PowerOff,
  Trash2,
  Layers,
  Copy,
  Sparkles,
  Clock,
  PlusCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/lib/formats";
import type { PaqueteItem, ServicioOption } from "./types";

interface PaquetesTableProps {
  data: PaqueteItem[];
  servicios?: ServicioOption[];
  searchQuery: string;
  onEdit: (paquete: PaqueteItem) => void;
  onDuplicate?: (paquete: PaqueteItem) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
  onNew?: () => void;
}

export function PaquetesTable({
  data,
  servicios = [],
  searchQuery,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
  onNew,
}: PaquetesTableProps) {
  const serviciosMap = useMemo(() => {
    const map = new Map<string, ServicioOption>();
    servicios.forEach((s) => map.set(s.id, s));
    return map;
  }, [servicios]);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="border-b border-border/80 hover:bg-transparent">
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Paquete / Duración
            </TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Servicios Incluidos
            </TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Tarifa Combo vs Regular
            </TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Ahorro Cliente
            </TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Estado
            </TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11 text-right">
              Acciones
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="p-6">
                <EmptyState
                  icon={Package}
                  title={
                    searchQuery
                      ? "Sin resultados para tu búsqueda"
                      : "No hay paquetes registrados"
                  }
                  description={
                    searchQuery
                      ? "Prueba buscando con otros términos o limpia el filtro."
                      : "Crea tu primer paquete combinando servicios con descuento."
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
              </TableCell>
            </TableRow>
          ) : (
            data.map((p) => {
              const regularPrice = p.servicios.reduce(
                (acc, s) => acc + (parseFloat(serviciosMap.get(s.id)?.precio || "0") || 0),
                0
              );
              const totalDuration = p.servicios.reduce(
                (acc, s) => acc + (serviciosMap.get(s.id)?.duracionMin ?? 30),
                0
              );
              const comboPrice = parseFloat(p.precio) || 0;
              const savings = regularPrice > comboPrice ? regularPrice - comboPrice : 0;
              const savingsPct =
                regularPrice > 0 && savings > 0
                  ? Math.round((savings / regularPrice) * 100)
                  : 0;

              return (
                <TableRow
                  key={p.id}
                  className={`transition-colors border-b border-border/50 hover:bg-muted/20 ${
                    !p.activo && "opacity-75"
                  }`}
                >
                  <TableCell className="py-3.5">
                    <div className="font-extrabold text-foreground tracking-tight text-sm">
                      {p.nombre}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <Clock className="size-3 text-secondary" />
                        ~{totalDuration} min
                      </span>
                      {p.descripcion && (
                        <span className="text-xs text-muted-foreground/80 max-w-xs truncate">
                          · {p.descripcion}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex flex-wrap gap-1.5 max-w-md">
                      {p.servicios.length === 0 ? (
                        <span className="text-xs italic text-muted-foreground font-medium">
                          Sin servicios
                        </span>
                      ) : (
                        p.servicios.map((s) => (
                          <Badge
                            key={s.id}
                            variant="outline"
                            className="text-xs font-semibold py-0.5 px-2 bg-muted/40 text-foreground border-border/60 rounded-lg flex items-center gap-1"
                          >
                            <Layers className="h-3 w-3 text-secondary shrink-0" />
                            {s.nombre}
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="font-black font-mono text-sm text-foreground">
                      {formatCurrency(comboPrice)}
                    </div>
                    {regularPrice > 0 && (
                      <div className="text-[11px] font-mono text-muted-foreground line-through">
                        Reg: {formatCurrency(regularPrice)}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    {savings > 0 ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Sparkles className="size-3" />
                        {formatCurrency(savings)} ({savingsPct}% OFF)
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge
                      variant={p.activo ? "default" : "secondary"}
                      className={`text-[10px] font-bold tracking-wider uppercase ${
                        p.activo
                          ? "bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
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
                  </TableCell>
                  <TableCell className="text-right py-3.5">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(p)}
                        className="h-8 w-8 rounded-lg hover:bg-muted/80 hover:text-primary transition-colors cursor-pointer"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      {onDuplicate && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDuplicate(p)}
                          className="h-8 w-8 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                          title="Duplicar"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onToggleStatus(p.id)}
                        className="h-8 w-8 rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                        title={p.activo ? "Pausar" : "Activar"}
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
                        className="h-8 w-8 rounded-lg hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
