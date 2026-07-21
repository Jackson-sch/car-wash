import { db } from "@/lib/db";
import { ordenes, vehiculos, clientes, sucursales } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ConsultaClient } from "./consulta-client";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ ticket: string }> }) {
  const { ticket } = await params;
  return {
    title: `Estado de Servicio #${ticket} — WashMaster Pro`,
    description: "Consulta el estado en vivo del lavado de tu vehículo en WashMaster Pro.",
  };
}

export default async function ConsultaPage({ params }: { params: Promise<{ ticket: string }> }) {
  const { ticket } = await params;

  // Buscar orden por número de ticket o ID
  const [orden] = await db
    .select({
      id: ordenes.id,
      nroTicket: ordenes.nroTicket,
      estado: ordenes.estado,
      total: ordenes.total,
      createdAt: ordenes.createdAt,
      updatedAt: ordenes.updatedAt,
      placa: vehiculos.placa,
      marca: vehiculos.marca,
      modelo: vehiculos.modelo,
      clienteNombre: clientes.nombre,
      clienteTelefono: clientes.telefono,
      sucursalNombre: sucursales.nombre,
      sucursalDireccion: sucursales.direccion,
      sucursalTelefono: sucursales.telefono,
    })
    .from(ordenes)
    .innerJoin(vehiculos, eq(ordenes.vehiculoId, vehiculos.id))
    .innerJoin(clientes, eq(vehiculos.clienteId, clientes.id))
    .innerJoin(sucursales, eq(ordenes.sucursalId, sucursales.id))
    .where(eq(ordenes.nroTicket, ticket.toUpperCase()));

  if (!orden) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-4 bg-card border border-border p-8 rounded-2xl shadow-lg">
          <div className="inline-block p-4 bg-rose-500/10 text-rose-400 rounded-full mb-2">
            🚗❌
          </div>
          <h1 className="text-xl font-black text-foreground uppercase">Ticket no Encontrado</h1>
          <p className="text-xs text-muted-foreground">
            No encontramos ningún servicio registrado con el ticket <span className="font-mono text-amber-400 font-bold">#{ticket}</span>. Por favor verifica el número impreso en tu comprobante.
          </p>
        </div>
      </div>
    );
  }

  return <ConsultaClient orden={orden as any} />;
}
