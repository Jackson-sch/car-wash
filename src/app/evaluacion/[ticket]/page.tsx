export const dynamic = "force-dynamic";

import { EvaluacionClient } from "./evaluacion-client";
import { db } from "@/lib/db";
import { ordenes, sucursales, vehiculos } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ ticket: string }> }) {
  const { ticket } = await params;
  return {
    title: `Calificar Servicio - Ticket #${ticket.toUpperCase()}`,
    description: "Encuesta de satisfacción del cliente en WashMaster Pro",
  };
}

export default async function EvaluacionPage({ params }: { params: Promise<{ ticket: string }> }) {
  const { ticket } = await params;
  const cleanTicket = ticket.trim().toUpperCase();

  const [orden] = await db
    .select({
      id: ordenes.id,
      nroTicket: ordenes.nroTicket,
      estado: ordenes.estado,
      placa: vehiculos.placa,
      sucursalNombre: sucursales.nombre,
    })
    .from(ordenes)
    .innerJoin(sucursales, eq(ordenes.sucursalId, sucursales.id))
    .leftJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
    .where(eq(ordenes.nroTicket, cleanTicket))
    .limit(1);

  if (!orden) {
    notFound();
  }

  return <EvaluacionClient orden={orden} />;
}
