"use client";

import { useMemo, useState } from "react";
import {
  Search,
  X,
  MinusCircle,
  PlusCircle,
  User,
  Tag,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { useQueryState, parseAsInteger } from "nuqs";
import { PaginationControls } from "@/components/shared/PaginationControls";
import { formatCurrency, formatDate } from "@/lib/formats";
import { RegistrarEgresoModal } from "./RegistrarEgresoModal";
import type { TurnoActivo } from "./types";

interface EgresosTableProps {
  egresos: NonNullable<TurnoActivo["egresosList"]>;
}

export function EgresosTable({ egresos }: EgresosTableProps) {
  const [showEgresoModal, setShowEgresoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useQueryState("eq", {
    defaultValue: "",
    shallow: true,
    history: "replace",
  });
  const [currentPage, setCurrentPage] = useQueryState(
    "epage",
    parseAsInteger.withDefault(1).withOptions({ shallow: true })
  );
  const itemsPerPage = 5;

  const activePage = currentPage || 1;

  const filteredEgresos = useMemo(() => {
    const query = (searchQuery || "").toLowerCase().trim();
    if (!query) return egresos;

    return egresos.filter((e) => {
      return (
        e.motivo.toLowerCase().includes(query) ||
        (e.comprobanteNum || "").toLowerCase().includes(query) ||
        (e.registradoPor || "").toLowerCase().includes(query) ||
        e.categoria.toLowerCase().includes(query)
      );
    });
  }, [egresos, searchQuery]);

  const totalPages = Math.ceil(filteredEgresos.length / itemsPerPage) || 1;
  const paginatedEgresos = useMemo(() => {
    const start = (activePage - 1) * itemsPerPage;
    return filteredEgresos.slice(start, start + itemsPerPage);
  }, [filteredEgresos, activePage]);

  const totalEgresosMonto = useMemo(() => {
    return egresos.reduce((sum, e) => sum + e.monto, 0);
  }, [egresos]);

  const renderCategoriaBadge = (categoria: string) => {
    let label = categoria;
    switch (categoria) {
      case "insumos":
        label = "Insumos de Limpieza";
        break;
      case "alimentos":
        label = "Alimentos / Refrigerio";
        break;
      case "adelanto_lavador":
        label = "Adelanto Lavador";
        break;
      case "mantenimiento":
        label = "Mantenimiento";
        break;
      case "servicio_basico":
        label = "Servicios Básicos";
        break;
      case "otro":
        label = "Otro Gasto";
        break;
    }

    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-extrabold bg-muted text-foreground border border-border">
        <Tag className="size-2.5 text-rose-400" />
        {label}
      </span>
    );
  };

  return (
    <Card className="bg-card border border-border/90 shadow-sm overflow-hidden p-0 rounded-2xl">
      {/* Header y Acciones */}
      <div className="p-4 sm:p-5 border-b border-border/70 bg-muted/20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h3 className="text-sm font-black text-foreground flex items-center gap-2">
            <MinusCircle className="size-4 text-rose-500" />
            Egresos y Salidas de Caja del Turno
          </h3>
          <span className="text-[11px] text-muted-foreground">
            Total egresado en el turno:{" "}
            <span className="font-mono font-bold text-rose-500">
              {formatCurrency(totalEgresosMonto)}
            </span>{" "}
            ({egresos.length} {egresos.length === 1 ? "registro" : "registros"})
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por motivo o comprobante..."
              value={searchQuery || ""}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(null);
              }}
              className="pl-8 pr-8 h-9 text-xs w-full bg-card border-border/80 rounded-xl focus:border-rose-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setCurrentPage(null);
                }}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Button
            type="button"
            onClick={() => setShowEgresoModal(true)}
            size="sm"
            className="h-9 px-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
          >
            <PlusCircle className="size-3.5" />
            <span className="hidden sm:inline">Nuevo Egreso</span>
          </Button>
        </div>
      </div>

      {/* Tabla de Egresos */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 border-b border-border/80 hover:bg-transparent text-[11px] font-black uppercase tracking-wider text-muted-foreground">
              <TableHead className="w-[110px]">Hora</TableHead>
              <TableHead className="w-[170px]">Categoría</TableHead>
              <TableHead>Motivo / Justificación</TableHead>
              <TableHead className="w-[140px]">Comprobante</TableHead>
              <TableHead className="w-[160px]">Registrado Por</TableHead>
              <TableHead className="text-right w-[120px]">Monto Salida</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEgresos.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="p-10 text-center text-xs text-muted-foreground"
                >
                  <MinusCircle className="size-7 text-muted-foreground/30 mx-auto mb-2" />
                  No se registran salidas de dinero en este turno.
                </TableCell>
              </TableRow>
            ) : (
              paginatedEgresos.map((e) => (
                <TableRow
                  key={e.id}
                  className="hover:bg-muted/40 transition-colors border-b border-border/50 text-xs"
                >
                  <TableCell
                    className="text-muted-foreground font-mono font-medium whitespace-nowrap text-[11px]"
                    suppressHydrationWarning
                  >
                    {formatDate(e.createdAt, "hh:mm a")}
                  </TableCell>

                  <TableCell>{renderCategoriaBadge(e.categoria)}</TableCell>

                  <TableCell className="font-semibold text-foreground max-w-sm">
                    {e.motivo}
                  </TableCell>

                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {e.comprobanteNum ? (
                      <span className="flex items-center gap-1 text-foreground">
                        <FileText className="size-3 text-secondary shrink-0" />
                        #{e.comprobanteNum}
                      </span>
                    ) : (
                      <span className="text-muted-foreground/60">Sin comprobante</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="text-muted-foreground font-medium flex items-center gap-1">
                      <User className="size-3 text-muted-foreground" />
                      {e.registradoPor || "Sistema"}
                    </span>
                  </TableCell>

                  <TableCell className="text-right font-black font-mono text-rose-500 text-sm">
                    -{formatCurrency(e.monto)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredEgresos.length > 0 && (
        <div className="p-3 border-t border-border/70 bg-muted/10">
          <PaginationControls
            activePage={activePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            showInfo
            totalItems={filteredEgresos.length}
            itemsPerPage={itemsPerPage}
          />
        </div>
      )}

      {/* Modal para registrar un nuevo egreso */}
      <RegistrarEgresoModal
        open={showEgresoModal}
        onOpenChange={setShowEgresoModal}
      />
    </Card>
  );
}
