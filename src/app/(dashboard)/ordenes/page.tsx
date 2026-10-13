import { getOrdenes, getEmpleadosLavadores } from "@/lib/actions/ordenes";
import { isCajaAbierta } from "@/lib/actions/caja";
import { getSucursalConfig } from "@/lib/actions/configuracion";
import { OrdenesClient } from "./ordenes-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Bandeja de Órdenes - WashMaster Pro",
  description: "Monitoreo y administración de las órdenes de lavado y asignaciones de personal.",
};

export default async function OrdenesPage() {
  const [ordenesList, lavadoresList, cajaAbierta, sucursal] = await Promise.all([
    getOrdenes(),
    getEmpleadosLavadores(),
    isCajaAbierta(),
    getSucursalConfig(),
  ]);

  return (
    <OrdenesClient
      initialOrdenes={ordenesList}
      lavadores={lavadoresList}
      cajaAbierta={cajaAbierta}
      sucursal={sucursal}
    />
  );
}

