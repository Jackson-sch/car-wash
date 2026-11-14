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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "@/lib/formats";
import { liquidarComisionesEmpleado } from "@/lib/actions/empleados";

export interface OrdenPendiente {
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
  onSuccess?: (montoLiquidado: number, ordenesLiquidadas: number) => void;
}

const METODOS_PAGO = [
  { value: "efectivo", label: "Efectivo en Mano" },
  { value: "yape", label: "Yape / Plin" },
  { value: "transferencia", label: "Transferencia Bancaria" },
];

export function LiquidarComisionModal(props: LiquidarComisionModalProps) {
  if (!props.open) return null;
  return (
    <LiquidarComisionContent
      key={`${props.empleadoId}-${props.ordenesPendientes.length}`}
      {...props}
    />
  );
}

function LiquidarComisionContent({
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
  const totalVentas = selectedOrders.reduce(
    (sum, o) => sum + (parseFloat(o.total || "0") || 0),
    0
  );
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
        toast.success(`Liquidación registrada con éxito (${formatCurrency(totalComision)})`);
        onOpenChange(false);
        onSuccess?.(totalComision, selectedIds.length);
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
            Selecciona las órdenes de servicio completadas para registrar el pago de comisión (30%).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          {/* Listado de Órdenes */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs font-bold text-muted-foreground">
              <span>
                Órdenes Pendientes ({selectedIds.length} / {ordenesPendientes.length})
              </span>
              {ordenesPendientes.length > 0 && (
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-secondary hover:underline cursor-pointer text-[11px]"
                >
                  {selectedIds.length === ordenesPendientes.length
                    ? "Desmarcar todas"
                    : "Seleccionar todas"}
                </button>
              )}
            </div>

            <div className="max-h-52 overflow-y-auto border border-border rounded-xl divide-y divide-border/60 bg-muted/20 p-1">
              {ordenesPendientes.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No hay órdenes pendientes por liquidar para este colaborador.
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
                      className="w-full text-left flex items-center justify-between p-2.5 hover:bg-muted/80 rounded-lg cursor-pointer text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        {isChecked ? (
                          <CheckSquare className="h-4 w-4 text-secondary shrink-0" />
                        ) : (
                          <Square className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                        <div>
                          <span className="font-bold text-foreground font-mono">
                            #{ord.nroTicket || "S/N"}
                          </span>
                          {ord.placa && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700/80 text-zinc-100 font-mono text-[10px] font-black uppercase">
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
                        <div className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          + {formatCurrency(comisionNum)}
                        </div>
                        <div className="text-[10px] font-mono text-muted-foreground">
                          Ticket: {formatCurrency(subTotalNum)}
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Resumen Total */}
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-emerald-800 dark:text-emerald-300 block">
                Total a Liquidar (30%)
              </span>
              <span className="text-[11px] text-muted-foreground">
                Base facturada: {formatCurrency(totalVentas)} en {selectedIds.length} órdenes
              </span>
            </div>
            <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
              {formatCurrency(totalComision)}
            </span>
          </div>

          {/* Método de Pago */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <CreditCard className="h-3.5 w-3.5" /> Medio de Pago
              </Label>
              <Select
                value={metodoPago}
                onValueChange={(val) => val && setMetodoPago(val)}
                items={METODOS_PAGO}
              >
                <SelectTrigger className="w-full h-9 text-xs bg-card border-border">
                  <SelectValue>
                    {(val) =>
                      METODOS_PAGO.find((m) => m.value === val)?.label || val
                    }
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {METODOS_PAGO.map((m) => (
                    <SelectItem key={m.value} value={m.value} label={m.label}>
                      {m.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                <FileText className="h-3.5 w-3.5" /> Nº Operación / Nota
              </Label>
              <Input
                placeholder="Ej. Yape 998123 / Vale #04"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2.5 border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold h-9 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || selectedIds.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-9 gap-1.5 px-4 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Procesando..." : "Confirmar Liquidación"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
