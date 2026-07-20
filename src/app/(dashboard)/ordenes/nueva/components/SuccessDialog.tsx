"use client";

import { CheckCircle2, Printer, PlusCircle, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border rounded-2xl max-w-md p-6 text-center space-y-4">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
            <CheckCircle2 className="h-10 w-10 animate-pulse" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-xl font-bold text-foreground text-center">
              ¡Orden Registrada!
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-center">
              La orden de servicio se ha registrado con éxito en el sistema.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Resumen rápido */}
        <div className="bg-muted/40 border border-border p-4 rounded-xl text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Placa:</span>
            <span className="font-bold text-foreground uppercase">{placa}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cliente:</span>
            <span className="font-bold text-foreground">{clienteNombre} {clienteApellido}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total:</span>
            <span className="font-black text-secondary">S/ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-2">
          <Button
            onClick={() => {
              if (createdOrderId) {
                onPrintTicket(createdOrderId);
              }
            }}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 py-5 rounded-xl cursor-pointer w-full text-xs h-auto shadow-sm"
          >
            <Printer className="size-4" />
            Imprimir Ticket de Trabajo (Sin Precios)
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              onClick={onNewOrder}
              className="text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs py-3.5 h-auto font-semibold gap-1.5 cursor-pointer"
            >
              <PlusCircle className="size-3.5" />
              Nueva Orden
            </Button>
            <Button
              variant="outline"
              onClick={onViewOrders}
              className="text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs py-3.5 h-auto font-semibold gap-1.5 cursor-pointer"
            >
              <List className="size-3.5" />
              Ver Órdenes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
