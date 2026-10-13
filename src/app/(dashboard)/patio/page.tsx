import { getOrdenes } from "@/lib/actions/ordenes";
import { getSucursalConfig } from "@/lib/actions/configuracion";
import { PatioClient } from "./patio-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Pantalla de Patio (Modo TV) - WashMaster Pro",
  description: "Monitoreo operativo en vivo para lavadores y bahías de lavado.",
};

export default async function PatioPage() {
  const [ordenes, sucursal] = await Promise.all([
    getOrdenes(),
    getSucursalConfig(),
  ]);

  return <PatioClient initialOrdenes={ordenes} sucursal={sucursal} />;
}
