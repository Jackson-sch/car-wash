export const dynamic = "force-dynamic";

import { ReservasClient } from "./reservas-client";
import { getReservasDelDia, getServiciosParaReservas } from "@/lib/actions/reservas";

export const metadata = {
  title: "Agenda & Citas | WashMaster Pro",
  description: "Control de reservas, citas programadas y flujo por bahías de lavado.",
};

export default async function ReservasPage() {
  const [{ data }, servicios] = await Promise.all([
    getReservasDelDia(),
    getServiciosParaReservas(),
  ]);

  return <ReservasClient initialReservas={data || []} serviciosDisponibles={servicios} />;
}
