import { getOrdenById } from "@/lib/actions/ordenes";
import { getSucursalConfig } from "@/lib/actions/configuracion";
import { notFound } from "next/navigation";
import { TicketClient } from "./ticket-client";

export const metadata = {
  title: "Ticket de Servicio - CarWash Pro",
  description: "Visualización e impresión de ticket de trabajo.",
};

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TicketPage({ params }: Props) {
  const { id } = await params;
  const [orden, sucursal] = await Promise.all([
    getOrdenById(id),
    getSucursalConfig(),
  ]);

  if (!orden) {
    notFound();
  }

  return (
    <TicketClient
      orden={orden}
      sucursal={sucursal}
    />
  );
}
