export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedInventario } from "@/lib/data";
import { InventarioClient } from "./inventario-client";

export const metadata = {
  title: "Gestión de Inventario de Insumos - WashMaster Pro",
  description: "Registro de productos, control de stock y alertas automáticas de reposición.",
};

export default async function InventarioPage() {
  const session = await getSessionOrThrow({ modulo: "inventario", accion: "ver" });
  const inventarioList = await getCachedInventario(session.user.sucursalId!);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando inventario...</div>}>
      <InventarioClient initialInventario={inventarioList} />
    </Suspense>
  );
}

