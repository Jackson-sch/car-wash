import { getServicios } from "@/lib/actions/servicios";
import { getEmpleadosLavadores } from "@/lib/actions/ordenes";
import { getSucursalConfig } from "@/lib/actions/configuracion";
import { NuevaOrdenClient } from "./nueva-client";

export const metadata = {
  title: "Nueva Orden de Servicio - CarWash Pro",
  description: "Registra vehículos y clientes para iniciar un nuevo lavado.",
};

export default async function NuevaOrdenPage() {
  const [servicios, lavadores, sucursal] = await Promise.all([
    getServicios(),
    getEmpleadosLavadores(),
    getSucursalConfig(),
  ]);

  return (
    <NuevaOrdenClient
      servicios={servicios}
      lavadores={lavadores}
      sucursalConfig={sucursal?.config as Record<string, any> || {}}
    />
  );
}
