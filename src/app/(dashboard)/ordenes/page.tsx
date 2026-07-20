import { getOrdenes, getEmpleadosLavadores } from "@/lib/actions/ordenes";
import { getTurnoActivo } from "@/lib/actions/caja";
import { OrdenesClient } from "./ordenes-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandeja de Órdenes - WashMaster Pro",
  description: "Monitoreo y administración de las órdenes de lavado y asignaciones de personal.",
};

export default async function OrdenesPage() {
  const [ordenesList, lavadoresList, turnoActivo] = await Promise.all([
    getOrdenes(),
    getEmpleadosLavadores(),
    getTurnoActivo(),
  ]);

  return (
    <OrdenesClient
      initialOrdenes={ordenesList}
      lavadores={lavadoresList}
      cajaAbierta={!!turnoActivo}
    />
  );
}

