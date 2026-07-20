"use client";

import { useState } from "react";
import type {
  SortingState} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel
} from "@tanstack/react-table";
import { ClipboardList } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useOrdenesColumns } from "./useOrdenesColumns";
import { PaginationControls } from "@/components/shared/PaginationControls";

export interface Orden {
  id: string;
  nroTicket: string | null;
  estado: "pendiente" | "en_proceso" | "completado" | "cobrado" | "cancelado";
  prioridad: number | null;
  total: string | null;
  notes?: string | null;
  notas?: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  placa: string;
  vehiculoMarca: string | null;
  vehiculoModelo: string | null;
  vehiculoTipo: "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro" | null;
  clienteNombre: string;
  clienteApellido: string | null;
  lavadorNombre: string | null;
  lavadorApellido: string | null;
  comprobanteTipo?: string | null;
  comprobanteSerie?: string | null;
  comprobanteNumero?: string | null;
}

export interface Lavador {
  id: string;
  nombre: string;
  apellido: string | null;
}

interface OrdenesTableProps {
  ordenes: Orden[];
  lavadores: Lavador[];
  onStatusChange: (id: string, nuevoEstado: Orden["estado"]) => void;
  onAssignLavador: (id: string, empleadoId: string | null) => void;
  activePage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function OrdenesTable({
  ordenes,
  lavadores,
  onStatusChange,
  onAssignLavador,
  activePage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: OrdenesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useOrdenesColumns({
    lavadores,
    onStatusChange,
    onAssignLavador,
  });

  // @tanstack/react-table devuelve funciones que el React Compiler no puede memoizar automáticamente
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: ordenes,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (ordenes.length === 0) {
    return (
      <Card className="p-12 border border-border bg-card/60 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto shadow-xs">
        <div className="h-10 w-10 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-muted-foreground">
          <ClipboardList className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-foreground">Cola de lavado vacía</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No se encontraron órdenes registradas en este estado. ¡Crea una nueva orden de servicio para empezar a trabajar!
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-border/80 bg-card/60 p-0 backdrop-blur-md overflow-hidden shadow-xs rounded-xl">
      <div className="overflow-x-auto">
        <Table className="min-w-[1000px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="bg-muted/40 border-b border-border/50 hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="h-11 px-4 align-middle text-left">
                    {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="divide-y divide-border/30 text-xs text-foreground/80 dark:text-foreground/90">
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/35 dark:hover:bg-muted/15 transition-all duration-150 border-b border-border/20 last:border-0 group"
              >
                {row.getVisibleCells().map((cell, index) => (
                  <TableCell 
                    key={cell.id} 
                    className={`px-4 py-3 align-middle transition-all ${
                      index === 0 
                        ? "relative after:absolute after:left-0 after:top-2.5 after:bottom-2.5 after:w-[3px] after:bg-secondary after:rounded-r-full after:opacity-0 group-hover:after:opacity-100 after:transition-opacity after:duration-150" 
                        : ""
                    }`}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {totalItems > 0 && (
        <div className="p-4 border-t border-border bg-transparent">
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={onPageChange}
            showInfo
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}
    </Card>
  );
}
