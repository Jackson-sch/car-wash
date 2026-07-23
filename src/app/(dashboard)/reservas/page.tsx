export const dynamic = "force-dynamic";

import { ReservasClient } from "./reservas-client";
import { getReservasDelDia } from "@/lib/actions/reservas";

export default async function ReservasPage() {
  const { data } = await getReservasDelDia();

  return <ReservasClient initialReservas={data || []} />;
}
