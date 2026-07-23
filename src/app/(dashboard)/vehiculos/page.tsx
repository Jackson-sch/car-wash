export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getVehiculos } from "@/lib/actions/vehiculos";
import { VehiculosClient } from "./vehiculos-client";

export const metadata = {
  title: "Vehículos | WashMaster Pro",
  description: "Registro de vehículos y sus propietarios",
};

export default async function VehiculosPage() {
  const vehiculos = await getVehiculos();

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando vehículos...</div>}>
      <VehiculosClient initialVehiculos={vehiculos} />
    </Suspense>
  );
}
