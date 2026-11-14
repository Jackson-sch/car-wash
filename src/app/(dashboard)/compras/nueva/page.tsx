import { Metadata } from "next";
import { getInsumosParaCompraAction } from "@/lib/actions/compras";
import { getProveedoresParaAutocompleteAction } from "@/lib/actions/proveedores";
import { NuevaCompraClient } from "./nueva-compra-client";

export const metadata: Metadata = {
  title: "Registrar Compra - WashMaster Pro",
  description: "Ingreso de factura o boleta de proveedor con actualización automática de stock.",
};

interface NuevaCompraPageProps {
  searchParams: Promise<{ proveedorId?: string }>;
}

export default async function NuevaCompraPage({ searchParams }: NuevaCompraPageProps) {
  const { proveedorId } = await searchParams;

  const [resInsumos, resProveedores] = await Promise.all([
    getInsumosParaCompraAction(),
    getProveedoresParaAutocompleteAction(),
  ]);

  const insumos = resInsumos.data || [];
  const proveedores = resProveedores.data || [];

  return (
    <NuevaCompraClient
      insumos={insumos}
      proveedores={proveedores}
      initialProveedorId={proveedorId}
    />
  );
}
