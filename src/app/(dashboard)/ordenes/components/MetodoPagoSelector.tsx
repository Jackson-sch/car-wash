import { Check, Coins, Smartphone, CreditCard, Landmark, HelpCircle, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { formatCurrency } from "@/lib/formats";
import type { PaymentMethod } from "./CobrarModal";

interface MetodoPagoSelectorProps {
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  totalNum: number;
  cashReceived: string;
  setCashReceived: (val: string) => void;
  quickCashOptions: number[];
  paymentReference: string;
  setPaymentReference: (val: string) => void;
  cashReceivedNum: number;
  change: number;
  disabled?: boolean;
}

// Métodos de pago con su respectivo diseño temático
const PAYMENT_METHODS = [
  {
    id: "efectivo" as PaymentMethod,
    label: "Efectivo",
    icon: Coins,
    colorClass:
      "border-emerald-200 bg-emerald-50/20 hover:bg-emerald-50/50 hover:border-emerald-400 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/5 dark:text-emerald-400 dark:hover:border-emerald-500/50",
    activeClass:
      "ring-1 ring-emerald-500 border-emerald-500 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 dark:bg-emerald-500/20",
  },
  {
    id: "yape" as PaymentMethod,
    label: "Yape",
    icon: Smartphone,
    colorClass:
      "border-purple-200 bg-purple-50/20 hover:bg-purple-50/50 hover:border-purple-400 text-purple-700 dark:border-purple-500/20 dark:bg-purple-500/5 dark:text-purple-400 dark:hover:border-purple-500/50",
    activeClass:
      "ring-1 ring-purple-500 border-purple-500 bg-purple-500/10 text-purple-800 dark:text-purple-300 dark:bg-purple-500/20",
  },
  {
    id: "plin" as PaymentMethod,
    label: "Plin",
    icon: Smartphone,
    colorClass:
      "border-cyan-200 bg-cyan-50/20 hover:bg-cyan-50/50 hover:border-cyan-400 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/5 dark:text-cyan-400 dark:hover:border-cyan-500/50",
    activeClass:
      "ring-1 ring-cyan-500 border-cyan-500 bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 dark:bg-cyan-500/20",
  },
  {
    id: "tarjeta" as PaymentMethod,
    label: "Tarjeta",
    icon: CreditCard,
    colorClass:
      "border-blue-200 bg-blue-50/20 hover:bg-blue-50/50 hover:border-blue-400 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/5 dark:text-blue-400 dark:hover:border-blue-500/50",
    activeClass:
      "ring-1 ring-blue-500 border-blue-500 bg-blue-500/10 text-blue-800 dark:text-blue-300 dark:bg-blue-500/20",
  },
  {
    id: "transferencia" as PaymentMethod,
    label: "Transferencia",
    icon: Landmark,
    colorClass:
      "border-amber-200 bg-amber-50/20 hover:bg-amber-50/50 hover:border-amber-400 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/5 dark:text-amber-400 dark:hover:border-amber-500/50",
    activeClass:
      "ring-1 ring-amber-500 border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300 dark:bg-amber-500/20",
  },
  {
    id: "otro" as PaymentMethod,
    label: "Otro",
    icon: HelpCircle,
    colorClass:
      "border-zinc-200 bg-zinc-50/20 hover:bg-zinc-50/50 hover:border-zinc-400 text-zinc-700 dark:border-zinc-650/20 dark:bg-zinc-650/5 dark:text-zinc-400 dark:hover:border-zinc-500",
    activeClass:
      "ring-1 ring-zinc-500 border-zinc-500 bg-zinc-500/10 text-zinc-800 dark:text-zinc-350 dark:bg-zinc-500/20",
  },
];

export function MetodoPagoSelector({
  paymentMethod,
  setPaymentMethod,
  totalNum,
  cashReceived,
  setCashReceived,
  quickCashOptions,
  paymentReference,
  setPaymentReference,
  cashReceivedNum,
  change,
  disabled = false,
}: MetodoPagoSelectorProps) {
  return (
    <>
      <div className="space-y-2.5">
        <span className="text-xs font-black uppercase text-zinc-500 tracking-wider">
          Método de Pago
        </span>
        <div className="grid grid-cols-3 gap-2">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon;
            const isSelected = paymentMethod === method.id;
            return (
              <button
                key={method.id}
                type="button"
                onClick={() => !disabled && setPaymentMethod(method.id)}
                disabled={disabled}
                className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-1.5 relative transition-colors transition-opacity duration-200 cursor-pointer ${
                  isSelected ? method.activeClass : method.colorClass
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <Icon className="size-5 animate-none" />
                <span className="text-[10px] font-bold">
                  {method.label}
                </span>
                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-card border border-current flex items-center justify-center text-[8px] font-bold shadow-sm">
                    <Check className="size-2 text-current" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 min-h-[110px] flex flex-col justify-end">
        {paymentMethod === "efectivo" ? (
          <div className="space-y-3 transition-opacity duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label
                htmlFor="montoRecibido"
                className="text-xs font-bold text-zinc-600"
              >
                Monto Recibido *
              </label>

              {/* Botones de Denominación Rápida */}
              <div className="flex flex-wrap gap-1">
                {quickCashOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCashReceived(opt.toFixed(2))}
                    disabled={disabled}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      cashReceivedNum === opt
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {opt === totalNum ? "Exacto" : `S/ ${opt}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <InputGroup className="pl-2 bg-card border-zinc-200 focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-xs font-bold h-9 rounded-lg">
                <InputGroupAddon>
                  <InputGroupText>S/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="montoRecibido"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  disabled={disabled}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>PEN</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Caja del Vuelto en Tiempo Real */}
            {cashReceived.trim() !== "" && (
              <div className="mt-2">
                {change >= 0 ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                      Vuelto a Entregar
                    </span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(change)}
                    </span>
                  </div>
                ) : (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center justify-between shadow-sm">
                    <span className="text-[10px] font-bold text-rose-800 dark:text-rose-450 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle className="size-3.5" /> Monto Insuficiente
                    </span>
                    <span className="text-base font-black text-rose-600 dark:text-rose-400">
                      Falta {formatCurrency(Math.abs(change))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2 transition-opacity duration-300">
            <label
              htmlFor="referencia"
              className="text-xs font-bold text-zinc-650"
            >
              Número de Referencia / Operación
            </label>
            <Input
              id="referencia"
              placeholder="Ej. 123456"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              disabled={disabled}
              className={`bg-card border-zinc-200 text-xs h-9 rounded-lg transition-colors focus-visible:ring-1 ${
                paymentMethod === "yape"
                  ? "focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                  : paymentMethod === "plin"
                    ? "focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                    : paymentMethod === "tarjeta"
                      ? "focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                      : paymentMethod === "transferencia"
                        ? "focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                        : "focus-visible:border-secondary focus-visible:ring-secondary/20"
              }`}
            />
            <p className="text-[9px] text-zinc-400">
              Opcional. Código útil para validación de transacciones y
              auditoría.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
