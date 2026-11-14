export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getClienteById } from "@/lib/actions/clientes";
import { ClienteDetailClient } from "./cliente-detail-client";

export const metadata = {
  title: "Ficha del Cliente - WashMaster Pro",
  description: "Ficha integral del cliente, flota de vehículos asociados, historial de órdenes y fidelización.",
};

export default async function ClienteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getClienteById(id);

  if (!data) notFound();

  return <ClienteDetailClient data={data} />;
}
