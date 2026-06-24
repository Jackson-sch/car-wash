import { Suspense } from "react";
import { getOrdenes, getEmpleadosLavadores } from "@/lib/actions/ordenes";
import { getTurnoActivo } from "@/lib/actions/caja";
import { OrdenesClient } from "./ordenes-client";

export const metadata = {
  title: "Bandeja de Órdenes - CarWash Pro",
  description: "Monitoreo y administración de las órdenes de lavado y asignaciones de personal.",
};

export default async function OrdenesPage() {
  const [ordenesList, lavadoresList, turnoActivo] = await Promise.all([
    getOrdenes(),
    getEmpleadosLavadores(),
    getTurnoActivo(),
  ]);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando bandeja...</div>}>
      <OrdenesClient
        initialOrdenes={ordenesList}
        lavadores={lavadoresList}
        cajaAbierta={!!turnoActivo}
      />
    </Suspense>
  );
}

