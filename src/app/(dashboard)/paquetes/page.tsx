import { Suspense } from "react";
import { getPaquetes } from "@/lib/actions/paquetes";
import { getServicios } from "@/lib/actions/servicios";
import { PaquetesClient } from "./paquetes-client";

export const metadata = {
  title: "Paquetes | WashMaster Pro",
  description: "Gestión de paquetes de servicios combinados",
};

export default async function PaquetesPage() {
  const [paquetes, servicios] = await Promise.all([
    getPaquetes(),
    getServicios(),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando paquetes...</div>}>
        <PaquetesClient initialPaquetes={paquetes} servicios={servicios} />
      </Suspense>
    </div>
  );
}
