import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedServicios, getCachedCategoriasServicio, getCachedInventario } from "@/lib/data";
import { ServiciosClient } from "./servicios-client";

export const metadata = {
  title: "Catálogo de Servicios - WashMaster Pro",
  description: "Gestión de los servicios ofrecidos, recetas de insumos y tarifas.",
};

export default async function ServiciosPage() {
  const session = await getSessionOrThrow();

  const [servicios, categorias, insumos] = await Promise.all([
    getCachedServicios(session.user.sucursalId!),
    getCachedCategoriasServicio(session.user.sucursalId!),
    getCachedInventario(session.user.sucursalId!),
  ]);

  return (
    <ServiciosClient
      initialServicios={servicios}
      initialCategorias={categorias}
      insumosDisponibles={insumos}
    />
  );
}

