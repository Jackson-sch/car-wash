export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getEmpleadoRendimiento } from "@/lib/actions/empleados";
import { EmpleadoDetailClient } from "./empleado-detail-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const data = await getEmpleadoRendimiento(id);
  if (!data) {
    return {
      title: "Empleado no encontrado - WashMaster Pro",
    };
  }
  return {
    title: `Rendimiento de ${data.empleado.nombre} ${data.empleado.apellido || ""} - WashMaster Pro`,
    description: `Ficha de rendimiento, comisiones e historial de servicios del empleado.`,
  };
}

export default async function EmpleadoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const data = await getEmpleadoRendimiento(id);

  if (!data) {
    notFound();
  }

  return <EmpleadoDetailClient data={data} />;
}
