"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
  SortingState,
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
}

export function ClientesTable({
  clientes,
  onViewDetails,
  onOpenAjuste,
}: ClientesTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo(() => [
    {
      accessorKey: "nombre",
      header: ({ column }: any) => (
        <Button
          type="button"
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-zinc-100 font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-zinc-700"
        >
          Nombres
          <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }: any) => {
        const cli = row.original;
        return (
          <div>
            <div className="font-extrabold text-zinc-900">
              {cli.nombre} {cli.apellido || ""}
            </div>
            <div className="text-[10px] text-zinc-500 lowercase font-bold mt-0.5">
              {cli.email || "sin correo"}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "telefono",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Celular</span>,
      cell: ({ row }: any) => (
        <span className="text-zinc-550 font-bold">{row.getValue("telefono") || "-"}</span>
      ),
    },
    {
      id: "documento",
      header: () => <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Documento</span>,
      cell: ({ row }: any) => {
        const cli = row.original;
        return (
          <span className="text-zinc-550 font-bold">
            {cli.tipoDoc && cli.nroDoc ? `${cli.tipoDoc}: ${cli.nroDoc}` : "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "totalVehiculos",
      header: ({ column }: any) => (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-zinc-100 font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-zinc-700 mx-auto"
          >
            Autos
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="text-center text-zinc-800 font-bold">
          {row.getValue("totalVehiculos")}
        </div>
      ),
    },
    {
      accessorKey: "totalPuntos",
      header: ({ column }: any) => (
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-zinc-100 font-bold p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-zinc-700 mx-auto"
          >
            Puntos Acumulados
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        </div>
      ),
      cell: ({ row }: any) => (
        <div className="flex justify-center">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-800 border border-amber-200">
            <Gift className="h-3.5 w-3.5" />
            {row.getValue("totalPuntos")} pts
          </span>
        </div>
      ),
    },
    {
      id: "acciones",
      header: () => <div className="text-right text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Acciones</div>,
      cell: ({ row }: any) => {
        const cli = row.original;
        return (
          <div className="flex justify-end gap-1.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onViewDetails(cli)}
              className="border-zinc-300 hover:bg-zinc-50 text-zinc-700 text-[10px] font-bold h-7.5 px-2.5"
            >
              Ver Ficha
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => onOpenAjuste(cli)}
              className="h-7.5 w-7.5 p-0 text-muted-foreground hover:text-amber-600 hover:bg-amber-50 rounded-lg cursor-pointer"
            >
              <Coins className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [onViewDetails, onOpenAjuste]);

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
        <div className="h-10 w-10 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-center text-muted-foreground">
          <Users className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-zinc-900">Directorio vacío</h4>
        <p className="text-xs text-zinc-500 leading-relaxed">
          No se encontraron clientes que coincidan con los filtros de búsqueda. ¡Crea un cliente nuevo para comenzar a acumular puntos!
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card overflow-hidden shadow-[0_1px_3px_0_rgba(0,0,0,0.05)]">
      <Table className="min-w-[800px]">
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="bg-zinc-50 border-b border-zinc-200">
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
        <TableBody className="divide-y divide-zinc-100 text-xs text-zinc-700">
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="hover:bg-zinc-50 transition-colors"
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
    </Card>
  );
}
