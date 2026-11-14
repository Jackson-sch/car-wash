import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCompraByIdAction } from "@/lib/actions/compras";
import { CompraDetalleClient } from "./compra-detalle-client";
import type { CompraItem } from "../types";

export const metadata: Metadata = {
  title: "Detalle de Compra - WashMaster Pro",
  description: "Consulta de comprobante de compra y trazabilidad en almacén.",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CompraDetallePage({ params }: PageProps) {
  const { id } = await params;
  const res = await getCompraByIdAction(id);

  if (!res.success || !res.data) {
    notFound();
  }

  const raw = res.data;

  const compra: CompraItem = {
    id: raw.id,
    sucursalId: raw.sucursalId,
    usuarioId: raw.usuarioId,
    proveedorId: raw.proveedorId,
    proveedorNombre: raw.proveedorNombre,
    proveedorRuc: raw.proveedorRuc,
    tipoComprobante: raw.tipoComprobante,
    numeroComprobante: raw.numeroComprobante,
    fechaEmision: new Date(raw.fechaEmision),
    metodoPago: raw.metodoPago,
    estado: raw.estado,
    subtotal: raw.subtotal,
    igv: raw.igv,
    total: raw.total,
    observaciones: raw.observaciones,
    createdAt: raw.createdAt ? new Date(raw.createdAt) : null,
    updatedAt: raw.updatedAt ? new Date(raw.updatedAt) : null,
    usuario: raw.usuario
      ? {
          id: raw.usuario.id,
          nombre: raw.usuario.nombre,
          apellido: raw.usuario.apellido,
        }
      : null,
    detalles: (raw.detalles || []).map((d) => ({
      id: d.id,
      compraId: d.compraId,
      insumoId: d.insumoId,
      descripcion: d.descripcion,
      cantidad: d.cantidad,
      costoUnitario: d.costoUnitario,
      subtotal: d.subtotal,
      createdAt: d.createdAt ? new Date(d.createdAt) : null,
      insumo: d.insumo
        ? {
            id: d.insumo.id,
            nombre: d.insumo.nombre,
            unidad: d.insumo.unidad,
            stock: d.insumo.stock,
          }
        : null,
    })),
  };

  return <CompraDetalleClient compra={compra} />;
}
