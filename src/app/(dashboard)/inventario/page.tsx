import { Suspense } from "react";
import { getInventario } from "@/lib/actions/inventario";
import { InventarioClient } from "./inventario-client";

export const metadata = {
  title: "Gestión de Inventario de Insumos - WashMaster Pro",
  description: "Registro de productos, control de stock y alertas automáticas de reposición.",
};

export default async function InventarioPage() {
  const inventarioList = await getInventario();

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando inventario...</div>}>
      <InventarioClient initialInventario={inventarioList} />
    </Suspense>
  );
}

