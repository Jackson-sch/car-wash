"use client";

import { useState, useTransition, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createOrden } from "@/lib/actions/ordenes";
import { toast } from "sonner";
import { StepperHeader } from "./components/StepperHeader";
import { PasoVehiculoCliente } from "./components/PasoVehiculoCliente";
import { PasoServiciosCosto } from "./components/PasoServiciosCosto";
import { PasoOperacionNotas } from "./components/PasoOperacionNotas";

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

export function NuevaOrdenClient({ servicios, lavadores, sucursalConfig = {} }: NuevaOrdenClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isPending, startTransition] = useTransition();

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

  const calculateServicePrice = (basePrice: string) => {
    const base = parseFloat(basePrice) || 0;
    return (base * multiplier).toFixed(2);
  };

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
  }, [serviciosSeleccionados, vehiculoTipo, descuento, multiplier]);

  const handleServiceToggle = (id: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  // Enviar formulario final
  const handleSubmit = async () => {
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
        router.push("/ordenes");
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
                disabled={isPending}
                variant="secondary"
                className="font-bold text-xs h-9 rounded-lg gap-2 cursor-pointer px-6"
              >
                {isPending ? "Registrando..." : "Registrar Orden"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
