import { Metadata } from "next";
import { getKardexGlobalAction } from "@/lib/actions/inventario";
import { KardexClient } from "./kardex-client";

export const metadata: Metadata = {
  title: "Libro Kardex de Movimientos - WashMaster Pro",
  description: "Auditoría cronológica de movimientos de entrada, salida y ajustes de inventario.",
};

export default async function KardexPage() {
  const res = await getKardexGlobalAction();

  const initialMovimientos = res.success && res.data ? res.data.movimientos : [];
  const insumos = res.success && res.data ? res.data.insumos : [];

  return (
    <KardexClient
      initialMovimientos={initialMovimientos}
      insumos={insumos}
    />
  );
}
