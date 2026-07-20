import { Suspense } from "react";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedClientes } from "@/lib/data";
import { ClientesClient } from "./clientes-client";

export const metadata = {
  title: "Directorio de Clientes - WashMaster Pro",
  description: "Gestión de clientes, historial de visitas y programa de lealtad por puntos.",
};

export default async function ClientesPage() {
  const session = await getSessionOrThrow({ modulo: "clientes", accion: "ver" });
  const clientesList = await getCachedClientes(session.user.sucursalId!);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando clientes...</div>}>
      <ClientesClient initialClientes={clientesList} />
    </Suspense>
  );
}

