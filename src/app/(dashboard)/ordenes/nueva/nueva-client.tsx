"use client";

import { ClipboardList, ArrowRight, ArrowLeft, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepperHeader } from "./components/StepperHeader";
import { PasoVehiculoCliente } from "./components/PasoVehiculoCliente";
import { PasoServiciosCosto } from "./components/PasoServiciosCosto";
import { PasoOperacionNotas } from "./components/PasoOperacionNotas";
import { SuccessDialog } from "./components/SuccessDialog";
import { useNuevaOrden, type Servicio, type Lavador } from "./hooks/useNuevaOrden";

interface NuevaOrdenClientProps {
  servicios: Servicio[];
  lavadores: Lavador[];
  sucursalConfig?: { multipliers?: Record<string, number> };
  cajaAbierta: boolean;
}

const DEFAULT_CONFIG = {};

export function NuevaOrdenClient({
  servicios,
  lavadores,
  sucursalConfig = DEFAULT_CONFIG,
  cajaAbierta,
}: NuevaOrdenClientProps) {
  const router = useRouter();
  const o = useNuevaOrden({ servicios, sucursalConfig, cajaAbierta });

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
            <ClipboardList className="h-7 w-7 text-secondary" />
            Nueva Orden de Servicio
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Completa los datos secuenciales para dar de alta una orden en el sistema.
          </p>
        </div>
        <div>
          <Link href="/ordenes" passHref>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-bold h-9 gap-1.5 cursor-pointer"
            >
              <X className="size-4" />
              Cancelar
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerta de Caja Cerrada */}
      {!cajaAbierta && (
        <div className="flex items-start gap-3.5 p-4.5 bg-red-500/10 dark:bg-red-500/5 border border-red-500/20 rounded-2xl text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-red-500 animate-pulse" />
          <div className="text-xs space-y-1.5">
            <h4 className="font-black text-sm leading-none flex items-center gap-1.5">
              Control de Caja Requerido
            </h4>
            <p className="font-semibold text-zinc-600 dark:text-zinc-400 leading-normal">
              No es posible registrar nuevas órdenes de servicio en este momento porque el turno de caja de la sucursal se encuentra cerrado. Para habilitar el registro, debe realizar la apertura correspondiente.
            </p>
            <div className="pt-1">
              <Link href="/caja" passHref>
                <Button size="sm" variant="destructive" className="font-bold text-[10px] uppercase tracking-wider h-7 px-3.5 rounded-lg cursor-pointer bg-red-600 hover:bg-red-700 text-white shadow-xs border-0">
                  Ir a Apertura de Caja
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Stepper Progress */}
      <StepperHeader step={o.step} />

      {/* Form Content */}
      <div className="space-y-6">
        {o.step === 1 && (
          <PasoVehiculoCliente
            placa={o.placa}
            setPlaca={o.setPlaca}
            vehiculoTipo={o.vehiculoTipo}
            setVehiculoTipo={o.setVehiculoTipo}
            vehiculoMarca={o.vehiculoMarca}
            setVehiculoMarca={o.setVehiculoMarca}
            vehiculoModelo={o.vehiculoModelo}
            setVehiculoModelo={o.setVehiculoModelo}
            vehiculoColor={o.vehiculoColor}
            setVehiculoColor={o.setVehiculoColor}
            clienteNombre={o.clienteNombre}
            setClienteNombre={o.setClienteNombre}
            clienteApellido={o.clienteApellido}
            setClienteApellido={o.setClienteApellido}
            clienteTelefono={o.clienteTelefono}
            setClienteTelefono={o.setClienteTelefono}
            clienteEmail={o.clienteEmail}
            setClienteEmail={o.setClienteEmail}
            sucursalConfig={sucursalConfig}
          />
        )}

        {o.step === 2 && (
          <PasoServiciosCosto
            servicios={servicios}
            serviciosSeleccionados={o.serviciosSeleccionados}
            onServiceToggle={o.handleServiceToggle}
            vehiculoTipo={o.vehiculoTipo}
            descuento={o.descuento}
            setDescuento={o.setDescuento}
            subtotal={o.subtotal}
            total={o.total}
            sucursalConfig={sucursalConfig}
          />
        )}

        {o.step === 3 && (
          <PasoOperacionNotas
            lavadores={lavadores}
            empleadoId={o.empleadoId}
            setEmpleadoId={o.setEmpleadoId}
            prioridad={o.prioridad}
            setPrioridad={o.setPrioridad}
            notas={o.notas}
            setNotas={o.setNotas}
            placa={o.placa}
          />
        )}

        {/* Form Footer Buttons */}
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/30 pt-4 mt-8">
          <div className="flex items-center gap-2.5">
            <Link href="/ordenes" passHref>
              <Button
                type="button"
                variant="outline"
                className="text-xs font-bold h-9 gap-1.5 cursor-pointer"
              >
                <X className="size-4" />
                Cancelar
              </Button>
            </Link>

            {o.step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => o.setStep(o.step - 1)}
                className="text-xs font-bold h-9 gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                Atrás
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {o.step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (!cajaAbierta) {
                    toast.error("No es posible avanzar: la caja se encuentra cerrada.");
                    return;
                  }
                  if (o.step === 1 && (!o.placa.trim() || !o.clienteNombre.trim())) {
                    toast.error("Por favor completa los campos requeridos (Placa y Nombre)");
                    return;
                  }
                  if (o.step === 2 && o.serviciosSeleccionados.length === 0) {
                    toast.error("Por favor selecciona al menos un servicio");
                    return;
                  }
                  o.setStep(o.step + 1);
                }}
                disabled={!cajaAbierta}
                variant="secondary"
                className="text-white font-bold text-xs h-9 rounded-lg gap-1.5 cursor-pointer px-5"
              >
                Siguiente
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={o.handleSubmit}
                disabled={o.isPending || !cajaAbierta}
                variant="secondary"
                className="font-bold text-xs h-9 rounded-lg gap-2 cursor-pointer px-6"
              >
                {o.isPending ? "Registrando..." : "Registrar Orden"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Éxito e Impresión */}
      <SuccessDialog
        open={o.showSuccessDialog}
        onOpenChange={o.setShowSuccessDialog}
        placa={o.placa}
        clienteNombre={o.clienteNombre}
        clienteApellido={o.clienteApellido}
        total={o.total}
        createdOrderId={o.createdOrderId}
        onPrintTicket={(orderId) => window.open(`/api/pdf/ticket/${orderId}?mode=work`, "_blank")}
        onNewOrder={o.handleNewOrder}
        onViewOrders={() => {
          o.setShowSuccessDialog(false);
          router.push("/ordenes");
        }}
      />
    </div>
  );
}
