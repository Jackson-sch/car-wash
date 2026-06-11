"use client";

import { History, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";

interface TurnoHistorial {
  id: string;
  apertura: Date;
  cierre: Date | null;
  montoInicial: string;
  montoFinal: string | null;
  observaciones: string | null;
  nombreEmpleado: string;
  apellidoEmpleado: string | null;
}

interface HistorialTurnosProps {
  historial: TurnoHistorial[];
}

export function HistorialTurnos({ historial }: HistorialTurnosProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-sm font-bold text-foreground uppercase tracking-wider flex items-center gap-2 mb-4">
        <History className="h-4.5 w-4.5 text-muted-foreground" />
        Historial de Turnos de Caja
      </h2>
      {historial.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground border-border bg-card text-xs">
          Aún no se registran cierres de caja históricos en esta sucursal.
        </Card>
      ) : (
        <Card className="border border-border bg-card overflow-hidden p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 border-b-border text-xs">
                <TableHead className="py-3 pl-4">Apertura</TableHead>
                <TableHead className="py-3">Cierre</TableHead>
                <TableHead className="py-3">Cajero</TableHead>
                <TableHead className="py-3 text-right">Inicial</TableHead>
                <TableHead className="py-3 text-right">Final Contado</TableHead>
                <TableHead className="py-3 pl-6 pr-4">Observaciones / Desglose</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-border text-foreground text-xs">
              {historial.map((hist) => (
                <TableRow key={hist.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell className="py-3 pl-4 font-bold text-foreground">
                    <span className="inline-flex items-center gap-1" suppressHydrationWarning>
                      <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                      {new Date(hist.apertura).toLocaleString("es-PE")}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 font-bold text-muted-foreground" suppressHydrationWarning>
                    {hist.cierre ? new Date(hist.cierre).toLocaleString("es-PE") : "-"}
                  </TableCell>
                  <TableCell className="py-3 font-medium">
                    {hist.nombreEmpleado} {hist.apellidoEmpleado}
                  </TableCell>
                  <TableCell className="py-3 text-right font-bold text-muted-foreground">
                    S/ {parseFloat(hist.montoInicial).toFixed(2)}
                  </TableCell>
                  <TableCell className="py-3 text-right font-extrabold text-foreground">
                    S/ {hist.montoFinal ? parseFloat(hist.montoFinal).toFixed(2) : "-"}
                  </TableCell>
                  <TableCell className="py-3 pl-6 pr-4 text-[10px] text-muted-foreground leading-normal max-w-sm truncate font-medium">
                    {hist.observaciones || "Sin observaciones"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}
