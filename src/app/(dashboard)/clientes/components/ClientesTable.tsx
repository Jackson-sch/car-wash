"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type {
  CellContext,
  HeaderContext,
  SortingState,
} from "@tanstack/react-table";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  getSortedRowModel,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  Coins,
  Users,
  MessageCircle,
  Award,
  Sparkles,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  onViewDetails?: (cliente: Cliente) => void;
  onOpenAjuste: (cliente: Cliente) => void;
  activePage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

function getInitials(nombre: string, apellido?: string | null): string {
  const n = (nombre || "").trim().charAt(0).toUpperCase();
  const a = (apellido || "").trim().charAt(0).toUpperCase();
  return `${n}${a}` || "CL";
}

const AVATAR_COLORS = [
  "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20",
];

function getAvatarColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % AVATAR_COLORS.length;
  }
  return AVATAR_COLORS.at(hash) ?? AVATAR_COLORS[0]!;
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

  const columns = useMemo(
    () => [
      {
        accessorKey: "nombre",
        header: ({ column }: HeaderContext<Cliente, unknown>) => (
          <Button
            type="button"
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-transparent font-black p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
          >
            Cliente / Titular
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ),
        cell: ({ row }: CellContext<Cliente, unknown>) => {
          const cli = row.original;
          const initials = getInitials(cli.nombre, cli.apellido);
          const avatarColor = getAvatarColor(cli.id);

          return (
            <Link
              href={`/clientes/${cli.id}`}
              className="flex items-center gap-3 group/name cursor-pointer"
            >
              <div
                className={`size-9 rounded-xl flex items-center justify-center font-black text-xs border shrink-0 ${avatarColor} group-hover/name:scale-105 transition-transform`}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <div className="font-extrabold text-foreground text-xs sm:text-sm truncate group-hover/name:text-secondary transition-colors">
                  {cli.nombre} {cli.apellido || ""}
                </div>
                <div className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
                  {cli.email || "sin correo registrado"}
                </div>
              </div>
            </Link>
          );
        },
      },
      {
        accessorKey: "telefono",
        header: () => (
          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
            Celular / WhatsApp
          </span>
        ),
        cell: ({ row }: CellContext<Cliente, unknown>) => {
          const phone = row.getValue("telefono") as string | null;
          if (!phone) {
            return <span className="text-muted-foreground/50 italic">—</span>;
          }

          const clean = phone.replace(/\D/g, "");
          const waUrl = `https://wa.me/51${clean}?text=${encodeURIComponent(
            `Hola ${row.original.nombre}, te saludamos de Car Wash Pro Perú.`
          )}`;

          return (
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-foreground">
                {phone}
              </span>
              <a
                href={waUrl}
                target="_blank"
                rel="noreferrer"
                title={`Enviar WhatsApp a ${row.original.nombre}`}
                className="size-6 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center transition-colors cursor-pointer border border-emerald-500/20"
              >
                <MessageCircle className="size-3.5 fill-current" />
              </a>
            </div>
          );
        },
      },
      {
        id: "documento",
        header: () => (
          <span className="text-[10px] uppercase font-black text-muted-foreground tracking-wider">
            Documento
          </span>
        ),
        cell: ({ row }: CellContext<Cliente, unknown>) => {
          const cli = row.original;
          if (!cli.nroDoc) {
            return <span className="text-muted-foreground/50 italic">—</span>;
          }

          return (
            <div className="flex items-center gap-1.5 font-mono text-xs">
              <Badge
                variant="outline"
                className="text-[9px] font-black border-border/80 bg-muted/40 uppercase"
              >
                {cli.tipoDoc || "DOC"}
              </Badge>
              <span className="font-bold text-foreground">{cli.nroDoc}</span>
            </div>
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
              className="hover:bg-transparent font-black p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground mx-auto cursor-pointer"
            >
              Autos
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }: CellContext<Cliente, unknown>) => {
          const count = row.getValue("totalVehiculos") as number;
          return (
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-muted/60 text-foreground border border-border">
                <Car className="size-3 text-muted-foreground" />
                {count}
              </span>
            </div>
          );
        },
      },
      {
        accessorKey: "totalPuntos",
        header: ({ column }: HeaderContext<Cliente, unknown>) => (
          <div className="text-center">
            <Button
              type="button"
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="hover:bg-transparent font-black p-0 text-[10px] uppercase tracking-wider text-muted-foreground hover:text-foreground mx-auto cursor-pointer"
            >
              Puntos & Nivel
              <ArrowUpDown className="ml-1 h-3 w-3" />
            </Button>
          </div>
        ),
        cell: ({ row }: CellContext<Cliente, unknown>) => {
          const pts = row.getValue("totalPuntos") as number;
          const isVip = pts >= 100;
          const isSilver = pts >= 50 && pts < 100;

          return (
            <div className="flex flex-col items-center gap-1">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                  isVip
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                    : isSilver
                    ? "bg-slate-500/10 text-slate-600 dark:text-slate-300 border-slate-500/30"
                    : "bg-muted/70 text-muted-foreground border-border"
                }`}
              >
                {isVip ? (
                  <Award className="size-3 text-amber-500 animate-pulse" />
                ) : isSilver ? (
                  <Sparkles className="size-3 text-slate-400" />
                ) : (
                  <Coins className="size-3 text-muted-foreground" />
                )}
                <span className="font-mono">{pts}</span> pts
              </span>
              {isVip && (
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                  VIP Gold
                </span>
              )}
              {isSilver && (
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                  Silver
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "acciones",
        header: () => (
          <div className="text-right text-[10px] uppercase font-black text-muted-foreground tracking-wider">
            Acciones
          </div>
        ),
        cell: ({ row }: CellContext<Cliente, unknown>) => {
          const cli = row.original;
          return (
            <div className="flex items-center justify-end gap-1.5">
              <Link href={`/clientes/${cli.id}`}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-3 rounded-xl border-border hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary text-[11px] font-extrabold cursor-pointer transition-colors shadow-2xs"
                >
                  Ver Ficha
                </Button>
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => onOpenAjuste(cli)}
                className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-xl cursor-pointer"
                title="Ajustar puntos de lealtad"
              >
                <Coins className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onViewDetails, onOpenAjuste]
  );

  // @tanstack/react-table
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
      <Card className="p-12 border-dashed border-2 border-border/80 bg-card/50 text-center flex flex-col items-center justify-center space-y-3 rounded-3xl shadow-xs">
        <div className="size-14 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
          <Users className="size-7" />
        </div>
        <h4 className="text-sm font-bold text-foreground">Directorio vacío</h4>
        <p className="text-xs text-muted-foreground max-w-sm">
          No se encontraron clientes que coincidan con la búsqueda o filtro aplicado.
        </p>
      </Card>
    );
  }

  return (
    <Card className="border border-border bg-card p-0 overflow-hidden rounded-3xl shadow-xs">
      <div className="overflow-x-auto">
        <Table className="min-w-[820px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="bg-muted/40 border-b border-border hover:bg-transparent"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="py-3.5 px-4">
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
          <TableBody className="divide-y divide-border/40 text-xs">
            {table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                className="hover:bg-muted/30 transition-colors group"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id} className="py-3.5 px-4">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {totalItems > 0 && (
        <div className="p-4 border-t border-border bg-card/40">
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
