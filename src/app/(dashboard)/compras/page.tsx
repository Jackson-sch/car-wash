import { Metadata } from "next";
import { getComprasAction } from "@/lib/actions/compras";
import { ComprasClient } from "./compras-client";
import type { CompraItem } from "./types";

export const metadata: Metadata = {
  title: "Registro de Compras & Proveedores - WashMaster Pro",
  description:
    "Gestión integral de facturas de compra con actualización automática de stock de insumos y costos en almacén.",
};

export default async function ComprasPage() {
  const res = await getComprasAction();

  const rawCompras = res.data?.compras || [];

  const comprasList: CompraItem[] = rawCompras.map((c) => ({
    id: c.id,
    sucursalId: c.sucursalId,
    usuarioId: c.usuarioId,
    proveedorId: c.proveedorId,
    proveedorNombre: c.proveedorNombre,
    proveedorRuc: c.proveedorRuc,
    tipoComprobante: c.tipoComprobante,
    numeroComprobante: c.numeroComprobante,
    fechaEmision: new Date(c.fechaEmision),
    metodoPago: c.metodoPago,
    estado: c.estado,
    subtotal: c.subtotal,
    igv: c.igv,
    total: c.total,
    observaciones: c.observaciones,
    createdAt: c.createdAt ? new Date(c.createdAt) : null,
    updatedAt: c.updatedAt ? new Date(c.updatedAt) : null,
    usuario: c.usuario
      ? {
          id: c.usuario.id,
          nombre: c.usuario.nombre,
          apellido: c.usuario.apellido,
        }
      : null,
    detalles: (c.detalles || []).map((d) => ({
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
  }));

  return <ComprasClient initialCompras={comprasList} />;
}
