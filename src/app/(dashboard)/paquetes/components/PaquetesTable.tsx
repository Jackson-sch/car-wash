"use client";

import { Package, Pencil, Power, PowerOff, Trash2, Layers } from "lucide-react";
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
import { formatCurrency } from "@/lib/formats";
import type { PaqueteItem } from "./types";

interface PaquetesTableProps {
  data: PaqueteItem[];
  searchQuery: string;
  onEdit: (paquete: PaqueteItem) => void;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export function PaquetesTable({
  data,
  searchQuery,
  onEdit,
  onToggleStatus,
  onDelete,
}: PaquetesTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <Table>
        <TableHeader className="bg-muted/20 dark:bg-muted/10">
          <TableRow className="border-b border-border/80 hover:bg-transparent">
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Paquete
            </TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Servicios Incluidos
            </TableHead>
            <TableHead className="text-[10px] font-extrabold uppercase tracking-widest text-muted-foreground h-11">
              Precio Especial
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
              <TableCell
                colSpan={5}
                className="text-center text-muted-foreground py-20"
              >
                <Package className="h-10 w-10 mx-auto mb-3 text-muted-foreground/35 animate-pulse duration-2000" />
                <p className="font-bold text-base text-foreground">
                  {searchQuery
                    ? "Sin resultados para tu búsqueda"
                    : "No hay paquetes registrados"}
                </p>
                <p className="text-xs mt-1 text-muted-foreground/60 max-w-sm mx-auto">
                  {searchQuery
                    ? "Prueba buscando con otros términos o limpia el filtro"
                    : "Crea tu primer paquete combinando servicios"}
                </p>
              </TableCell>
            </TableRow>
          ) : (
            data.map((p) => (
              <TableRow
                key={p.id}
                className={`transition-colors border-b border-border/50 hover:bg-muted/20 ${
                  !p.activo && "opacity-75"
                }`}
              >
                <TableCell className="py-4">
                  <div className="font-extrabold text-foreground tracking-tight text-sm">
                    {p.nombre}
                  </div>
                  {p.descripcion && (
                    <div className="text-xs text-muted-foreground/80 mt-1 max-w-xs truncate">
                      {p.descripcion}
                    </div>
                  )}
                </TableCell>
                <TableCell className="py-4">
                  <div className="flex flex-wrap gap-1.5 max-w-md">
                    {p.servicios.length === 0 ? (
                      <span className="text-xs italic text-muted-foreground/50">
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
                <TableCell className="font-black text-sm text-foreground py-4">
                  {formatCurrency(parseFloat(p.precio))}
                </TableCell>
                <TableCell className="py-4">
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
                        <span className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                        Activo
                      </span>
                    ) : (
                      "Inactivo"
                    )}
                  </Badge>
                </TableCell>
                <TableCell className="text-right py-4">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(p)}
                      className="h-8 w-8 rounded-lg hover:bg-muted/80 hover:text-primary transition-all"
                      title="Editar"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleStatus(p.id)}
                      className="h-8 w-8 rounded-lg hover:bg-muted/80 transition-all"
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
                      className="h-8 w-8 rounded-lg  hover:text-destructive hover:bg-destructive/10 transition-all"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
