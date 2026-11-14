"use client";

import { useState, useTransition, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createOrden } from "@/lib/actions/ordenes";
import { toast } from "sonner";

import { validarCuponPrevio } from "@/lib/actions/cupones";

export type VehiculoTipo = "sedan" | "suv" | "pickup" | "moto" | "camion" | "furgon" | "otro";

export interface VehiculoTipoOption {
  id: VehiculoTipo;
  label: string;
  defaultMultiplier: number;
  shortcut: string;
  shortcutNum: number;
}

export const VEHICULO_TIPOS_CONFIG: VehiculoTipoOption[] = [
  { id: "sedan", label: "Sedán", defaultMultiplier: 1.0, shortcut: "Alt+1", shortcutNum: 1 },
  { id: "suv", label: "SUV", defaultMultiplier: 1.2, shortcut: "Alt+2", shortcutNum: 2 },
  { id: "pickup", label: "Pick-up / Camioneta", defaultMultiplier: 1.4, shortcut: "Alt+3", shortcutNum: 3 },
  { id: "moto", label: "Moto", defaultMultiplier: 0.8, shortcut: "Alt+4", shortcutNum: 4 },
  { id: "camion", label: "Camión", defaultMultiplier: 2.0, shortcut: "Alt+5", shortcutNum: 5 },
  { id: "furgon", label: "Furgón / Van", defaultMultiplier: 1.8, shortcut: "Alt+6", shortcutNum: 6 },
  { id: "otro", label: "Otro", defaultMultiplier: 1.0, shortcut: "Alt+7", shortcutNum: 7 },
];

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

  // Form Step 2: Servicios & Cupones
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);
  const [descuento, setDescuento] = useState("0");
  const [cuponCodigo, setCuponCodigo] = useState("");
  const [cuponAplicado, setCuponAplicado] = useState<{
    id: string;
    codigo: string;
    descuentoMonto: number;
  } | null>(null);

  // Form Step 3: Asignaciones & Notas
  const [empleadoId, setEmpleadoId] = useState("");
  const [notas, setNotas] = useState("");
  const [prioridad, setPrioridad] = useState(0);

  // Inspección de daños (opcional)
  const [inspeccionPuntos, setInspeccionPuntos] = useState<{ id: number; x: number; y: number; zona: string; tipo: string; nota: string }[]>([]);
  const [inspeccionNotas, setInspeccionNotas] = useState("");

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

  const totalDuracionMin = useMemo(() => {
    let dur = 0;
    serviciosSeleccionados.forEach((id) => {
      const s = servicios.find((item) => item.id === id);
      if (s?.duracionMin) dur += s.duracionMin;
    });
    return dur;
  }, [serviciosSeleccionados, servicios]);

  const aplicarCupon = useCallback(async (codigo: string) => {
    if (!codigo.trim()) return;
    const res = await validarCuponPrevio(codigo.trim(), subtotal);
    if (res.success) {
      let descMonto = 0;
      if (res.tipoDescuento === "porcentaje") {
        descMonto = (subtotal * res.valorDescuento) / 100;
      } else {
        descMonto = res.valorDescuento;
      }
      descMonto = Math.min(descMonto, subtotal);
      setDescuento(descMonto.toFixed(2));
      setCuponAplicado({
        id: res.cuponId,
        codigo: codigo.toUpperCase(),
        descuentoMonto: descMonto,
      });
      toast.success(`¡Cupón ${codigo.toUpperCase()} aplicado con éxito!`);
    } else {
      toast.error(res.error || "Cupón no válido.");
    }
  }, [subtotal]);

  const removerCupon = useCallback(() => {
    setCuponAplicado(null);
    setCuponCodigo("");
    setDescuento("0");
  }, []);

  const handleServiceToggle = (id: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const removeService = (id: string) => {
    setServiciosSeleccionados((prev) => prev.filter((sId) => sId !== id));
  };

  const addService = (id: string) => {
    setServiciosSeleccionados((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const handleSubmit = async () => {
    if (!cajaAbierta) {
      toast.error("No es posible registrar la orden: la caja se encuentra cerrada.");
      return;
    }
    if (!placa.trim()) {
      toast.error("Por favor ingresa la placa del vehículo.");
      return;
    }
    if (!clienteNombre.trim()) {
      toast.error("Por favor completa el nombre del cliente.");
      return;
    }
    if (serviciosSeleccionados.length === 0) {
      toast.error("Por favor selecciona al menos un servicio para la orden.");
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

    let notasFinales = notas.trim();
    if (inspeccionPuntos.length > 0 || inspeccionNotas.trim()) {
      const inspTxt = `[INSPECCIÓN: ${inspeccionPuntos.length} hallazgo(s)${inspeccionNotas ? ` - ${inspeccionNotas.trim()}` : ""}]`;
      notasFinales = notasFinales ? `${notasFinales} | ${inspTxt}` : inspTxt;
    }

    startTransition(async () => {
      const res = await createOrden({
        placa: placa.toUpperCase().trim(),
        vehiculoTipo,
        vehiculoMarca: vehiculoMarca.trim() || undefined,
        vehiculoModelo: vehiculoModelo.trim() || undefined,
        vehiculoColor: vehiculoColor.trim() || undefined,
        clienteNombre: clienteNombre.trim(),
        clienteApellido: clienteApellido.trim() || undefined,
        clienteTelefono: clienteTelefono.trim() || undefined,
        clienteEmail: clienteEmail.trim() || undefined,
        serviciosSeleccionados: mappedServs,
        empleadoId: empleadoId || null,
        notas: notasFinales || undefined,
        prioridad,
        descuento,
      });

      if (res.success && res.data) {
        toast.success("¡Orden de servicio registrada exitosamente!");
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
    setCuponCodigo("");
    setCuponAplicado(null);
    setEmpleadoId("");
    setNotas("");
    setPrioridad(0);
    setInspeccionPuntos([]);
    setInspeccionNotas("");
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
    cuponCodigo,
    setCuponCodigo,
    cuponAplicado,
    aplicarCupon,
    removerCupon,
    empleadoId,
    setEmpleadoId,
    notas,
    setNotas,
    prioridad,
    setPrioridad,
    inspeccionPuntos,
    setInspeccionPuntos,
    inspeccionNotas,
    setInspeccionNotas,
    subtotal,
    total,
    totalDuracionMin,
    multiplier,
    calculateServicePrice,
    handleServiceToggle,
    removeService,
    addService,
    handleSubmit,
    handleNewOrder,
  };
}
