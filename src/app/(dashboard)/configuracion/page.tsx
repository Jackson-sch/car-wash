import { getSucursalConfig } from "@/lib/actions/configuracion";
import { ConfiguracionClient } from "./configuracion-client";

export const metadata = {
  title: "Configuración del Sistema - WashMaster Pro",
  description: "Configura la sucursal, las tarifas de vehículos y las reglas de lealtad.",
};

export default async function ConfiguracionPage() {
  const sucursal = await getSucursalConfig();

  if (!sucursal) {
    return (
      <div className="p-6 text-center text-zinc-500">
        No se encontró información de la sucursal asociada a su cuenta. Contacte al administrador.
      </div>
    );
  }

  return <ConfiguracionClient initialSucursal={sucursal} />;
}
