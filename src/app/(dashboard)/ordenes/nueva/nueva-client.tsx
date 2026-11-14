"use client";

import { useState, useRef } from "react";
import { 
  ClipboardList, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  X, 
  Zap, 
  Layers, 
  Keyboard
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { StepperHeader } from "./components/StepperHeader";
import { PasoVehiculoCliente } from "./components/PasoVehiculoCliente";
import { PasoServiciosCosto } from "./components/PasoServiciosCosto";
import { PasoOperacionNotas } from "./components/PasoOperacionNotas";
import { SuccessDialog } from "./components/SuccessDialog";
import { VehiclePlateInput } from "./components/VehiclePlateInput";
import { VehicleTypeSelector } from "./components/VehicleTypeSelector";
import { ClienteQuickForm } from "./components/ClienteQuickForm";
import { ServicesPOSGrid } from "./components/ServicesPOSGrid";
import { LiveTicketSummary } from "./components/LiveTicketSummary";
import { KeyboardShortcutsDock } from "./components/KeyboardShortcutsDock";
import { KeyboardShortcutsModal } from "./components/KeyboardShortcutsModal";
import { 
  useNuevaOrden, 
  type Servicio, 
  type Lavador,
  VEHICULO_TIPOS_CONFIG 
} from "./hooks/useNuevaOrden";
import { usePosShortcuts } from "./hooks/usePosShortcuts";

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

  // View mode: 'pos' (Unified High-Speed 2-Column POS) vs 'wizard' (Step-by-step)
  const [viewMode, setViewMode] = useState<"pos" | "wizard">("pos");
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);

  // Focus refs for keyboard shortcuts
  const placaInputRef = useRef<HTMLInputElement>(null);
  const clienteInputRef = useRef<HTMLInputElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Setup Global Keyboard Hotkeys
  usePosShortcuts({
    onFocusPlaca: () => {
      placaInputRef.current?.focus();
      placaInputRef.current?.select();
      toast.info("Enfocado en Placa", { duration: 1000 });
    },
    onSelectVehiculoTipoByIndex: (index) => {
      if (index >= 0 && index < VEHICULO_TIPOS_CONFIG.length) {
        const item = VEHICULO_TIPOS_CONFIG[index];
        o.setVehiculoTipo(item.id);
        toast.info(`Tipo de auto: ${item.label}`, { duration: 1200 });
      }
    },
    onFocusSearch: () => {
      searchInputRef.current?.focus();
      searchInputRef.current?.select();
    },
    onFocusCliente: () => {
      clienteInputRef.current?.focus();
      clienteInputRef.current?.select();
      toast.info("Enfocado en Teléfono / Cliente", { duration: 1000 });
    },
    onSubmitOrder: () => {
      o.handleSubmit();
    },
    onToggleShortcutsModal: () => {
      setIsShortcutsModalOpen((prev) => !prev);
    },
    enabled: true,
  });

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto text-foreground pb-12">
      {/* Header bar with Mode Switcher & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2.5">
              <ClipboardList className="h-7 w-7 text-secondary" />
              Nueva Orden de Servicio
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/30 text-[10px] font-black uppercase tracking-wider">
              <Zap className="size-3 fill-secondary" />
              POS Express
            </span>
          </div>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Recepción y registro rápido de vehículos con cálculo en tiempo real y despacho a patio.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Switch de modo de visualización */}
          <div className="flex items-center bg-muted/60 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setViewMode("pos")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "pos"
                  ? "bg-secondary text-slate-950 shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Zap className="size-3.5" />
              <span>Modo POS</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("wizard")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === "wizard"
                  ? "bg-card text-foreground shadow-xs border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Layers className="size-3.5" />
              <span>Modo Asistente</span>
            </button>
          </div>

          {/* Botón de Ayuda de Atajos */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsShortcutsModalOpen(true)}
            className="h-9 px-2.5 text-xs font-bold rounded-xl gap-1.5 border-border hover:border-secondary cursor-pointer"
            title="Ver atajos de teclado (Alt + K)"
          >
            <Keyboard className="size-4 text-secondary" />
            <span className="hidden md:inline">Atajos</span>
          </Button>

          {/* Cancelar */}
          <Link href="/ordenes" passHref>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="text-xs font-bold h-9 gap-1.5 cursor-pointer rounded-xl border-border"
            >
              <X className="size-4" />
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerta de Caja Cerrada */}
      {!cajaAbierta && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-foreground shadow-xs animate-in fade-in">
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
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs h-9 px-4 rounded-xl cursor-pointer shadow-xs border-0 w-full sm:w-auto"
            >
              Abrir Caja Ahora
            </Button>
          </Link>
        </div>
      )}

      {/* --- MODO POS EXPRESS UNIFICADO (2 COLUMNAS) --- */}
      {viewMode === "pos" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
          {/* COLUMNA IZQUIERDA: Flujo de Captura Rápida (8 columnas) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* 1. Placa y Vehículo */}
            <VehiclePlateInput
              placa={o.placa}
              setPlaca={o.setPlaca}
              setVehiculoTipo={o.setVehiculoTipo}
              vehiculoMarca={o.vehiculoMarca}
              setVehiculoMarca={o.setVehiculoMarca}
              vehiculoModelo={o.vehiculoModelo}
              setVehiculoModelo={o.setVehiculoModelo}
              vehiculoColor={o.vehiculoColor}
              setVehiculoColor={o.setVehiculoColor}
              setClienteNombre={o.setClienteNombre}
              setClienteApellido={o.setClienteApellido}
              setClienteTelefono={o.setClienteTelefono}
              setClienteEmail={o.setClienteEmail}
              inspeccionPuntos={o.inspeccionPuntos}
              setInspeccionPuntos={o.setInspeccionPuntos}
              inspeccionNotas={o.inspeccionNotas}
              setInspeccionNotas={o.setInspeccionNotas}
              inputRef={placaInputRef}
            />

            {/* 2. Selector de Tipo de Vehículo */}
            <VehicleTypeSelector
              vehiculoTipo={o.vehiculoTipo}
              setVehiculoTipo={o.setVehiculoTipo}
              sucursalConfig={sucursalConfig}
            />

            {/* 3. Catálogo de Servicios con One-Click Top & Search */}
            <ServicesPOSGrid
              servicios={servicios}
              serviciosSeleccionados={o.serviciosSeleccionados}
              onToggleServicio={o.handleServiceToggle}
              calculateServicePrice={o.calculateServicePrice}
              searchInputRef={searchInputRef}
            />

            {/* 4. Datos del Cliente & Contacto */}
            <ClienteQuickForm
              clienteNombre={o.clienteNombre}
              setClienteNombre={o.setClienteNombre}
              clienteApellido={o.clienteApellido}
              setClienteApellido={o.setClienteApellido}
              clienteTelefono={o.clienteTelefono}
              setClienteTelefono={o.setClienteTelefono}
              clienteEmail={o.clienteEmail}
              setClienteEmail={o.setClienteEmail}
              inputRef={clienteInputRef}
            />
          </div>

          {/* COLUMNA DERECHA: Ticket de Orden Persistente Sticky (4 columnas) */}
          <div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-4">
            <LiveTicketSummary
              placa={o.placa}
              vehiculoTipo={o.vehiculoTipo}
              multiplier={o.multiplier}
              clienteNombre={o.clienteNombre}
              clienteApellido={o.clienteApellido}
              clienteTelefono={o.clienteTelefono}
              servicios={servicios}
              serviciosSeleccionados={o.serviciosSeleccionados}
              onRemoveService={o.removeService}
              calculateServicePrice={o.calculateServicePrice}
              subtotal={o.subtotal}
              total={o.total}
              totalDuracionMin={o.totalDuracionMin}
              descuento={o.descuento}
              cuponCodigo={o.cuponCodigo}
              setCuponCodigo={o.setCuponCodigo}
              cuponAplicado={o.cuponAplicado}
              onAplicarCupon={o.aplicarCupon}
              onRemoverCupon={o.removerCupon}
              lavadores={lavadores}
              empleadoId={o.empleadoId}
              setEmpleadoId={o.setEmpleadoId}
              prioridad={o.prioridad}
              setPrioridad={o.setPrioridad}
              notas={o.notas}
              setNotas={o.setNotas}
              isPending={o.isPending}
              cajaAbierta={cajaAbierta}
              onSubmit={o.handleSubmit}
              onReset={o.handleNewOrder}
            />
          </div>
        </div>
      ) : (
        /* --- MODO ASISTENTE (STEPPER WIZARD DE 3 PASOS) --- */
        <div className="space-y-6">
          <StepperHeader step={o.step} />

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

          {/* Botones de navegación del Wizard */}
          <div className="sticky bottom-0 z-30 bg-background/95 backdrop-blur-md border-t border-border py-4 -mx-4 px-4 flex items-center justify-between rounded-b-2xl">
            <div className="flex items-center gap-2">
              {o.step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => o.setStep(o.step - 1)}
                  className="text-xs font-bold h-10 px-4 rounded-xl gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="size-4" />
                  Atrás
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground font-semibold">
                Paso {o.step} de 3
              </span>
              {o.step < 3 ? (
                <Button
                  type="button"
                  onClick={() => {
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
                  variant="secondary"
                  className="font-bold text-xs h-10 rounded-xl gap-2 cursor-pointer px-6"
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
                  className="font-black text-xs h-10 rounded-xl gap-2 cursor-pointer px-7"
                >
                  {o.isPending ? "Registrando..." : "Registrar Orden"}
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dock de Teclas Rápidas Flotante */}
      <KeyboardShortcutsDock onOpenModal={() => setIsShortcutsModalOpen(true)} />

      {/* Modal de Ayuda con el Listado Completo de Atajos */}
      <KeyboardShortcutsModal
        open={isShortcutsModalOpen}
        onOpenChange={setIsShortcutsModalOpen}
      />

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
