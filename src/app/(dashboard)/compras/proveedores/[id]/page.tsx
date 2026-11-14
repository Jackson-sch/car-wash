import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProveedorByIdAction } from "@/lib/actions/proveedores";
import { ProveedorDetailClient } from "./proveedor-detail-client";
import type { ProveedorDirectoryItem } from "../../types";

export const metadata: Metadata = {
  title: "Ficha de Proveedor - WashMaster Pro",
  description: "Información fiscal, cuentas bancarias e historial de compras del proveedor.",
};

interface ProveedorDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProveedorDetailPage({ params }: ProveedorDetailPageProps) {
  const { id } = await params;
  const res = await getProveedorByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const raw = res.data;
  const completadas = (raw.compras || []).filter((c) => c.estado === "completada");
  const montoTotal = completadas.reduce((acc, c) => acc + parseFloat(c.total || "0"), 0);

  const proveedor: ProveedorDirectoryItem = {
    id: raw.id,
    sucursalId: raw.sucursalId,
    ruc: raw.ruc,
    razonSocial: raw.razonSocial,
    nombreComercial: raw.nombreComercial,
    direccion: raw.direccion,
    telefono: raw.telefono,
    email: raw.email,
    contactoNombre: raw.contactoNombre,
    banco: raw.banco,
    cuentaBancaria: raw.cuentaBancaria,
    cci: raw.cci,
    notas: raw.notas,
    activo: raw.activo,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
    totalCompras: completadas.length,
    montoTotal,
    ultimaCompra: raw.compras?.[0]?.fechaEmision ? new Date(raw.compras[0].fechaEmision) : null,
  };

  const comprasHistorial = (raw.compras || []).map((c) => ({
    id: c.id,
    tipoComprobante: c.tipoComprobante,
    numeroComprobante: c.numeroComprobante,
    fechaEmision: new Date(c.fechaEmision),
    metodoPago: c.metodoPago,
    estado: c.estado,
    total: c.total,
    itemsCount: (c.detalles || []).length,
  }));

  return (
    <ProveedorDetailClient
      proveedor={proveedor}
      comprasHistorial={comprasHistorial}
    />
  );
}
