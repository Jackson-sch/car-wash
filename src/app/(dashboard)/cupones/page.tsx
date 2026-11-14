export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getCupones } from "@/lib/actions/cupones";
import { getServicios } from "@/lib/actions/servicios";
import { CuponesClient } from "./cupones-client";

export const metadata = {
  title: "Cupones | WashMaster Pro",
  description: "Generador de cupones y promociones",
};

export default async function CuponesPage() {
  const [rawCupones, servicios] = await Promise.all([
    getCupones(),
    getServicios(),
  ]);

  // Normalizar: mapear los cupones para tipos correctos
  const cupones = rawCupones.map((c) => ({
    id: c.id,
    codigo: c.codigo,
    activo: c.activo === true,
    tipoDescuento: c.tipoDescuento,
    valorDescuento: typeof c.valorDescuento === "string" ? parseFloat(c.valorDescuento) : c.valorDescuento,
    compraMinima: c.compraMinima ? parseFloat(c.compraMinima) : null,
    limiteTotal: c.limiteTotal ?? null,
    limitePorCliente: c.limitePorCliente ?? 1,
    fechaInicio: c.fechaInicio ? new Date(c.fechaInicio) : null,
    fechaFin: c.fechaFin ? new Date(c.fechaFin) : null,
    createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
    usos: c.usos,
    servicios: c.servicios,
  }));

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Cargando cupones...</div>}>
      <CuponesClient initialCupones={cupones} servicios={servicios} />
    </Suspense>
  );
}
