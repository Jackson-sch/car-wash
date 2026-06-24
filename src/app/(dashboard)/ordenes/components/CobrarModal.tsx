"use client";

import { useState, useEffect, useTransition } from "react";
import { X, Receipt, Tag, CheckCircle2, AlertCircle, Unlock, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { abrirTurnoCaja } from "@/lib/actions/caja";
import { CobroResumen } from "./CobroResumen";
import { MetodoPagoSelector } from "./MetodoPagoSelector";
import { validarCupon } from "@/lib/actions/cupones";
import { formatCurrency } from "@/lib/formats";
import { getClientePuntosByOrdenId } from "@/lib/actions/clientes";

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
  onConfirm: (
    metodo: PaymentMethod,
    referencia: string,
    monto: string,
    cuponId?: string,
    puntosACanjear?: number
  ) => Promise<void>;
  cajaAbierta: boolean;
  onOpenCajaSuccess: () => void;
}

export function CobrarModal({
  isOpen,
  onClose,
  orden,
  isPending,
  onConfirm,
  cajaAbierta,
  onOpenCajaSuccess,
}: CobrarModalProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("efectivo");
  const [paymentReference, setPaymentReference] = useState("");
  const [cashReceived, setCashReceived] = useState("");

  const [cuponCode, setCuponCode] = useState("");
  const [cuponError, setCuponError] = useState("");
  const [couponApplied, setCouponApplied] = useState<CouponApplied | null>(null);
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
  const [canjearPuntos, setCanjearPuntos] = useState(false);
  const [puntosACanjear, setPuntosACanjear] = useState("0");

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
    setPaymentReference("");
    setCashReceived("");
    setCuponCode("");
    setCuponError("");
    setCouponApplied(null);
    setCanjearPuntos(false);
    setPuntosACanjear("0");
  }, [paymentMethod, isOpen]);

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
        window.dispatchEvent(new Event("caja-status-changed"));
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
          onSubmit={cajaAbierta ? handleSubmit : handleQuickOpenCaja}
          className="p-5 space-y-5 flex-1 overflow-y-auto max-h-[80vh]"
        >
          <CobroResumen
            orden={orden}
            totalNum={totalNum}
            descuentoCoupon={descuentoCoupon}
            descuentoPuntos={descuentoPuntos}
          />

          {!cajaAbierta ? (
            // Formulario de Apertura Rápida de Caja
            <div className="space-y-4 border border-red-500/20 bg-red-500/5 p-4.5 rounded-2xl text-left animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500 animate-pulse" />
                <div className="text-[11px] space-y-1">
                  <h4 className="font-extrabold leading-none">Apertura de Caja Requerida</h4>
                  <p className="font-semibold opacity-90 leading-normal text-zinc-600 dark:text-zinc-400">
                    La caja se encuentra cerrada. Registre el fondo inicial para abrir la caja y continuar con el cobro del ticket.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/40">
                <label htmlFor="aperturaCajaModal" className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                  Fondo Inicial de Caja (S/) *
                </label>
                <Input
                  id="aperturaCajaModal"
                  type="number"
                  step="0.10"
                  value={montoApertura}
                  onChange={(e) => setMontoApertura(e.target.value)}
                  className="bg-card border-zinc-300 focus:border-secondary text-center font-bold text-base h-10 rounded-lg text-secondary"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  disabled={isOpeningCaja}
                  className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 px-5 rounded-xl shadow-md cursor-pointer flex items-center gap-1.5 active:scale-95"
                >
                  <Unlock className="h-4 w-4" />
                  {isOpeningCaja ? "Abriendo..." : "Abrir Caja"}
                </Button>
              </div>
            </div>
          ) : (
            // Formulario normal de Cobro
            <>
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

              {/* Sección de Fidelización y Puntos */}
              {clienteFidelidad && clienteFidelidad.totalPuntos > 0 && (
                <div className="space-y-3 p-3.5 rounded-2xl border border-amber-200/50 bg-amber-500/5 dark:bg-amber-950/10 dark:border-amber-900/30 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <Gift className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-foreground block leading-tight">
                          Puntos de Fidelidad
                        </span>
                        <span className="text-[9px] text-muted-foreground font-medium">
                          {clienteFidelidad.nombre} tiene {clienteFidelidad.totalPuntos} puntos (S/ {(clienteFidelidad.totalPuntos * 0.20).toFixed(2)})
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        const nextState = !canjearPuntos;
                        setCanjearPuntos(nextState);
                        if (nextState) {
                          // Calcular el máximo de puntos útiles
                          const maxPts = Math.min(
                            clienteFidelidad.totalPuntos,
                            Math.floor((totalNum - descuentoCoupon) / 0.20)
                          );
                          setPuntosACanjear(String(maxPts));
                        } else {
                          setPuntosACanjear("0");
                        }
                      }}
                      className={`text-[9px] font-extrabold px-2.5 py-1 rounded-lg border cursor-pointer transition-all active:scale-95 uppercase tracking-wider ${
                        canjearPuntos
                          ? "border-amber-500 text-amber-500 bg-amber-500/15"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {canjearPuntos ? "Aplicado" : "Canjear"}
                    </button>
                  </div>

                  {canjearPuntos && (
                    <div className="space-y-2 pt-2 border-t border-border/50 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                        <span>Puntos a canjear:</span>
                        <span className="text-secondary font-extrabold">
                          - S/ {((parseInt(puntosACanjear) || 0) * 0.20).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="1"
                          max={Math.min(
                            clienteFidelidad.totalPuntos,
                            Math.floor((totalNum - descuentoCoupon) / 0.20)
                          )}
                          value={puntosACanjear}
                          onChange={(e) => setPuntosACanjear(e.target.value)}
                          className="flex-1 accent-secondary h-1.5 rounded-lg bg-border cursor-pointer"
                        />
                        <span className="text-xs font-black text-foreground shrink-0 w-8 text-center bg-card border border-border py-0.5 rounded-md font-mono">
                          {puntosACanjear}
                        </span>
                      </div>
                      <p className="text-[9px] text-muted-foreground font-medium">
                        * Regla: 1 punto equivale a S/ 0.20 de descuento en caja.
                      </p>
                    </div>
                  )}
                </div>
              )}

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
                      ? "border border-zinc-200 cursor-not-allowed opacity-50 bg-muted text-muted-foreground"
                      : "bg-secondary text-white hover:bg-secondary/80"
                  }`}
                >
                  {isPending ? "Procesando..." : "Confirmar Cobro"}
                </Button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
