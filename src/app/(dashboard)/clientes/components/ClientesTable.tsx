"use client";

import { useMemo, useState } from "react";
import type {
  CellContext,
  HeaderContext,
  SortingState} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel
} from "@tanstack/react-table";
import { ArrowUpDown, Gift, Coins, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { PaginationControls } from "@/components/shared/PaginationControls";

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string | null;
  telefono: string | null;
  email: string | null;
  tipoDoc: "DNI" | "RUC" | "CE" | "PASAPORTE" | null;
  nroDoc: string | null;
  notas: string | null;
  createdAt: Date | null;
  totalVehiculos: number;
  totalPuntos: number;
}

interface ClientesTableProps {
  clientes: Cliente[];
  onViewDetails: (cliente: Cliente) => void;
  onOpenAjuste: (cliente: Cliente) => void;
  activePage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function ClientesTable({
  clientes,
  onViewDetails,
  onOpenAjuste,
  activePage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: ClientesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => [
    {
      accessorKey: "nombre",
      header: ({ column }: HeaderContext<Cliente, unknown>) => (
        <Button
          type="button"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-muted font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground"
        >
          Nombres
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }: CellContext<Cliente, unknown>) => {
        const cli = row.original;
        return (
          <div>
            <div className="font-extrabold text-foreground">
              {cli.nombre} {cli.apellido || ""}
            </div>
            <div className="text-[10px] text-muted-foreground lowercase font-bold mt-0.5">
              {cli.email || "sin correo"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "telefono",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Celular</span>,
      cell: ({ row }: CellContext<Cliente, unknown>) => (
        <span className="text-muted-foreground font-bold">{row.getValue("telefono") || "-"}</span>
      ),
    },
    {
      id: "documento",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Documento</span>,
      cell: ({ row }: CellContext<Cliente, unknown>) => {
        const cli = row.original;
        return (
          <span className="text-muted-foreground font-bold">
            {cli.tipoDoc && cli.nroDoc ? `${cli.tipoDoc}: ${cli.nroDoc}` : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "totalVehiculos",
      header: ({ column }: HeaderContext<Cliente, unknown>) => (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground mx-auto"
          >
            Autos
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }: CellContext<Cliente, unknown>) => (
        <div className="text-center text-foreground/80 font-bold">
          {row.getValue("totalVehiculos")}
        </div>
      ),
    },
    {
      accessorKey: "totalPuntos",
      header: ({ column }: HeaderContext<Cliente, unknown>) => (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-muted font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground mx-auto"
          >
            Puntos Acumulados
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }: CellContext<Cliente, unknown>) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-500/20">
            <Gift className="h-3.5 w-3.5" />
            {row.getValue("totalPuntos")} pts
          </span>
        </div>
      ),
    },
    {
      id: "acciones",
      header: () => <div className="text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Acciones</div>,
      cell: ({ row }: CellContext<Cliente, unknown>) => {
        const cli = row.original;
        return (
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onViewDetails(cli)}
              className="border-border hover:bg-muted text-foreground/80 text-[10px] font-bold h-7.5 px-2.5"
            >
              Ver Ficha
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenAjuste(cli)}
              className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg cursor-pointer"
            >
              <Coins className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [onViewDetails, onOpenAjuste]);

  // @tanstack/react-table devuelve funciones que el React Compiler no puede memoizar automáticamente
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data: clientes,
    columns,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (clientes.length === 0) {
    return (
      <Card className="p-12 border border-border bg-card text-center flex flex-col items-center justify-center space-y-3 max-w-md mx-auto shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
        <div className="h-10 w-10 rounded-xl bg-muted border border-border flex items-center justify-center text-muted-foreground">
          <Users className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-foreground">Directorio vacío</h4>
        <p className="text-xs text-muted-foreground leading-relaxed">
          No se encontraron clientes que coincidan con los filtros de búsqueda. ¡Crea un cliente nuevo para comenzar a acumular puntos!
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card p-0 overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <Table className="min-w-[800px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-muted/30 border-b border-border">
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id} className="py-4">
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
        <TableBody className="divide-y divide-border/40 text-xs text-foreground/80">
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-muted/40 transition-colors"
            >
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id} className="py-4">
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
