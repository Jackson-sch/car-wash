"use client";

import { useState, useMemo } from "react";
import { DollarSign, CheckSquare, Square, Calendar, CreditCard, Send, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/formats";
import { liquidarComisionesEmpleado } from "@/lib/actions/empleados";

interface OrdenPendiente {
  id: string;
  nroTicket: string | null;
  total: string | null;
  createdAt: Date | null;
  placa?: string;
}

interface LiquidarComisionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  empleadoId: string;
  empleadoNombre: string;
  ordenesPendientes: OrdenPendiente[];
  onSuccess?: () => void;
}

export function LiquidarComisionModal({
  open,
  onOpenChange,
  empleadoId,
  empleadoNombre,
  ordenesPendientes,
  onSuccess,
}: LiquidarComisionModalProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() =>
    ordenesPendientes.map((o) => o.id)
  );
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [referencia, setReferencia] = useState("");
  const [notas, setNotas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === ordenesPendientes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(ordenesPendientes.map((o) => o.id));
    }
  };

  const selectedOrders = useMemo(
    () => ordenesPendientes.filter((o) => selectedSet.has(o.id)),
    [ordenesPendientes, selectedSet]
  );
  const totalVentas = selectedOrders.reduce((sum, o) => sum + (parseFloat(o.total || "0") || 0), 0);
  const totalComision = totalVentas * 0.30;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos una orden para liquidar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await liquidarComisionesEmpleado({
        empleadoId,
        ordenIds: selectedIds,
        metodoPago,
        referencia: referencia.trim() || undefined,
        notas: notas.trim() || undefined,
      });

      if (res.success) {
        toast.success(`Liquidación registrada con éxito (S/ ${totalComision.toFixed(2)})`);
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Ocurrió un error al liquidar comisiones.");
      }
    } catch {
      toast.error("Error al procesar la liquidación.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <DollarSign className="h-5 w-5 text-emerald-500" />
            Liquidar Comisiones — {empleadoNombre}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Selecciona las órdenes de servicio completadas para generar el pago de comisión correspondiente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Listado de Órdenes */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
              <span>Órdenes Pendientes ({selectedIds.length} / {ordenesPendientes.length})</span>
              <button
                type="button"
                onClick={toggleSelectAll}
                className="text-secondary hover:underline cursor-pointer text-[11px]"
              >
                {selectedIds.length === ordenesPendientes.length ? "Desmarcar todas" : "Seleccionar todas"}
              </button>
            </div>

            <div className="max-h-48 overflow-y-auto border border-border rounded-lg divide-y divide-border/60 bg-muted/20 p-1">
              {ordenesPendientes.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  No hay órdenes pendientes por liquidar para este empleado.
                </div>
              ) : (
                ordenesPendientes.map((ord) => {
                  const isChecked = selectedSet.has(ord.id);
                  const subTotalNum = parseFloat(ord.total || "0") || 0;
                  const comisionNum = subTotalNum * 0.30;
                  return (
                    <button
                      key={ord.id}
                      type="button"
                      onClick={() => toggleSelect(ord.id)}
                      className="w-full text-left flex items-center justify-between p-2 hover:bg-card rounded cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-secondary shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-foreground">
                            Ticket #{ord.nroTicket || "S/N"}
                          </span>
                          {ord.placa && (
                            <span className="ml-1.5 px-1.5 py-0.5 rounded bg-muted text-[10px] font-bold">
                              {ord.placa}
                            </span>
                          )}
                          <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Calendar className="h-3 w-3" />
                            {ord.createdAt ? formatDate(new Date(ord.createdAt)) : "Reciente"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400">
                          + {formatCurrency(comisionNum)}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          Venta: {formatCurrency(subTotalNum)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Resumen Total */}
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">Total a Pagar en Comisión</span>
              <span className="text-[11px] text-muted-foreground">30% sobre ventas acumuladas ({formatCurrency(totalVentas)})</span>
            </div>
            <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalComision)}
            </span>
          </div>

          {/* Método de Pago */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="metodo-pago-liq" className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" /> Método de Pago
              </Label>
              <select
                id="metodo-pago-liq"
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-foreground text-xs font-semibold"
              >
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia Bancaria</option>
                <option value="yape">Yape / Plin</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Nº Operación / Ref.
              </Label>
              <Input
                placeholder="Ej. Operación 1234"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedIds.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 px-4 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Procesando..." : "Confirmar Pago de Comisiones"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
