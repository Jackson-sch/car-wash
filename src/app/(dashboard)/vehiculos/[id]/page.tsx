import { notFound } from "next/navigation";
import { getVehiculoById } from "@/lib/actions/vehiculos";
import { VehiculoDetailClient } from "./vehiculo-detail-client";

export const metadata = {
  title: "Detalle del Vehículo | WashMaster Pro",
};

export default async function VehiculoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await getVehiculoById(id);

  if (!data) notFound();

  return <VehiculoDetailClient data={data} />;
}
