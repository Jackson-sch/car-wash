export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedPaquetes, getCachedServicios } from "@/lib/data";
import { PaquetesClient } from "./paquetes-client";

export const metadata = {
  title: "Paquetes | WashMaster Pro",
  description: "Gestión de paquetes de servicios combinados",
};

export default async function PaquetesPage() {
  const session = await getSessionOrThrow({ modulo: "paquetes", accion: "ver" });
  const sucursalId = session.user.sucursalId!;

  const [paquetes, servicios] = await Promise.all([
    getCachedPaquetes(sucursalId),
    getCachedServicios(sucursalId),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando paquetes...</div>}>
        <PaquetesClient initialPaquetes={paquetes} servicios={servicios} />
      </Suspense>
    </div>
  );
}
