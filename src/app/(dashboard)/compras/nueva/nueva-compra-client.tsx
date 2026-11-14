"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { NuevaCompraHeader } from "./components/NuevaCompraHeader";
import { ProveedorDocCard } from "./components/ProveedorDocCard";
import { InsumosItemsTable, type ItemRow } from "./components/InsumosItemsTable";
import { ResumenTotalesCard } from "./components/ResumenTotalesCard";
import { registrarCompraAction } from "@/lib/actions/compras";
import type { InsumoOption, ProveedorAutocompleteItem } from "../types";

interface NuevaCompraClientProps {
  insumos: InsumoOption[];
  proveedores: ProveedorAutocompleteItem[];
  initialProveedorId?: string;
}

export function NuevaCompraClient({
  insumos,
  proveedores,
  initialProveedorId,
}: NuevaCompraClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initialProv = initialProveedorId
    ? proveedores.find((p) => p.id === initialProveedorId) || null
    : null;

  // Cabecera
  const [proveedorId, setProveedorId] = useState<string | null>(initialProv?.id || null);
  const [proveedorNombre, setProveedorNombre] = useState(initialProv?.razonSocial || "");
  const [proveedorRuc, setProveedorRuc] = useState(initialProv?.ruc || "");
  const [proveedorTelefono, setProveedorTelefono] = useState(initialProv?.telefono || "");
  const [proveedorDireccion, setProveedorDireccion] = useState(initialProv?.direccion || "");
  const [tipoComprobante, setTipoComprobante] = useState("factura");
  const [numeroComprobante, setNumeroComprobante] = useState("");
  const [fechaEmision, setFechaEmision] = useState(
    new Date().toISOString().slice(0, 10)
  );
  const [metodoPago, setMetodoPago] = useState("transferencia");
  const [incluyeIgv, setIncluyeIgv] = useState(true);
  const [observaciones, setObservaciones] = useState("");

  // Items
  const [items, setItems] = useState<ItemRow[]>([
    {
      insumoId: insumos[0]?.id || "",
      descripcion: insumos[0]?.nombre || "",
      cantidad: 1,
      costoUnitario: parseFloat(insumos[0]?.precioCompra || "0") || 0,
    },
  ]);

  const handleAddItem = () => {
    const first = insumos[0];
    setItems((prev) => [
      ...prev,
      {
        insumoId: first?.id || "",
        descripcion: first?.nombre || "",
        cantidad: 1,
        costoUnitario: parseFloat(first?.precioCompra || "0") || 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) {
      toast.error("Debes incluir al menos un insumo en la compra.");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (
    index: number,
    field: keyof ItemRow,
    value: string | number
  ) => {
    setItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index] };

      if (field === "insumoId") {
        const found = insumos.find((ins) => ins.id === value);
        target.insumoId = String(value);
        target.descripcion = found?.nombre || "";
        if (found?.precioCompra) {
          target.costoUnitario = parseFloat(found.precioCompra) || 0;
        }
      } else if (field === "cantidad") {
        target.cantidad = Math.max(0.1, Number(value) || 0);
      } else if (field === "costoUnitario") {
        target.costoUnitario = Math.max(0, Number(value) || 0);
      }

      copy[index] = target;
      return copy;
    });
  };

  // Cálculos totales
  const totalBruto = items.reduce(
    (acc, it) => acc + it.cantidad * it.costoUnitario,
    0
  );
  const subtotal = incluyeIgv ? totalBruto / 1.18 : totalBruto;
  const igv = incluyeIgv ? totalBruto - subtotal : 0;
  const totalFinal = totalBruto;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!proveedorNombre.trim()) {
      toast.error("Ingresa el nombre o razón social del proveedor.");
      return;
    }
    if (!numeroComprobante.trim()) {
      toast.error("Ingresa el número de comprobante (ej: F001-0004521).");
      return;
    }
    if (items.some((it) => !it.insumoId || it.cantidad <= 0 || it.costoUnitario <= 0)) {
      toast.error("Verifica que todos los insumos tengan cantidad y costo mayores a 0.");
      return;
    }

    try {
      setIsSubmitting(true);

      const detallesPayload = items.map((it) => ({
        insumoId: it.insumoId,
        descripcion: it.descripcion,
        cantidad: it.cantidad,
        costoUnitario: it.costoUnitario,
        subtotal: it.cantidad * it.costoUnitario,
      }));

      const res = await registrarCompraAction({
        proveedorId: proveedorId || undefined,
        proveedorNombre: proveedorNombre.trim(),
        proveedorRuc: proveedorRuc.trim() || undefined,
        proveedorTelefono: proveedorTelefono.trim() || undefined,
        proveedorDireccion: proveedorDireccion.trim() || undefined,
        tipoComprobante,
        numeroComprobante: numeroComprobante.trim(),
        fechaEmision,
        metodoPago,
        subtotal,
        igv,
        total: totalFinal,
        observaciones: observaciones.trim() || undefined,
        detalles: detallesPayload,
      });

      if (!res.success) {
        toast.error(res.error || "No se pudo registrar la compra.");
        return;
      }

      toast.success(
        `¡Compra ${numeroComprobante} registrada exitosamente! Stock de insumos actualizado.`
      );
      router.push("/compras");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al guardar la compra.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* 1. Header con botón volver */}
      <NuevaCompraHeader />

      {/* 2. Formulario principal */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Columna Izquierda: Datos Proveedor + Tabla Insumos (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <ProveedorDocCard
              proveedores={proveedores}
              proveedorId={proveedorId}
              setProveedorId={setProveedorId}
              proveedorNombre={proveedorNombre}
              setProveedorNombre={setProveedorNombre}
              proveedorRuc={proveedorRuc}
              setProveedorRuc={setProveedorRuc}
              proveedorTelefono={proveedorTelefono}
              setProveedorTelefono={setProveedorTelefono}
              proveedorDireccion={proveedorDireccion}
              setProveedorDireccion={setProveedorDireccion}
              tipoComprobante={tipoComprobante}
              setTipoComprobante={setTipoComprobante}
              numeroComprobante={numeroComprobante}
              setNumeroComprobante={setNumeroComprobante}
              fechaEmision={fechaEmision}
              setFechaEmision={setFechaEmision}
              metodoPago={metodoPago}
              setMetodoPago={setMetodoPago}
            />

            <InsumosItemsTable
              items={items}
              insumos={insumos}
              onAddItem={handleAddItem}
              onRemoveItem={handleRemoveItem}
              onItemChange={handleItemChange}
            />
          </div>

          {/* Columna Derecha: Resumen de Totales y Guardar (4 cols) */}
          <div className="lg:col-span-4 lg:sticky lg:top-4">
            <ResumenTotalesCard
              subtotal={subtotal}
              igv={igv}
              total={totalFinal}
              incluyeIgv={incluyeIgv}
              setIncluyeIgv={setIncluyeIgv}
              observaciones={observaciones}
              setObservaciones={setObservaciones}
              isSubmitting={isSubmitting}
              totalItemsCount={items.length}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
