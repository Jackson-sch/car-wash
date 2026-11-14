"use client";

import { useEffect, useCallback } from "react";
import {
  CheckCircle2,
  Printer,
  PlusCircle,
  LayoutGrid,
  MessageSquare,
  Banknote,
  Smartphone,
  CreditCard,
  Landmark,
  HelpCircle,
  Coins,
  Keyboard,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { VehiclePlate } from "@/components/shared/VehiclePlate";
import { formatCurrency } from "@/lib/formats";
import { getWhatsAppTicketUrl } from "@/lib/whatsapp";
import type { PaymentMethod } from "./CobrarModal";

export interface CobroExitosoData {
  orderId: string;
  nroTicket: string | null;
  placa: string;
  clienteNombre: string;
  clienteTelefono?: string | null;
  montoCobrado: string;
  metodo: PaymentMethod;
  vuelto?: number;
  sucursalNombre?: string;
}

interface CobroExitosoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CobroExitosoData | null;
  onPrintTicket: (orderId: string) => void;
  onNewOrder: () => void;
}

export function CobroExitosoDialog({
  open,
  onOpenChange,
  data,
  onPrintTicket,
  onNewOrder,
}: CobroExitosoDialogProps) {
  const handlePrint = useCallback(() => {
    if (data?.orderId) {
      onPrintTicket(data.orderId);
    }
  }, [data, onPrintTicket]);

  const handleWhatsApp = useCallback(() => {
    if (!data) return;
    const url = getWhatsAppTicketUrl({
      clienteNombre: data.clienteNombre,
      clienteTelefono: data.clienteTelefono,
      placa: data.placa,
      total: data.montoCobrado,
      nroTicket: data.nroTicket,
      ordenId: data.orderId,
      sucursalNombre: data.sucursalNombre,
    });
    if (url) window.open(url, "_blank");
  }, [data]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);

  // Teclas de acceso rápido en el modal de cobro exitoso
  useEffect(() => {
    if (!open || !data) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter -> Reimprimir
      if (e.key === "Enter") {
        e.preventDefault();
        handlePrint();
        return;
      }

      // W -> Enviar WhatsApp
      if (e.key.toLowerCase() === "w") {
        e.preventDefault();
        handleWhatsApp();
        return;
      }

      // N -> Nueva orden
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        onNewOrder();
        return;
      }

      // Escape -> Cerrar y quedarse en el tablero
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, data, handlePrint, handleWhatsApp, onNewOrder, handleClose]);

  if (!data) return null;

  const montoNum = parseFloat(data.montoCobrado) || 0;
  const tieneVuelto = data.metodo === "efectivo" && typeof data.vuelto === "number" && data.vuelto > 0;

  const getMethodMeta = (metodo: PaymentMethod) => {
    switch (metodo) {
      case "efectivo":
        return { label: "Efectivo", icon: Banknote, color: "text-emerald-500" };
      case "yape":
        return { label: "Yape", icon: Smartphone, color: "text-purple-500" };
      case "plin":
        return { label: "Plin", icon: Smartphone, color: "text-cyan-500" };
      case "tarjeta":
        return { label: "Tarjeta POS", icon: CreditCard, color: "text-sky-500" };
      case "transferencia":
        return { label: "Transferencia", icon: Landmark, color: "text-amber-500" };
      default:
        return { label: "Otro Método", icon: HelpCircle, color: "text-slate-400" };
    }
  };

  const methodMeta = getMethodMeta(data.metodo);
  const MethodIcon = methodMeta.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border/90 rounded-3xl max-w-lg p-5 sm:p-7 shadow-2xl text-foreground">
        <DialogHeader className="flex flex-col items-center text-center space-y-2">
          <div className="size-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="size-8" />
          </div>

          <DialogTitle className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            ¡Cobro Registrado con Éxito!
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground font-medium">
            El pago fue asentado en la caja activa y la orden quedó liquidada.
          </DialogDescription>
        </DialogHeader>

        {/* Resumen del Comprobante Liquidado */}
        <div className="p-4 rounded-2xl bg-muted/30 border border-border/80 space-y-3.5 my-1">
          <div className="flex items-center justify-between pb-3 border-b border-border/70">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Comprobante / Ticket
              </span>
              <span className="font-mono font-black text-sm text-foreground">
                #{data.nroTicket || data.orderId.substring(0, 8).toUpperCase()}
              </span>
            </div>
            <VehiclePlate plate={data.placa} size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Cliente
              </span>
              <span className="font-extrabold text-foreground truncate block flex items-center gap-1 mt-0.5">
                <User className="size-3 text-secondary shrink-0" />
                <span className="truncate">{data.clienteNombre || "Cliente General"}</span>
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Método de Pago
              </span>
              <span className="font-extrabold text-foreground flex items-center gap-1.5 mt-0.5">
                <MethodIcon className={`size-3.5 shrink-0 ${methodMeta.color}`} />
                <span>{methodMeta.label}</span>
              </span>
            </div>
          </div>

          {/* Montos y Vuelto */}
          <div className="pt-3 border-t border-border/70 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
                Total Cobrado
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-secondary tracking-tight">
                {formatCurrency(montoNum)}
              </span>
            </div>

            {tieneVuelto && (
              <div className="text-right p-2 px-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block flex items-center justify-end gap-1">
                  <Coins className="size-3" /> Vuelto Entregado
                </span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(data.vuelto || 0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="space-y-2.5 pt-1">
          {/* Botón Principal: Reimprimir */}
          <Button
            onClick={handlePrint}
            className="w-full h-11 rounded-xl bg-secondary hover:bg-sky-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-between px-4 shadow-md shadow-secondary/20 cursor-pointer transition-all active:scale-95 group"
          >
            <div className="flex items-center gap-2">
              <Printer className="size-4 text-slate-950" />
              <span>Imprimir Ticket de Salida</span>
            </div>
            <kbd className="px-2 py-0.5 rounded bg-slate-950/20 text-slate-950 font-mono font-black text-[11px] group-hover:scale-105 transition-transform">
              ↵ Enter
            </kbd>
          </Button>

          {/* Acciones Secundarias en Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <Button
              variant="outline"
              onClick={handleWhatsApp}
              className="h-10 rounded-xl border-border/90 text-foreground hover:bg-emerald-500/10 hover:border-emerald-500/40 text-xs font-bold flex items-center justify-between px-3 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-1.5 truncate">
                <MessageSquare className="size-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">WhatsApp</span>
              </div>
              <kbd className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground border border-border">
                W
              </kbd>
            </Button>

            <Button
              variant="outline"
              onClick={onNewOrder}
              className="h-10 rounded-xl border-border/90 text-foreground hover:bg-secondary/10 hover:border-secondary text-xs font-bold flex items-center justify-between px-3 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-1.5 truncate">
                <PlusCircle className="size-3.5 text-secondary shrink-0" />
                <span className="truncate">Siguiente Auto</span>
              </div>
              <kbd className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold text-muted-foreground border border-border">
                N
              </kbd>
            </Button>
          </div>

          {/* Botón de Salir / Quedarse en Bandeja */}
          <Button
            variant="ghost"
            onClick={handleClose}
            className="w-full h-9 rounded-xl text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer flex items-center justify-center gap-2"
          >
            <LayoutGrid className="size-3.5" />
            <span>Continuar en el Tablero de Patio</span>
            <kbd className="px-1.5 py-0.2 rounded bg-muted text-[10px] font-mono font-bold">
              Esc
            </kbd>
          </Button>
        </div>

        {/* Micro Footer de atajos */}
        <div className="pt-2 border-t border-border/60 text-center text-[10px] text-muted-foreground flex items-center justify-center gap-1.5">
          <Keyboard className="size-3 text-secondary" />
          <span>Atajos de teclado:</span>
          <kbd className="px-1 py-0.2 rounded bg-muted font-mono font-bold text-[9px] text-foreground">↵ Enter</kbd>
          <span>Imprimir •</span>
          <kbd className="px-1 py-0.2 rounded bg-muted font-mono font-bold text-[9px] text-foreground">W</kbd>
          <span>WhatsApp •</span>
          <kbd className="px-1 py-0.2 rounded bg-muted font-mono font-bold text-[9px] text-foreground">N</kbd>
          <span>Nuevo •</span>
          <kbd className="px-1 py-0.2 rounded bg-muted font-mono font-bold text-[9px] text-foreground">Esc</kbd>
          <span>Cerrar</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
