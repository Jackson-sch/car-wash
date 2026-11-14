import { Metadata } from "next";
import { getProveedoresAction } from "@/lib/actions/proveedores";
import { ProveedoresClient } from "./proveedores-client";
import type { ProveedorDirectoryItem } from "../types";

export const metadata: Metadata = {
  title: "Directorio de Proveedores - WashMaster Pro",
  description: "Gestión de proveedores, cuentas bancarias, contactos e historial de compras.",
};

export default async function ProveedoresPage() {
  const res = await getProveedoresAction();

  const proveedoresList: ProveedorDirectoryItem[] = (res.data || []).map((p) => ({
    id: p.id,
    sucursalId: p.sucursalId,
    ruc: p.ruc,
    razonSocial: p.razonSocial,
    nombreComercial: p.nombreComercial,
    direccion: p.direccion,
    telefono: p.telefono,
    email: p.email,
    contactoNombre: p.contactoNombre,
    banco: p.banco,
    cuentaBancaria: p.cuentaBancaria,
    cci: p.cci,
    notas: p.notas,
    activo: p.activo,
    createdAt: p.createdAt ? new Date(p.createdAt) : null,
    updatedAt: p.updatedAt ? new Date(p.updatedAt) : null,
    totalCompras: p.totalCompras,
    montoTotal: p.montoTotal,
    ultimaCompra: p.ultimaCompra ? new Date(p.ultimaCompra) : null,
  }));

  return <ProveedoresClient initialProveedores={proveedoresList} />;
}
