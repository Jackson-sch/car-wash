import { Suspense } from "react";
import { getServicios, getCategoriasServicio } from "@/lib/actions/servicios";
import { ServiciosClient } from "./servicios-client";

export const metadata = {
  title: "Catálogo de Servicios - WashMaster Pro",
  description: "Gestión de los servicios ofrecidos, tarifas y duración de lavado.",
};

export default async function ServiciosPage() {
  // Obtener datos del servidor
  const servicios = await getServicios();
  const categorias = await getCategoriasServicio();

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando servicios...</div>}>
      <ServiciosClient
        initialServicios={servicios}
        initialCategorias={categorias}
      />
    </Suspense>
  );
}

