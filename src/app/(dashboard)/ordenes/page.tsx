import { Suspense } from "react";
import { getOrdenes, getEmpleadosLavadores } from "@/lib/actions/ordenes";
import { OrdenesClient } from "./ordenes-client";

export const metadata = {
  title: "Bandeja de Órdenes - CarWash Pro",
  description: "Monitoreo y administración de las órdenes de lavado y asignaciones de personal.",
};

export default async function OrdenesPage() {
  const [ordenesList, lavadoresList] = await Promise.all([
    getOrdenes(),
    getEmpleadosLavadores(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando bandeja...</div>}>
      <OrdenesClient
        initialOrdenes={ordenesList}
        lavadores={lavadoresList}
      />
    </Suspense>
  );
}

