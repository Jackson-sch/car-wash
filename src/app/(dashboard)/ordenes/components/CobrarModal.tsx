"use client";

import { useState, useEffect, useTransition, useReducer } from "react";
import { X, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { abrirTurnoCaja } from "@/lib/actions/caja";
import { CobroResumen } from "./CobroResumen";
import { MetodoPagoSelector } from "./MetodoPagoSelector";
import { CouponSection } from "./CouponSection";
import { LoyaltySection } from "./LoyaltySection";
import { CajaCerradaBanner } from "./CajaCerradaBanner";
import { validarCupon } from "@/lib/actions/cupones";
import { formatCurrency } from "@/lib/formats";
import { getClientePuntosByOrdenId } from "@/lib/actions/clientes";
import { notifyCajaStatusChanged } from "@/lib/events/caja-events";

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
  clienteTelefono?: string | null;
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

// --- Types para useReducer del formulario ---
interface CobroFormState {
  paymentMethod: PaymentMethod;
  paymentReference: string;
  cashReceived: string;
  cuponCode: string;
  cuponError: string;
  couponApplied: CouponApplied | null;
  canjearPuntos: boolean;
  puntosACanjear: string;
}

type CobroFormAction =
  | { type: "SET_PAYMENT_METHOD"; method: PaymentMethod }
  | { type: "SET_PAYMENT_REFERENCE"; reference: string }
  | { type: "SET_CASH_RECEIVED"; received: string }
  | { type: "SET_CUPON_CODE"; code: string }
  | { type: "SET_CUPON_ERROR"; error: string }
  | { type: "SET_COUPON_APPLIED"; coupon: CouponApplied | null }
  | { type: "SET_CANJEAR_PUNTOS"; canjear: boolean }
  | { type: "SET_PUNTOS_A_CANJEAR"; puntos: string }
  | { type: "RESET_FORM" };

interface CobrarModalProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenResumen;
  isPending: boolean;
  onConfirm: (
    metodo: PaymentMethod,
    referencia: string,
    monto: string,
    cuponId?: string,
    puntosACanjear?: number
  ) => Promise<void>;
  cajaAbierta: boolean;
  onOpenCajaSuccess: () => void;
  sucursal?: {
    id: string;
    nombre: string;
    telefono?: string | null;
    config?: unknown;
  } | null;
}

const COBRO_FORM_INITIAL: CobroFormState = {
  paymentMethod: "efectivo",
  paymentReference: "",
  cashReceived: "",
  cuponCode: "",
  cuponError: "",
  couponApplied: null,
  canjearPuntos: false,
  puntosACanjear: "0",
};

function cobroFormReducer(
  state: CobroFormState,
  action: CobroFormAction
): CobroFormState {
  switch (action.type) {
    case "SET_PAYMENT_METHOD":
      return {
        ...COBRO_FORM_INITIAL,
        paymentMethod: action.method,
      };
    case "SET_PAYMENT_REFERENCE":
      return { ...state, paymentReference: action.reference };
    case "SET_CASH_RECEIVED":
      return { ...state, cashReceived: action.received };
    case "SET_CUPON_CODE":
      return { ...state, cuponCode: action.code };
    case "SET_CUPON_ERROR":
      return { ...state, cuponError: action.error };
    case "SET_COUPON_APPLIED":
      return { ...state, couponApplied: action.coupon };
    case "SET_CANJEAR_PUNTOS":
      return { ...state, canjearPuntos: action.canjear };
    case "SET_PUNTOS_A_CANJEAR":
      return { ...state, puntosACanjear: action.puntos };
    case "RESET_FORM":
      return { ...COBRO_FORM_INITIAL };
    default:
      return state;
  }
}

export function CobrarModal({
  isOpen,
  onClose,
  orden,
  isPending,
  onConfirm,
  cajaAbierta,
  onOpenCajaSuccess,
  sucursal,
}: CobrarModalProps) {
  const [validatingCoupon, startValidateTransition] = useTransition();
  const [montoApertura, setMontoApertura] = useState("250.00");
  const [isOpeningCaja, setIsOpeningCaja] = useState(false);

  // Estados para fidelización de clientes (puntos)
  const [clienteFidelidad, setClienteFidelidad] = useState<{
    clienteId: string;
    nombre: string;
    apellido: string | null;
    totalPuntos: number;
  } | null>(null);

  const [formState, dispatchForm] = useReducer(
    cobroFormReducer,
    COBRO_FORM_INITIAL
  );

  const {
    paymentMethod,
    paymentReference,
    cashReceived,
    cuponCode,
    cuponError,
    couponApplied,
    canjearPuntos,
    puntosACanjear,
  } = formState;

  // Manejar cambio de método de pago + resetear formulario en un solo paso
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    dispatchForm({ type: "SET_PAYMENT_METHOD", method });
  };

  useEffect(() => {
    if (isOpen && orden.id) {
      getClientePuntosByOrdenId(orden.id).then((res) => {
        if (res) {
          setClienteFidelidad(res);
        } else {
          setClienteFidelidad(null);
        }
      });
    }
  }, [isOpen, orden.id]);

  useEffect(() => {
    // Resetear formulario al abrir el modal
    dispatchForm({ type: "RESET_FORM" });
  }, [isOpen]);

  if (!isOpen) return null;

  const totalNum = parseFloat(orden.total || "0");
  const descuentoCoupon = couponApplied?.descuentoCalculado || 0;
  const descuentoPuntos = canjearPuntos ? (parseInt(puntosACanjear) || 0) * 0.20 : 0;
  const totalConDescuento = Math.max(0, totalNum - descuentoCoupon - descuentoPuntos);
  const cashReceivedNum = parseFloat(cashReceived) || 0;
  const change = cashReceivedNum - totalConDescuento;
  const isCashInsufficient =
    paymentMethod === "efectivo" && cashReceived.trim() !== "" && change < 0;

  const handleValidateCupon = () => {
    const code = cuponCode.trim();
    if (!code) return;

    startValidateTransition(async () => {
      dispatchForm({ type: "SET_CUPON_ERROR", error: "" });
      dispatchForm({ type: "SET_COUPON_APPLIED", coupon: null });

      const result = await validarCupon(code, orden.id);
      if (!result.success) {
        dispatchForm({ type: "SET_CUPON_ERROR", error: result.error || "Cupón inválido" });
        return;
      }

      let descuento = 0;
      if (result.tipoDescuento === "porcentaje") {
        descuento = (totalNum * result.valorDescuento) / 100;
        if (result.compraMinima && totalNum < result.compraMinima) {
          dispatchForm({ type: "SET_CUPON_ERROR", error: `Compra mínima de ${formatCurrency(result.compraMinima)} no alcanzada.` });
          return;
        }
      } else {
        descuento = result.valorDescuento;
        if (result.compraMinima && totalNum < result.compraMinima) {
          dispatchForm({ type: "SET_CUPON_ERROR", error: `Compra mínima de ${formatCurrency(result.compraMinima)} no alcanzada.` });
          return;
        }
      }

      dispatchForm({ type: "SET_COUPON_APPLIED", coupon: {
        cuponId: result.cuponId,
        tipoDescuento: result.tipoDescuento,
        valorDescuento: result.valorDescuento,
        descuentoCalculado: descuento,
      } });
    });
  };

  const handleQuickOpenCaja = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoApertura.trim() || parseFloat(montoApertura) < 0) {
      toast.error("Monto inicial no válido");
      return;
    }
    
    setIsOpeningCaja(true);
    try {
      const res = await abrirTurnoCaja(montoApertura);
      if (res.success) {
        toast.success("Caja abierta con éxito. Ahora puede registrar el cobro.");
        notifyCajaStatusChanged();
        onOpenCajaSuccess();
      } else {
        toast.error(res.error || "Ocurrió un error al abrir la caja");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error al abrir la caja");
    } finally {
      setIsOpeningCaja(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isCashInsufficient) return;
    const pts = canjearPuntos ? (parseInt(puntosACanjear) || 0) : 0;
    await onConfirm(
      paymentMethod,
      paymentReference,
      totalConDescuento.toFixed(2),
      couponApplied?.cuponId,
      pts
    );
    notifyCajaStatusChanged();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md transition-opacity duration-200 p-3 sm:p-4 md:p-6">
      <div className="bg-card border border-border w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl transition-all duration-200 text-foreground flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-secondary/10 text-secondary shadow-xs border border-secondary/20">
              <Receipt className="size-5 text-secondary" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground tracking-tight">
                Registrar Cobro
              </h3>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider mt-0.5">
                Ticket: {orden.nroTicket || "S/N"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={cajaAbierta ? handleSubmit : handleQuickOpenCaja}
          className="flex flex-col flex-1 min-h-0 overflow-hidden"
        >
          {!cajaAbierta ? (
            <div className="p-6 overflow-y-auto max-w-md mx-auto w-full">
              <CajaCerradaBanner
                montoApertura={montoApertura}
                setMontoApertura={setMontoApertura}
                isOpeningCaja={isOpeningCaja}
                onClose={onClose}
              />
            </div>
          ) : (
            <>
              {/* 2-Column Responsive Body */}
              <div className="p-4 sm:p-6 overflow-y-auto flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 items-start">
                  {/* Columna Izquierda: Resumen de Orden, Cupón y Fidelidad */}
                  <div className="space-y-4">
                    <CobroResumen
                      orden={orden}
                      totalNum={totalNum}
                      descuentoCoupon={descuentoCoupon}
                      descuentoPuntos={descuentoPuntos}
                    />

                    <CouponSection
                      cuponCode={cuponCode}
                      setCuponCode={(code: string) => dispatchForm({ type: "SET_CUPON_CODE", code })}
                      cuponError={cuponError}
                      setCuponError={(error: string) => dispatchForm({ type: "SET_CUPON_ERROR", error })}
                      couponApplied={couponApplied}
                      setCouponApplied={(coupon: CouponApplied | null) => dispatchForm({ type: "SET_COUPON_APPLIED", coupon })}
                      onValidate={handleValidateCupon}
                      validatingCoupon={validatingCoupon}
                    />

                    {clienteFidelidad && clienteFidelidad.totalPuntos > 0 && (
                      <LoyaltySection
                        clienteFidelidad={clienteFidelidad}
                        canjearPuntos={canjearPuntos}
                        setCanjearPuntos={(v: boolean) => dispatchForm({ type: "SET_CANJEAR_PUNTOS", canjear: v })}
                        puntosACanjear={puntosACanjear}
                        setPuntosACanjear={(v: string) => dispatchForm({ type: "SET_PUNTOS_A_CANJEAR", puntos: v })}
                        totalNum={totalNum}
                        descuentoCoupon={descuentoCoupon}
                      />
                    )}
                  </div>

                  {/* Columna Derecha: Método de Pago, Denominaciones y Vuelto */}
                  <div className="space-y-4 bg-muted/20 p-4 sm:p-5 rounded-2xl border border-border/70">
                    <MetodoPagoSelector
                      paymentMethod={paymentMethod}
                      setPaymentMethod={handlePaymentMethodChange}
                      totalNum={totalConDescuento}
                      cashReceived={cashReceived}
                      setCashReceived={(v: string) => dispatchForm({ type: "SET_CASH_RECEIVED", received: v })}
                      quickCashOptions={quickCashOptions}
                      paymentReference={paymentReference}
                      setPaymentReference={(v: string) => dispatchForm({ type: "SET_PAYMENT_REFERENCE", reference: v })}
                      cashReceivedNum={cashReceivedNum}
                      change={change}
                      sucursal={sucursal}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions Footer - Siempre Visible y Fijo */}
              <div className="p-4 sm:px-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/30 shrink-0">
                {/* Resumen rápido para el cajero */}
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                      Total a Cobrar
                    </span>
                    <span className="text-base sm:text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(totalConDescuento)}
                    </span>
                  </div>
                  {paymentMethod === "efectivo" && cashReceived.trim() !== "" && change >= 0 && (
                    <div className="border-l border-border pl-4">
                      <span className="text-muted-foreground text-[10px] uppercase font-bold tracking-wider block">
                        Vuelto a Dar
                      </span>
                      <span className="text-base sm:text-lg font-black font-mono text-emerald-500">
                        {formatCurrency(change)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="text-xs font-bold text-muted-foreground hover:text-foreground h-10 px-4 rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending || isCashInsufficient}
                    className={`font-black text-xs sm:text-sm h-10 px-6 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 transition-all active:scale-95 ${
                      isCashInsufficient
                        ? "border border-border cursor-not-allowed opacity-50 bg-muted text-muted-foreground"
                        : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-950/20"
                    }`}
                  >
                    {isPending ? "Procesando..." : "Confirmar Cobro"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
