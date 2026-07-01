import { getDetalleCierreCaja } from "@/lib/actions/caja";
import { redirect } from "next/navigation";
import { CierreCajaClient } from "./cierre-client";

export const metadata = {
  title: "Cierre de Turno y Arqueo - WashMaster Pro",
  description: "Reconciliación de saldos y cierre de caja activo.",
};

export default async function CierreCajaPage() {
  const detalleCaja = await getDetalleCierreCaja();

  // Si no hay un turno activo o falla la carga, redirigimos a la página de caja principal
  if (!detalleCaja) {
    redirect("/caja");
  }

  return (
    <CierreCajaClient
      turno={detalleCaja.turno}
      resumen={detalleCaja.resumen}
      pagosRecientes={detalleCaja.pagosRecientes}
    />
  );
}
