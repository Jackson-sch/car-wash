import { Check, Coins, Smartphone, CreditCard, Landmark, HelpCircle, AlertCircle, Copy, QrCode } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { formatCurrency } from "@/lib/formats";
import { toast } from "sonner";
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
  sucursal?: {
    id?: string;
    nombre?: string;
    telefono?: string | null;
    config?: unknown;
  } | null;
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
      "border-border bg-muted/20 hover:bg-muted/50 hover:border-border text-foreground dark:border-border dark:bg-muted/10 dark:text-foreground dark:hover:border-border",
    activeClass:
      "ring-1 ring-border border-border bg-muted text-foreground dark:text-foreground dark:bg-muted",
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
  sucursal,
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
                className="text-xs font-bold text-foreground"
              >
                Monto Recibido *
              </label>

              {/* Botones de Denominación Rápida */}
              <div className="flex flex-wrap gap-1.5">
                {quickCashOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setCashReceived(opt.toFixed(2))}
                    disabled={disabled}
                    className={`text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors transition-transform cursor-pointer active:scale-95 ${
                      cashReceivedNum === opt
                        ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                        : "bg-muted/50 border-border text-foreground hover:bg-muted"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    {opt === totalNum ? "Exacto" : `S/ ${opt}`}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <InputGroup className="pl-3 bg-card border-border focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500 text-sm font-black h-10 rounded-xl text-foreground">
                <InputGroupAddon>
                  <InputGroupText className="font-bold text-muted-foreground">S/</InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="montoRecibido"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  disabled={disabled}
                  className="font-black text-sm"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText className="text-xs font-semibold text-muted-foreground">PEN</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Caja del Vuelto en Tiempo Real */}
            {cashReceived.trim() !== "" && (
              <div className="mt-2">
                {change >= 0 ? (
                  <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center justify-between shadow-xs">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                      Vuelto a Entregar
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {formatCurrency(change)}
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/30 rounded-xl flex items-center justify-between shadow-xs">
                    <span className="text-xs font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="size-4 shrink-0" /> Monto Insuficiente
                    </span>
                    <span className="text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400">
                      Falta {formatCurrency(Math.abs(change))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : paymentMethod === "yape" || paymentMethod === "plin" ? (
          <div className="space-y-3 transition-opacity duration-300">
            {/* Banner Yape / Plin */}
            <div
              className={`p-3.5 rounded-xl border ${
                paymentMethod === "yape"
                  ? "bg-purple-500/10 border-purple-500/30 text-purple-950 dark:text-purple-200"
                  : "bg-cyan-500/10 border-cyan-500/30 text-cyan-950 dark:text-cyan-200"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-black uppercase px-2 py-0.5 rounded-md text-white ${
                      paymentMethod === "yape" ? "bg-purple-600" : "bg-cyan-600"
                    }`}
                  >
                    {paymentMethod === "yape" ? "Yape" : "Plin"}
                  </span>
                  <span className="text-xs font-bold text-foreground">
                    {sucursal?.telefono || "Teléfono no configurado"}
                  </span>
                </div>

                {sucursal?.telefono && (
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(sucursal.telefono || "");
                      toast.success(`Número copiado: ${sucursal.telefono}`);
                    }}
                    className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground cursor-pointer px-2 py-0.5 rounded hover:bg-muted/50 transition-colors"
                  >
                    <Copy className="size-3" />
                    <span>Copiar</span>
                  </button>
                )}
              </div>

              <div className="mt-2.5 pt-2 border-t border-border/40 flex items-center justify-between">
                <span className="text-[11px] font-medium text-muted-foreground">
                  Monto a recibir:
                </span>
                <span
                  className={`text-base font-black font-heading tracking-tight ${
                    paymentMethod === "yape"
                      ? "text-purple-600 dark:text-purple-400"
                      : "text-cyan-600 dark:text-cyan-400"
                  }`}
                >
                  {formatCurrency(totalNum)}
                </span>
              </div>
            </div>

            {/* Input para Código de Operación */}
            <div className="space-y-1">
              <label
                htmlFor="referencia"
                className="text-xs font-bold text-foreground flex items-center justify-between"
              >
                <span>Código de Aprobación / Operación</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Últimos dígitos o N° comprobante
                </span>
              </label>
              <Input
                id="referencia"
                placeholder="Ej. 748291"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                disabled={disabled}
                className={`bg-card border-border text-xs h-9 rounded-lg transition-colors focus-visible:ring-1 ${
                  paymentMethod === "yape"
                    ? "focus-visible:border-purple-500 focus-visible:ring-purple-500/20"
                    : "focus-visible:border-cyan-500 focus-visible:ring-cyan-500/20"
                }`}
              />
              <p className="text-[10px] text-muted-foreground">
                Verifica la notificación de pago en la app antes de liberar el vehículo.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 transition-opacity duration-300">
            <label
              htmlFor="referencia"
              className="text-xs font-bold text-foreground"
            >
              Número de Referencia / Operación
            </label>
            <Input
              id="referencia"
              placeholder="Ej. 123456"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              disabled={disabled}
              className={`bg-card border-border text-xs h-9 rounded-lg transition-colors focus-visible:ring-1 ${
                paymentMethod === "tarjeta"
                  ? "focus-visible:border-blue-500 focus-visible:ring-blue-500/20"
                  : paymentMethod === "transferencia"
                    ? "focus-visible:border-amber-500 focus-visible:ring-amber-500/20"
                    : "focus-visible:border-secondary focus-visible:ring-secondary/20"
              }`}
            />
            <p className="text-[9px] text-muted-foreground">
              Opcional. Código útil para validación de transacciones y auditoría.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
