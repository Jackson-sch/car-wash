"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Receipt, Tag, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CobroResumen } from "./CobroResumen";
import { MetodoPagoSelector } from "./MetodoPagoSelector";
import { validarCupon } from "@/lib/actions/cupones";
import { formatCurrency } from "@/lib/formats";

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

interface CouponApplied {
  cuponId: string;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: number;
  descuentoCalculado: number;
}

interface CobrarModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenResumen;
  isPending: boolean;
  onConfirm: (metodo: PaymentMethod, referencia: string, monto: string, cuponId?: string) => Promise<void>;
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

  const [cuponCode, setCuponCode] = useState("");
  const [cuponError, setCuponError] = useState("");
  const [couponApplied, setCouponApplied] = useState<CouponApplied | null>(null);
  const [validatingCoupon, startValidateTransition] = useTransition();

  useEffect(() => {
    setPaymentReference("");
    setCashReceived("");
    setCuponCode("");
    setCuponError("");
    setCouponApplied(null);
  }, [paymentMethod, isOpen]);

  if (!isOpen) return null;

  const totalNum = parseFloat(orden.total || "0");
  const descuentoCoupon = couponApplied?.descuentoCalculado || 0;
  const totalConDescuento = Math.max(0, totalNum - descuentoCoupon);
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const change = cashReceivedNum - totalConDescuento;
  const isCashInsufficient =
    paymentMethod === "efectivo" && cashReceived.trim() !== "" && change < 0;

  const handleValidateCupon = () => {
    const code = cuponCode.trim();
    if (!code) return;

    startValidateTransition(async () => {
      setCuponError("");
      setCouponApplied(null);

      const result = await validarCupon(code, orden.id);
      if (!result.success) {
        setCuponError(result.error || "Cupón inválido");
        return;
      }

      let descuento = 0;
      if (result.tipoDescuento === "porcentaje") {
        descuento = (totalNum * result.valorDescuento) / 100;
        if (result.compraMinima && totalNum < result.compraMinima) {
          setCuponError(`Compra mínima de ${formatCurrency(result.compraMinima)} no alcanzada.`);
          return;
        }
      } else {
        descuento = result.valorDescuento;
        if (result.compraMinima && totalNum < result.compraMinima) {
          setCuponError(`Compra mínima de ${formatCurrency(result.compraMinima)} no alcanzada.`);
          return;
        }
      }

      setCouponApplied({
        cuponId: result.cuponId,
        tipoDescuento: result.tipoDescuento,
        valorDescuento: result.valorDescuento,
        descuentoCalculado: descuento,
      });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCashInsufficient) return;
    await onConfirm(
      paymentMethod,
      paymentReference,
      totalConDescuento.toFixed(2),
      couponApplied?.cuponId
    );
  };

  const quickCashOptions = (() => {
    const options = new Set<number>();
    options.add(totalConDescuento);
    const bills = [10, 20, 50, 100, 200];
    for (const bill of bills) {
      if (bill > totalConDescuento) options.add(bill);
    }
    const nextTen = Math.ceil(totalConDescuento / 10) * 10;
    if (nextTen > totalConDescuento) options.add(nextTen);
    const nextFifty = Math.ceil(totalConDescuento / 50) * 50;
    if (nextFifty > totalConDescuento) options.add(nextFifty);
    return Array.from(options).sort((a, b) => a - b).slice(0, 5);
  })();

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
          <CobroResumen orden={orden} totalNum={totalNum} descuentoCoupon={descuentoCoupon} />

          {/* Coupon Section */}
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1.5">
              <Tag className="h-3 w-3" />
              Cupón de Descuento
            </label>
            {couponApplied ? (
              <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20 dark:border-emerald-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                      Cupón aplicado
                    </span>
                    <span className="text-[10px] text-emerald-600/70 dark:text-emerald-500/70 block">
                      {couponApplied.tipoDescuento === "porcentaje"
                        ? `${couponApplied.valorDescuento}% de descuento`
                        : `S/ ${couponApplied.valorDescuento.toFixed(2)} de descuento`}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCouponApplied(null);
                    setCuponCode("");
                  }}
                  className="text-xs text-zinc-400 hover:text-zinc-700 font-bold cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Input
                  placeholder="Ingresa código"
                  value={cuponCode}
                  onChange={(e) => {
                    setCuponCode(e.target.value.toUpperCase());
                    setCuponError("");
                  }}
                  className="h-9 text-xs uppercase font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleValidateCupon}
                  disabled={!cuponCode.trim() || validatingCoupon}
                  className="h-9 text-xs cursor-pointer"
                >
                  {validatingCoupon ? "..." : "Validar"}
                </Button>
              </div>
            )}
            {cuponError && (
              <p className="text-[10px] text-red-500 font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" />
                {cuponError}
              </p>
            )}
          </div>

          <MetodoPagoSelector
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            totalNum={totalConDescuento}
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
