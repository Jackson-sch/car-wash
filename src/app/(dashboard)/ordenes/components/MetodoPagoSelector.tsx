"use client";

import {
  Check,
  Coins,
  Smartphone,
  CreditCard,
  Landmark,
  HelpCircle,
  AlertCircle,
  Copy,
  Banknote,
} from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
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

const PAYMENT_METHODS = [
  {
    id: "efectivo" as PaymentMethod,
    label: "Efectivo",
    shortcut: "1",
    icon: Banknote,
    colorClass:
      "border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/50 text-emerald-600 dark:text-emerald-400",
    activeClass:
      "border-emerald-500 bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/40 shadow-sm",
  },
  {
    id: "yape" as PaymentMethod,
    label: "Yape",
    shortcut: "2",
    icon: Smartphone,
    colorClass:
      "border-purple-500/25 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50 text-purple-600 dark:text-purple-400",
    activeClass:
      "border-purple-500 bg-purple-500/20 text-purple-700 dark:text-purple-300 ring-2 ring-purple-500/40 shadow-sm",
  },
  {
    id: "plin" as PaymentMethod,
    label: "Plin",
    shortcut: "3",
    icon: Smartphone,
    colorClass:
      "border-cyan-500/25 bg-cyan-500/5 hover:bg-cyan-500/10 hover:border-cyan-500/50 text-cyan-600 dark:text-cyan-400",
    activeClass:
      "border-cyan-500 bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 ring-2 ring-cyan-500/40 shadow-sm",
  },
  {
    id: "tarjeta" as PaymentMethod,
    label: "Tarjeta",
    shortcut: "4",
    icon: CreditCard,
    colorClass:
      "border-sky-500/25 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-500/50 text-sky-600 dark:text-sky-400",
    activeClass:
      "border-sky-500 bg-sky-500/20 text-sky-700 dark:text-sky-300 ring-2 ring-sky-500/40 shadow-sm",
  },
  {
    id: "transferencia" as PaymentMethod,
    label: "Transfer",
    shortcut: "5",
    icon: Landmark,
    colorClass:
      "border-amber-500/25 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-500/50 text-amber-600 dark:text-amber-400",
    activeClass:
      "border-amber-500 bg-amber-500/20 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/40 shadow-sm",
  },
  {
    id: "otro" as PaymentMethod,
    label: "Otro",
    shortcut: "6",
    icon: HelpCircle,
    colorClass:
      "border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground",
    activeClass:
      "border-foreground/40 bg-muted text-foreground ring-2 ring-foreground/20 shadow-sm",
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
    <div className="space-y-4">
      {/* Selector de Métodos de Pago */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-wider">
            Método de Pago
          </span>
          <span className="text-[10px] text-muted-foreground/80 font-mono">
            Atajos: 1-6
          </span>
        </div>

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
                className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                  isSelected ? method.activeClass : method.colorClass
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {/* Hotkey tag */}
                <kbd className="absolute top-1.5 left-1.5 px-1.5 py-0.2 rounded bg-black/30 dark:bg-black/50 font-mono text-[9px] font-black text-muted-foreground">
                  {method.shortcut}
                </kbd>

                <Icon className="size-5 shrink-0" />
                <span className="text-xs font-black tracking-tight leading-tight">
                  {method.label}
                </span>

                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 size-4 rounded-full bg-foreground text-background flex items-center justify-center text-[9px] font-black shadow-xs">
                    <Check className="size-2.5 stroke-[3]" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Panel Dinámico según Método de Pago */}
      <div className="pt-2">
        {paymentMethod === "efectivo" ? (
          <div className="space-y-3.5">
            {/* Monto Recibido y Botones de Billetes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="montoRecibido"
                  className="text-xs font-black text-foreground flex items-center gap-1.5"
                >
                  <Coins className="size-3.5 text-secondary" />
                  <span>Monto Recibido</span>
                </label>
                <span className="text-[10px] text-muted-foreground font-mono">
                  Tecla: E para Exacto
                </span>
              </div>

              {/* Fila de Billetes Rápidos */}
              <div className="grid grid-cols-5 gap-1.5">
                {quickCashOptions.map((opt) => {
                  const isExact = opt === totalNum;
                  const isSelected = cashReceivedNum === opt;
                  return (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setCashReceived(opt.toFixed(2))}
                      disabled={disabled}
                      className={`text-xs font-extrabold py-1.5 px-1 rounded-xl border transition-all cursor-pointer active:scale-95 text-center truncate ${
                        isSelected
                          ? "bg-secondary text-slate-950 border-secondary font-black shadow-xs"
                          : isExact
                          ? "bg-secondary/15 border-secondary/40 text-secondary hover:bg-secondary/25"
                          : "bg-card border-border text-foreground hover:bg-muted"
                      } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      {isExact ? "Exacto" : `S/ ${opt}`}
                    </button>
                  );
                })}
              </div>

              {/* Input grande con máscara monetaria */}
              <InputGroup className="bg-card border-border/90 focus-visible:ring-secondary/20 focus-visible:border-secondary h-11 rounded-xl text-foreground font-mono font-black text-base shadow-xs">
                <InputGroupAddon>
                  <InputGroupText className="font-black text-muted-foreground text-sm">
                    S/
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="montoRecibido"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={cashReceived}
                  onChange={(e) => setCashReceived(e.target.value)}
                  disabled={disabled}
                  className="font-black text-base placeholder:text-muted-foreground/60"
                  autoFocus
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText className="text-[11px] font-extrabold text-muted-foreground">
                    PEN
                  </InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </div>

            {/* Display Dinámico del Vuelto */}
            {cashReceived.trim() !== "" && (
              <div>
                {change >= 0 ? (
                  <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/35 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Banknote className="size-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
                          Vuelto a Entregar
                        </span>
                        <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                          Devolver al cliente
                        </span>
                      </div>
                    </div>
                    <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                      {formatCurrency(change)}
                    </span>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-500/15 border border-rose-500/35 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-xl bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <AlertCircle className="size-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
                          Monto Insuficiente
                        </span>
                        <span className="text-xs text-rose-600/80 dark:text-rose-400/80 font-medium">
                          Falta dinero por cubrir
                        </span>
                      </div>
                    </div>
                    <span className="text-xl font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight">
                      Falta {formatCurrency(Math.abs(change))}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : paymentMethod === "yape" || paymentMethod === "plin" ? (
          <div className="space-y-3.5">
            {/* Banner Yape / Plin */}
            <div
              className={`p-4 rounded-2xl border ${
                paymentMethod === "yape"
                  ? "bg-purple-500/10 border-purple-500/30"
                  : "bg-cyan-500/10 border-cyan-500/30"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-lg text-white ${
                      paymentMethod === "yape" ? "bg-purple-600 shadow-xs" : "bg-cyan-600 shadow-xs"
                    }`}
                  >
                    {paymentMethod === "yape" ? "Yape" : "Plin"}
                  </span>
                  <span className="text-xs font-black text-foreground">
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
                    className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer px-2.5 py-1 rounded-lg bg-card/60 hover:bg-muted border border-border/60 transition-colors"
                  >
                    <Copy className="size-3" />
                    <span>Copiar</span>
                  </button>
                )}
              </div>

              <div className="mt-3 pt-2.5 border-t border-border/40 flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">
                  Monto a Transferir:
                </span>
                <span
                  className={`text-lg font-black font-mono tracking-tight ${
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
            <div className="space-y-1.5">
              <label
                htmlFor="referencia"
                className="text-xs font-black text-foreground flex items-center justify-between"
              >
                <span>N° de Operación / Aprobación</span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  Últimos 4 o 6 dígitos
                </span>
              </label>
              <Input
                id="referencia"
                placeholder="Ej. 748291"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                disabled={disabled}
                className="bg-card border-border text-xs h-10 rounded-xl font-mono font-bold"
              />
              <p className="text-[10px] text-muted-foreground">
                Verifica la confirmación de la transferencia antes de liberar el comprobante.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            <label
              htmlFor="referencia"
              className="text-xs font-black text-foreground flex items-center justify-between"
            >
              <span>Número de Referencia / Comprobante POS</span>
              <span className="text-[10px] text-muted-foreground font-normal">
                Opcional
              </span>
            </label>
            <Input
              id="referencia"
              placeholder="Ej. OP-904820"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              disabled={disabled}
              className="bg-card border-border text-xs h-10 rounded-xl font-mono font-bold"
            />
            <p className="text-[10px] text-muted-foreground">
              Ingresa el número de lote o código de autorización del voucher impreso.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
