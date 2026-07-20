"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createOrden } from "@/lib/actions/ordenes";
import { toast } from "sonner";

export type VehiculoTipo = "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro";

export interface Servicio {
  id: string;
  nombre: string;
  descripcion: string | null;
  precio: string;
  duracionMin: number | null;
  aplicaA: string[] | null;
  categoriaId: string | null;
  categoriaNombre: string | null;
}

export interface Lavador {
  id: string;
  nombre: string;
  apellido: string | null;
}

interface UseNuevaOrdenProps {
  servicios: Servicio[];
  sucursalConfig?: { multipliers?: Record<string, number> };
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

export function useNuevaOrden({ servicios, sucursalConfig = {}, cajaAbierta }: UseNuevaOrdenProps) {
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
  const [prioridad, setPrioridad] = useState(0);

  const multiplier = useMemo(() => {
    const dbMultipliers = sucursalConfig.multipliers ?? {};
    return dbMultipliers[vehiculoTipo] ?? defaultMultipliers[vehiculoTipo] ?? 1.0;
  }, [sucursalConfig.multipliers, vehiculoTipo]);

  const calculateServicePrice = useCallback(
    (basePrice: string) => {
      const base = parseFloat(basePrice) || 0;
      return (base * multiplier).toFixed(2);
    },
    [multiplier]
  );

  const subtotal = useMemo(() => {
    let sub = 0;
    serviciosSeleccionados.forEach((id) => {
      const serv = servicios.find((s) => s.id === id);
      if (serv) {
        sub += parseFloat(calculateServicePrice(serv.precio));
      }
    });
    return sub;
  }, [serviciosSeleccionados, servicios, calculateServicePrice]);

  const total = useMemo(() => {
    const desc = parseFloat(descuento) || 0;
    return Math.max(0, subtotal - desc);
  }, [subtotal, descuento]);

  const handleServiceToggle = (id: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleSubmit = async () => {
    if (!cajaAbierta) {
      toast.error("No es posible registrar la orden: la caja se encuentra cerrada.");
      return;
    }
    if (!placa.trim() || !clienteNombre.trim() || serviciosSeleccionados.length === 0) {
      toast.error("Por favor completa los datos obligatorios y selecciona al menos un servicio");
      return;
    }

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

  const handleNewOrder = () => {
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
  };

  return {
    step,
    setStep,
    isPending,
    createdOrderId,
    showSuccessDialog,
    setShowSuccessDialog,
    placa,
    setPlaca,
    vehiculoTipo,
    setVehiculoTipo,
    vehiculoMarca,
    setVehiculoMarca,
    vehiculoModelo,
    setVehiculoModelo,
    vehiculoColor,
    setVehiculoColor,
    clienteNombre,
    setClienteNombre,
    clienteApellido,
    setClienteApellido,
    clienteTelefono,
    setClienteTelefono,
    clienteEmail,
    setClienteEmail,
    serviciosSeleccionados,
    descuento,
    setDescuento,
    empleadoId,
    setEmpleadoId,
    notas,
    setNotas,
    prioridad,
    setPrioridad,
    subtotal,
    total,
    handleServiceToggle,
    handleSubmit,
    handleNewOrder,
  };
}
