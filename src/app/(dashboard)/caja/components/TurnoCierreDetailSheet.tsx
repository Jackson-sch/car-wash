"use client";

import { 
  ShieldCheck, 
  DollarSign, 
  Coins, 
  User, 
  Clock 
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { 
  TurnoHistorial, 
  MetodoPagoConciliacion, 
  DesgloseEfectivoItem 
} from "./types";
import { parseObservaciones } from "./cierreParser";
import { formatCurrency, formatTime } from "@/lib/formats";

interface TurnoCierreDetailSheetProps {
  selectedTurno: TurnoHistorial | null;
  onClose: () => void;
}

export function TurnoCierreDetailSheet({ selectedTurno, onClose }: TurnoCierreDetailSheetProps) {
  const parsedDetails = selectedTurno ? parseObservaciones(selectedTurno.observaciones) : null;

  // Calcular totales consolidados del arqueo
  const totalEsperado = parsedDetails?.metodos.reduce((acc, m) => acc + m.esperado, 0) ?? 0;
  const totalContado = parsedDetails?.metodos.reduce((acc, m) => acc + m.contado, 0) ?? 0;
  const totalDiferencia = totalContado - totalEsperado;

  return (
    <Sheet open={!!selectedTurno} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg! overflow-y-auto flex flex-col h-full bg-card border-l border-border p-6 no-scrollbar">
        {selectedTurno && (
          <div className="flex-1 flex flex-col gap-5">
            <SheetHeader className="space-y-1">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-md font-extrabold text-foreground">
                  Detalle de Cierre de Caja
                </SheetTitle>
                {parsedDetails && !parsedDetails.legacy && (
                  <Badge variant="secondary" className="text-[10px] font-extrabold px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400">
                    {parsedDetails.tipoCierre}
                  </Badge>
                )}
              </div>
              <SheetDescription className="text-[10px] text-muted-foreground">
                ID de Turno: {selectedTurno.id}
              </SheetDescription>
            </SheetHeader>

            {/* Información General del Cajero */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-muted/20 border border-border/55 rounded-xl text-xs">
              <div className="flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Cajero</p>
                  <p className="font-extrabold text-foreground">
                    {selectedTurno.nombreEmpleado} {selectedTurno.apellidoEmpleado}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4.5 w-4.5 text-muted-foreground" />
                <div>
                  <p className="text-[10px] text-muted-foreground font-semibold">Tiempos</p>
                  <p className="font-bold text-foreground text-[10px]" suppressHydrationWarning>
                    Ape: {formatTime(selectedTurno.apertura, "HH:mm:ss a")}
                  </p>
                  {selectedTurno.cierre && (
                    <p className="font-bold text-muted-foreground text-[10px]" suppressHydrationWarning>
                      Cie: {formatTime(selectedTurno.cierre, "HH:mm:ss a")}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Resumen Financiero Simplificado o Detalle Conciliado */}
            {parsedDetails && !parsedDetails.legacy ? (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <DollarSign className="h-4.5 w-4.5 text-muted-foreground" />
                  Conciliación de Medios de Pago
                </h3>
                <div className="border border-border rounded-xl overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/10 text-[10px]">
                      <TableRow className="border-b-border">
                        <TableHead className="py-2 pl-3">Método</TableHead>
                        <TableHead className="py-2 text-right">Esperado</TableHead>
                        <TableHead className="py-2 text-right">Declarado</TableHead>
                        <TableHead className="py-2 text-right pr-3">Diferencia</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-[11px] font-medium text-foreground">
                      {parsedDetails.metodos.map((m: MetodoPagoConciliacion) => (
                        <TableRow key={m.nombre} className="border-b-border/40">
                          <TableCell className="py-2 pl-3 font-semibold text-muted-foreground">
                            {m.nombre}
                          </TableCell>
                          <TableCell className="py-2 text-right text-muted-foreground">
                            {formatCurrency(m.esperado)}
                          </TableCell>
                          <TableCell className="py-2 text-right font-bold">
                            {formatCurrency(m.contado)}
                          </TableCell>
                          <TableCell className={`py-2 text-right font-extrabold pr-3 ${
                            m.diferencia < -0.01 
                              ? "text-red-500" 
                              : m.diferencia > 0.01 
                              ? "text-amber-500" 
                              : "text-emerald-500"
                          }`}>
                            {formatCurrency(m.diferencia)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Totales consolidados del arqueo */}
                      <TableRow className="bg-muted/20 font-extrabold">
                        <TableCell className="py-2.5 pl-3">Total Arqueado</TableCell>
                        <TableCell className="py-2.5 text-right text-muted-foreground">
                          {formatCurrency(totalEsperado)}
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          {formatCurrency(totalContado)}
                        </TableCell>
                        <TableCell className={`py-2.5 text-right pr-3 ${
                          totalDiferencia < -0.01
                            ? "text-red-500"
                            : totalDiferencia > 0.01
                            ? "text-amber-500"
                            : "text-emerald-500"
                        }`}>
                          {formatCurrency(totalDiferencia)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4 p-4 border border-border rounded-xl">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold">Fondo Inicial</p>
                  <p className="text-md font-extrabold text-foreground">
                    {formatCurrency(parseFloat(selectedTurno.montoInicial))}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground font-semibold">Monto Declarado (Cierre)</p>
                  <p className="text-md font-extrabold text-foreground">
                    {selectedTurno.montoFinal ? formatCurrency(parseFloat(selectedTurno.montoFinal)) : "-"}
                  </p>
                </div>
              </div>
            )}

            {/* Desglose de Efectivo Físico */}
            {parsedDetails && !parsedDetails.legacy && parsedDetails.desglose.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Coins className="h-4.5 w-4.5 text-muted-foreground" />
                  Arqueo de Efectivo Físico (Desglose)
                </h3>
                <div className="p-3 border border-border/60 bg-muted/5 rounded-xl space-y-2">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px]">
                    {parsedDetails.desglose.map((d: DesgloseEfectivoItem) => (
                      <div key={d.denominacion} className="flex justify-between border-b border-border/30 pb-1 font-medium">
                        <span className="text-muted-foreground">{d.denominacion}</span>
                        <span className="font-bold text-foreground">
                          {d.cantidad} u. = {formatCurrency(d.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Observaciones generales y Supervisor */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                Observaciones Generales
              </h3>
              <div className="p-3 border border-border bg-muted/10 rounded-xl text-xs font-medium text-muted-foreground leading-relaxed whitespace-pre-line">
                {(parsedDetails && !parsedDetails.legacy ? parsedDetails.observaciones : selectedTurno.observaciones) || "Sin observaciones registradas."}
              </div>

              {/* Firma de Autorización del Supervisor */}
              {parsedDetails && !parsedDetails.legacy && parsedDetails.supervisor && (
                <div className="flex items-start gap-2.5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div className="space-y-0.5 text-xs">
                    <p className="font-extrabold uppercase tracking-wide text-[10px]">Cierre Autorizado</p>
                    <p className="font-semibold">
                      Este cierre presentó un descuadre y fue validado y autorizado por el supervisor:
                    </p>
                    <p className="font-bold text-foreground">
                      {parsedDetails.supervisor}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
