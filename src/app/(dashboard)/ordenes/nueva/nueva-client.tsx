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
    <div className="space-y-5 sm:space-y-6 md:space-y-8 max-w-6xl mx-auto text-foreground">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-500/10 dark:bg-amber-500/10 border border-amber-500/25 rounded-xl text-foreground shadow-xs">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <h4 className="font-bold text-sm leading-tight text-foreground">
                Turno de Caja Cerrado
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                Para confirmar y cobrar órdenes de servicio, la sucursal debe tener un turno activo.
              </p>
            </div>
          </div>
          <Link href="/caja" passHref className="shrink-0">
            <Button
              size="sm"
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 rounded-lg cursor-pointer shadow-xs border-0 w-full sm:w-auto"
            >
              Abrir Caja Ahora
            </Button>
          </Link>
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
            cuponCodigo={o.cuponCodigo}
            setCuponCodigo={o.setCuponCodigo}
            cuponAplicado={o.cuponAplicado}
            aplicarCupon={o.aplicarCupon}
            removerCupon={o.removerCupon}
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

        {/* Sticky Action Footer Buttons */}
        <div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-md border-t border-border py-3.5 sm:py-4 mt-6 -mx-3 px-3 sm:-mx-6 sm:px-6 flex items-center justify-between rounded-b-2xl shadow-lg shadow-black/5">
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/ordenes" passHref>
              <Button
                type="button"
                variant="outline"
                className="text-xs sm:text-sm font-bold h-10 px-3.5 sm:px-4 rounded-xl gap-1.5 cursor-pointer text-foreground hover:bg-muted/80 hover:text-foreground border-border shadow-2xs"
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
                className="text-xs sm:text-sm font-bold h-10 px-3.5 sm:px-4 rounded-xl gap-1.5 cursor-pointer text-foreground hover:bg-muted/80 hover:text-foreground border-border shadow-2xs"
              >
                <ArrowLeft className="size-4" />
                Atrás
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs text-muted-foreground font-semibold">
              Paso {o.step} de 3
            </span>
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
                className="font-black text-xs sm:text-sm h-10 sm:h-11 rounded-xl gap-2 cursor-pointer px-6 shadow-sm shadow-secondary/15 active:scale-95 transition-transform"
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
                className="font-black text-xs sm:text-sm h-10 sm:h-11 rounded-xl gap-2 cursor-pointer px-7 shadow-md shadow-secondary/20 active:scale-95 transition-transform"
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
