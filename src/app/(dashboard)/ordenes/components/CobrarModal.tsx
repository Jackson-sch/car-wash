"use client";

import { useState, useEffect } from "react";
import { X, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CobroResumen } from "./CobroResumen";
import { MetodoPagoSelector } from "./MetodoPagoSelector";

export type PaymentMethod =
  | "efectivo"
  | "tarjeta"
  | "yape"
  | "plin"
  | "transferencia"
  | "otro";

export interface OrdenResumen {
  id: string;
  nroTicket: string | null;
  placa: string;
  total: string | null;
  clienteNombre?: string;
  clienteApellido?: string | null;
  vehiculoMarca?: string | null;
  vehiculoModelo?: string | null;
  vehiculoTipo?: string | null;
}

interface CobrarModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenResumen;
  isPending: boolean;
  onConfirm: (metodo: PaymentMethod, referencia: string) => Promise<void>;
}

export function CobrarModal({
  isOpen,
  onClose,
  orden,
  isPending,
  onConfirm,
}: CobrarModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [paymentReference, setPaymentReference] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  // Limpiar estados al cambiar de método de pago o al abrir/cerrar el modal
  useEffect(() => {
    setPaymentReference("");
    setCashReceived("");
  }, [paymentMethod, isOpen]);

  if (!isOpen) return null;

  const totalNum = parseFloat(orden.total || "0");
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const change = cashReceivedNum - totalNum;
  const isCashInsufficient =
    paymentMethod === "efectivo" && cashReceived.trim() !== "" && change < 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCashInsufficient) return;
    await onConfirm(paymentMethod, paymentReference);
  };

  // Generador inteligente de opciones de vuelto en efectivo
  const generateQuickCashOptions = (total: number) => {
    const options = new Set<number>();
    options.add(total); // exacto

    const bills = [10, 20, 50, 100, 200];
    for (const bill of bills) {
      if (bill > total) {
        options.add(bill);
      }
    }

    const nextTen = Math.ceil(total / 10) * 10;
    if (nextTen > total) options.add(nextTen);

    const nextFifty = Math.ceil(total / 50) * 50;
    if (nextFifty > total) options.add(nextFifty);

    return Array.from(options)
      .sort((a, b) => a - b)
      .slice(0, 5);
  };

  const quickCashOptions = generateQuickCashOptions(totalNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-md animate-in fade-in duration-200 p-4">
      <div className="bg-card border border-zinc-200 w-full max-w-md rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.35)] animate-in zoom-in-95 duration-200 text-zinc-900 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-150 flex items-center justify-between bg-zinc-50/50 dark:bg-black/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-zinc-100 text-zinc-900 shadow-sm border border-zinc-200/50">
              <Receipt className="size-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-sm font-black text-zinc-900">
                Registrar Cobro
              </h3>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">
                Ticket: {orden.nroTicket || "S/N"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 flex items-center justify-center transition-all duration-200"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit}
          className="p-5 space-y-5 flex-1 overflow-y-auto max-h-[80vh]"
        >
          <CobroResumen orden={orden} totalNum={totalNum} />

          <MetodoPagoSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            totalNum={totalNum}
            cashReceived={cashReceived}
            setCashReceived={setCashReceived}
            quickCashOptions={quickCashOptions}
            paymentReference={paymentReference}
            setPaymentReference={setPaymentReference}
            cashReceivedNum={cashReceivedNum}
            change={change}
          />

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4 mt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-950 h-9 px-4 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isCashInsufficient}
              className={`font-black text-xs h-9 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 ${
                isCashInsufficient
                  ? "border border-zinc-200 cursor-not-allowed"
                  : "bg-secondary text-white hover:bg-secondary/80"
              }`}
            >
              {isPending ? "Procesando..." : "Confirmar Cobro"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
