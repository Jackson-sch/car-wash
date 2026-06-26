"use client";

import { useState, useTransition, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ArrowRight, ArrowLeft, CheckCircle2, Printer, PlusCircle, List, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createOrden } from "@/lib/actions/ordenes";
import { toast } from "sonner";
import Link from "next/link";
import { StepperHeader } from "./components/StepperHeader";
import { PasoVehiculoCliente } from "./components/PasoVehiculoCliente";
import { PasoServiciosCosto } from "./components/PasoServiciosCosto";
import { PasoOperacionNotas } from "./components/PasoOperacionNotas";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

type VehiculoTipo = "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  duracionMin: number | null;
  aplicaA: string[] | null;
  categoriaId: string | null;
  categoriaNombre: string | null;
}

interface Lavador {
  id: string;
  nombre: string;
  apellido: string | null;
}

interface NuevaOrdenClientProps {
  servicios: Servicio[];
  lavadores: Lavador[];
  sucursalConfig?: Record<string, any>;
  cajaAbierta: boolean;
}

const defaultMultipliers: Record<string, number> = {
  sedan: 1.0,
  suv: 1.2,
  pickup: 1.4,
  moto: 0.8,
  camion: 2.0,
  furgon: 1.8,
  otro: 1.0,
};

export function NuevaOrdenClient({ servicios, lavadores, sucursalConfig = {}, cajaAbierta }: NuevaOrdenClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Form Step 1: Cliente & Vehículo
  const [placa, setPlaca] = useState("");
  const [vehiculoTipo, setVehiculoTipo] = useState<VehiculoTipo>("sedan");
  const [vehiculoMarca, setVehiculoMarca] = useState("");
  const [vehiculoModelo, setVehiculoModelo] = useState("");
  const [vehiculoColor, setVehiculoColor] = useState("");
  const [clienteNombre, setClienteNombre] = useState("");
  const [clienteApellido, setClienteApellido] = useState("");
  const [clienteTelefono, setClienteTelefono] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");

  // Form Step 2: Servicios
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [descuento, setDescuento] = useState("0");

  // Form Step 3: Asignaciones & Notas
  const [empleadoId, setEmpleadoId] = useState("");
  const [notas, setNotas] = useState("");
  const [prioridad, setPrioridad] = useState(0); // 0 = normal, 1 = alta/express

  // Precios dinámicos basados en el multiplicador del tipo de vehículo de la DB
  const dbMultipliers = sucursalConfig.multipliers || {};
  const multiplier = useMemo(() => {
    return dbMultipliers[vehiculoTipo] ?? defaultMultipliers[vehiculoTipo] ?? 1.0;
  }, [dbMultipliers, vehiculoTipo]);

  const calculateServicePrice = useCallback((basePrice: string) => {
    const base = parseFloat(basePrice) || 0;
    return (base * multiplier).toFixed(2);
  }, [multiplier]);

  // Cálculo del subtotal y total
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let sub = 0;
    serviciosSeleccionados.forEach((id) => {
      const serv = servicios.find((s) => s.id === id);
      if (serv) {
        sub += parseFloat(calculateServicePrice(serv.precio));
      }
    });
    setSubtotal(sub);

    const desc = parseFloat(descuento) || 0;
    setTotal(Math.max(0, sub - desc));
  }, [serviciosSeleccionados, servicios, calculateServicePrice, descuento]);

  const handleServiceToggle = (id: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  // Enviar formulario final
  const handleSubmit = async () => {
    if (!cajaAbierta) {
      toast.error("No es posible registrar la orden: la caja se encuentra cerrada.");
      return;
    }
    if (!placa.trim() || !clienteNombre.trim() || serviciosSeleccionados.length === 0) {
      toast.error("Por favor completa los datos obligatorios y selecciona al menos un servicio");
      return;
    }

    // Mapear los servicios elegidos a sus nombres y precios calculados
    const mappedServs = serviciosSeleccionados.map((id) => {
      const s = servicios.find((item) => item.id === id)!;
      return {
        id: s.id,
        nombre: s.nombre,
        precio: calculateServicePrice(s.precio),
      };
    });

    startTransition(async () => {
      const res = await createOrden({
        placa: placa.toUpperCase(),
        vehiculoTipo,
        vehiculoMarca,
        vehiculoModelo,
        vehiculoColor,
        clienteNombre,
        clienteApellido,
        clienteTelefono,
        clienteEmail,
        serviciosSeleccionados: mappedServs,
        empleadoId: empleadoId || null,
        notas,
        prioridad,
        descuento,
      });

      if (res.success && res.data) {
        toast.success("Orden de servicio registrada exitosamente");
        setCreatedOrderId(res.data.id);
        setShowSuccessDialog(true);
        router.refresh();
      } else {
        toast.error(res.error || "Ocurrió un error al registrar la orden");
      }
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
          <ClipboardList className="h-7 w-7 text-secondary" />
          Nueva Orden de Servicio
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Completa los datos secuenciales para dar de alta una orden en el sistema.
        </p>
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
      <StepperHeader step={step} />

      {/* Form Content */}
      <div className="space-y-6">
        {step === 1 && (
          <PasoVehiculoCliente
            placa={placa}
            setPlaca={setPlaca}
            vehiculoTipo={vehiculoTipo}
            setVehiculoTipo={setVehiculoTipo}
            vehiculoMarca={vehiculoMarca}
            setVehiculoMarca={setVehiculoMarca}
            vehiculoModelo={vehiculoModelo}
            setVehiculoModelo={setVehiculoModelo}
            vehiculoColor={vehiculoColor}
            setVehiculoColor={setVehiculoColor}
            clienteNombre={clienteNombre}
            setClienteNombre={setClienteNombre}
            clienteApellido={clienteApellido}
            setClienteApellido={setClienteApellido}
            clienteTelefono={clienteTelefono}
            setClienteTelefono={setClienteTelefono}
            clienteEmail={clienteEmail}
            setClienteEmail={setClienteEmail}
            sucursalConfig={sucursalConfig}
          />
        )}

        {step === 2 && (
          <PasoServiciosCosto
            servicios={servicios}
            serviciosSeleccionados={serviciosSeleccionados}
            onServiceToggle={handleServiceToggle}
            vehiculoTipo={vehiculoTipo}
            descuento={descuento}
            setDescuento={setDescuento}
            subtotal={subtotal}
            total={total}
            sucursalConfig={sucursalConfig}
          />
        )}

        {step === 3 && (
          <PasoOperacionNotas
            lavadores={lavadores}
            empleadoId={empleadoId}
            setEmpleadoId={setEmpleadoId}
            prioridad={prioridad}
            setPrioridad={setPrioridad}
            notas={notas}
            setNotas={setNotas}
            placa={placa}
          />
        )}

        {/* Form Footer Buttons */}
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/30 pt-4 mt-8">
          <div>
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step - 1)}
                className="text-xs font-bold h-9 gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="size-4" />
                Atrás
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            {step < 3 ? (
              <Button
                type="button"
                onClick={() => {
                  if (!cajaAbierta) {
                    toast.error("No es posible avanzar: la caja se encuentra cerrada.");
                    return;
                  }
                  // Validaciones
                  if (step === 1 && (!placa.trim() || !clienteNombre.trim())) {
                    toast.error("Por favor completa los campos requeridos (Placa y Nombre)");
                    return;
                  }
                  if (step === 2 && serviciosSeleccionados.length === 0) {
                    toast.error("Por favor selecciona al menos un servicio");
                    return;
                  }
                  setStep(step + 1);
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
                onClick={handleSubmit}
                disabled={isPending || !cajaAbierta}
                variant="secondary"
                className="font-bold text-xs h-9 rounded-lg gap-2 cursor-pointer px-6"
              >
                {isPending ? "Registrando..." : "Registrar Orden"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Éxito e Impresión */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="bg-card border border-border rounded-2xl max-w-md p-6 text-center space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <div className="p-3 bg-emerald-500/10 text-emerald-600 rounded-full">
              <CheckCircle2 className="h-10 w-10 animate-bounce" />
            </div>
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-xl font-bold text-foreground text-center">
                ¡Orden Registrada!
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground text-center">
                La orden de servicio se ha registrado con éxito en el sistema.
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Resumen rápido */}
          <div className="bg-muted/40 border border-border p-4 rounded-xl text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Placa:</span>
              <span className="font-bold text-foreground uppercase">{placa}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cliente:</span>
              <span className="font-bold text-foreground">{clienteNombre} {clienteApellido}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-black text-secondary">S/ {total.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <Button
              onClick={() => {
                if (createdOrderId) {
                  window.open(`/api/pdf/ticket/${createdOrderId}?mode=work`, "_blank");
                }
              }}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 py-5 rounded-xl cursor-pointer w-full text-xs h-auto shadow-sm"
            >
              <Printer className="size-4" />
              Imprimir Ticket de Trabajo (Sin Precios)
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  // Limpiar formulario y resetear stepper
                  setPlaca("");
                  setVehiculoTipo("sedan");
                  setVehiculoMarca("");
                  setVehiculoModelo("");
                  setVehiculoColor("");
                  setClienteNombre("");
                  setClienteApellido("");
                  setClienteTelefono("");
                  setClienteEmail("");
                  setServiciosSeleccionados([]);
                  setDescuento("0");
                  setEmpleadoId("");
                  setNotas("");
                  setPrioridad(0);
                  setStep(1);
                  setShowSuccessDialog(false);
                  setCreatedOrderId(null);
                }}
                className="text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs py-3.5 h-auto font-semibold gap-1.5 cursor-pointer"
              >
                <PlusCircle className="size-3.5" />
                Nueva Orden
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowSuccessDialog(false);
                  router.push("/ordenes");
                }}
                className="text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs py-3.5 h-auto font-semibold gap-1.5 cursor-pointer"
              >
                <List className="size-3.5" />
                Ver Órdenes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
