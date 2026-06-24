"use client";

import { Calendar, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { TurnoHistorial } from "./types";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/shared/PaginationControls";

interface HistorialTurnosTableProps {
  historial: TurnoHistorial[];
  onSelectTurno: (turno: TurnoHistorial) => void;
  activePage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
}

export function HistorialTurnosTable({
  historial,
  onSelectTurno,
  activePage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: HistorialTurnosTableProps) {
  return (
    <Card className="border border-border bg-card overflow-hidden p-0">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30 border-b-border text-xs">
            <TableHead className="py-3 pl-4">Apertura</TableHead>
            <TableHead className="py-3">Cierre</TableHead>
            <TableHead className="py-3">Cajero</TableHead>
            <TableHead className="py-3 text-right">Inicial</TableHead>
            <TableHead className="py-3 text-right">Final Contado</TableHead>
            <TableHead className="py-3 pl-6">Observaciones</TableHead>
            <TableHead className="py-3 text-right pr-4">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="divide-y divide-border text-foreground text-xs">
          {historial.map((hist) => (
            <TableRow key={hist.id} className="hover:bg-muted/50 transition-colors">
              <TableCell className="py-3 pl-4 font-bold text-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  {formatDate(hist.apertura, "dd-MM-yyyy HH:mm:ss")}
                </span>
              </TableCell>
              <TableCell className="py-3 font-bold text-muted-foreground">
                {hist.cierre ? formatDate(hist.cierre, "dd-MM-yyyy HH:mm:ss") : "-"}
              </TableCell>
              <TableCell className="py-3 font-medium">
                {hist.nombreEmpleado} {hist.apellidoEmpleado}
              </TableCell>
              <TableCell className="py-3 text-right font-bold text-muted-foreground">
                {formatCurrency(parseFloat(hist.montoInicial))}
              </TableCell>
              <TableCell className="py-3 text-right font-extrabold text-foreground">
                {hist.montoFinal ? formatCurrency(parseFloat(hist.montoFinal)) : "-"}
              </TableCell>
              <TableCell className="py-3 pl-6 text-[10px] text-muted-foreground leading-normal max-w-[200px] truncate font-medium">
                {hist.observaciones?.includes("[CORTE DE CAJA DETALLADO") 
                  ? (hist.observaciones.includes("[AUTORIZADO") ? "Descuadre Autorizado" : "Arqueo Detallado") 
                  : (hist.observaciones || "Sin observaciones")}
              </TableCell>
              <TableCell className="py-3 text-right pr-4">
                <Button
                  onClick={() => onSelectTurno(hist)}
                  size="icon"
                  variant="ghost"
                  className="rounded-lg cursor-pointer text-secondary"
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {totalItems > 0 && (
        <div className="p-3 border-t border-border bg-transparent">
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
