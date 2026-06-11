import { Suspense } from "react";
import { getCupones } from "@/lib/actions/cupones";
import { getServicios } from "@/lib/actions/servicios";
import { CuponesClient } from "./cupones-client";

export const metadata = {
  title: "Cupones | WashMaster Pro",
  description: "Generador de cupones y promociones",
};

export default async function CuponesPage() {
  const [cupones, servicios] = await Promise.all([
    getCupones(),
    getServicios(),
  ]);

  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando cupones...</div>}>
        <CuponesClient initialCupones={cupones} servicios={servicios} />
      </Suspense>
    </div>
  );
}
