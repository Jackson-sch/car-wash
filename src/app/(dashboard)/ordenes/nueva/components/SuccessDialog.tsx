"use client";

import { useEffect } from "react";
import { CheckCircle2, Printer, PlusCircle, List, User, Car, Keyboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VehiclePlate } from "@/components/shared/VehiclePlate";

interface SuccessDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placa: string;
  clienteNombre: string;
  clienteApellido: string;
  total: number;
  createdOrderId: string | null;
  onPrintTicket: (orderId: string) => void;
  onNewOrder: () => void;
  onViewOrders: () => void;
}

export function SuccessDialog({
  open,
  onOpenChange,
  placa,
  clienteNombre,
  clienteApellido,
  total,
  createdOrderId,
  onPrintTicket,
  onNewOrder,
  onViewOrders,
}: SuccessDialogProps) {
  // Manejo de atajos de teclado del modal de éxito
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Enter o P -> Imprimir ticket de trabajo
      if ((e.key === "Enter" && !e.ctrlKey && !e.metaKey) || e.key.toLowerCase() === "p") {
        e.preventDefault();
        if (createdOrderId) {
          onPrintTicket(createdOrderId);
        }
        return;
      }

      // 2. N o Espacio -> Iniciar Nueva Orden inmediatamente
      if (e.key.toLowerCase() === "n" || e.code === "Space") {
        e.preventDefault();
        onNewOrder();
        return;
      }

      // 3. O o V -> Ir a la lista de órdenes
      if (e.key.toLowerCase() === "o" || e.key.toLowerCase() === "v") {
        e.preventDefault();
        onViewOrders();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, createdOrderId, onPrintTicket, onNewOrder, onViewOrders]);

  const fullNombre =
    clienteApellido && !clienteNombre.toLowerCase().includes(clienteApellido.toLowerCase())
      ? `${clienteNombre} ${clienteApellido}`
      : clienteNombre || "(Sin nombre)";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-2 border-border/90 rounded-3xl w-[95vw] max-w-xl sm:max-w-2xl p-6 sm:p-8 space-y-5 shadow-2xl">
        {/* Cabecera con icono de éxito animado */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="p-3.5 bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 rounded-2xl shadow-md shadow-emerald-500/20">
            <CheckCircle2 className="h-10 w-10 animate-bounce duration-1000" />
          </div>
          <DialogHeader className="space-y-1 text-center">
            <DialogTitle className="text-2xl font-black text-foreground tracking-tight">
              ¡Orden Registrada con Éxito!
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              El vehículo ha ingresado a la cola de lavado y su comanda está lista para despacho.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Resumen ejecutivo en 3 bloques espaciosos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-muted/40 border border-border/80 shadow-2xs">
          {/* Bloque 1: Vehículo y Placa */}
          <div className="flex flex-col items-center sm:items-start justify-center gap-1.5 p-2 rounded-xl bg-background/60 border border-border/50">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Car className="size-3 text-secondary" />
              Placa Registrada
            </span>
            <VehiclePlate plate={placa || "ABC-123"} size="sm" country="PERÚ" copyable={false} />
          </div>

          {/* Bloque 2: Cliente */}
          <div className="flex flex-col items-center sm:items-start justify-center gap-1 p-2 rounded-xl bg-background/60 border border-border/50 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <User className="size-3 text-secondary" />
              Cliente
            </span>
            <p className="font-bold text-xs sm:text-sm text-foreground truncate w-full text-center sm:text-left">
              {fullNombre}
            </p>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              <CheckCircle2 className="size-3" />
              Datos Asociados
            </span>
          </div>

          {/* Bloque 3: Total Cobrado */}
          <div className="flex flex-col items-center sm:items-end justify-center gap-0.5 p-2 rounded-xl bg-secondary/10 border border-secondary/25">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Total a Cobrar
            </span>
            <p className="text-xl sm:text-2xl font-black text-secondary tracking-tight">
              S/ {total.toFixed(2)}
            </p>
            <span className="text-[10px] font-mono text-muted-foreground">
              Tarifa Calculada
            </span>
          </div>
        </div>

        {/* Botones de acción principales con espacio holgado */}
        <div className="space-y-3 pt-1">
          {/* Botón Principal: Imprimir Ticket */}
          <Button
            onClick={() => {
              if (createdOrderId) {
                onPrintTicket(createdOrderId);
              }
            }}
            className="bg-secondary hover:bg-sky-400 text-slate-950 font-black py-5 sm:py-6 rounded-2xl cursor-pointer w-full text-xs sm:text-sm shadow-lg shadow-secondary/25 flex items-center justify-between px-5 sm:px-6 group transition-all"
          >
            <div className="flex items-center gap-2.5">
              <Printer className="size-4 sm:size-5 text-slate-950" />
              <span>Imprimir Ticket de Trabajo para Patio</span>
            </div>
            <kbd className="px-2.5 py-1 rounded-lg bg-slate-950/20 text-slate-950 font-mono font-black text-xs group-hover:scale-105 transition-transform">
              ↵ Enter
            </kbd>
          </Button>
          
          {/* Botones Secundarios: Nueva Orden & Ver Órdenes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onNewOrder}
              className="text-foreground hover:border-secondary border-2 border-border/90 rounded-2xl text-xs sm:text-sm py-4 sm:py-5 h-auto font-bold flex items-center justify-between px-4 sm:px-5 cursor-pointer group hover:bg-secondary/10 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <PlusCircle className="size-4 text-secondary" />
                <span>Atender Siguiente Auto</span>
              </div>
              <kbd className="px-2 py-0.5 rounded-md bg-muted font-mono font-bold text-xs text-muted-foreground group-hover:text-foreground border border-border">
                N
              </kbd>
            </Button>

            <Button
              variant="outline"
              onClick={onViewOrders}
              className="text-muted-foreground hover:text-foreground border border-border rounded-2xl text-xs sm:text-sm py-4 sm:py-5 h-auto font-bold flex items-center justify-between px-4 sm:px-5 cursor-pointer group hover:bg-muted/80 transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <List className="size-4" />
                <span>Ir al Tablero de Patio</span>
              </div>
              <kbd className="px-2 py-0.5 rounded-md bg-muted font-mono font-bold text-xs text-muted-foreground group-hover:text-foreground border border-border">
                O
              </kbd>
            </Button>
          </div>
        </div>

        {/* Barra informativa inferior con atajos rápidos */}
        <div className="pt-2 border-t border-border/60 text-center text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center gap-1.5 font-bold text-foreground">
            <Keyboard className="size-3.5 text-secondary" />
            <span>Teclas rápidas:</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.2 rounded bg-muted font-mono text-[10px] text-foreground font-bold">↵ Enter</kbd> Imprimir
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.2 rounded bg-muted font-mono text-[10px] text-foreground font-bold">N</kbd> Siguiente Auto
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.2 rounded bg-muted font-mono text-[10px] text-foreground font-bold">O</kbd> Tablero
          </span>
          <span>•</span>
          <span className="inline-flex items-center gap-1">
            <kbd className="px-1.5 py-0.2 rounded bg-muted font-mono text-[10px] text-foreground font-bold">Esc</kbd> Cerrar
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
