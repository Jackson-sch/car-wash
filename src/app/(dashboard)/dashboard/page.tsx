import { DashboardClient } from "./dashboard-client";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedDashboardData } from "@/lib/data";

export const metadata = {
  title: "Resumen Operativo - WashMaster Pro",
  description: "Monitoreo en tiempo real de bahías, cola de lavado y balances de caja.",
};

/*
  La página del dashboard usa getCachedDashboardData() que tiene:
  - 'use cache' directive con cacheLife(stale=30s, revalidate=60s)
  - cacheTag('dashboard') para invalidación manual
  - La fecha actual se pasa como parámetro (dateStr) para que el cache key
    sea estable dentro del mismo día pero diferente entre días.
*/

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  let session;
  try {
    session = await getSessionOrThrow();
  } catch {
    return (
      <div className="p-6 text-center text-zinc-500">
        No autorizado. Por favor inicie sesión de nuevo.
      </div>
    );
  }

  const userRol = session.user?.rol;
  const isAuthorizedForGlobal = userRol === "admin" || userRol === "superadmin";

  const { vista } = await searchParams;
  const viewMode = (isAuthorizedForGlobal && vista === "todas") ? "todas" : "sucursal";

  // La fecha se pasa como string para estabilizar el cache key por día
  const dateStr = new Date().toISOString().split("T")[0];

  const sucursalId = session.user.sucursalId;
  if (!sucursalId) {
    return (
      <div className="p-6 text-center text-zinc-500">
        No se encontró una sucursal asignada a este usuario.
      </div>
    );
  }

  let data;
  try {
    data = await getCachedDashboardData(
      sucursalId,
      session.user.rol || "cajero",
      session.user.empresaId,
      viewMode,
      dateStr,
    );
  } catch (err) {
    console.error("Error al cargar datos del dashboard:", err);
    return (
      <div className="p-6 text-center text-rose-500">
        Error al cargar los datos del panel. Por favor recargue la página.
      </div>
    );
  }

  return (
    <DashboardClient
      kpis={data.kpis}
      salesTrendData={data.salesTrendData}
      ordenesEnCola={data.ordenesEnCola}
      turnoActivo={data.turnoActivo}
      vista={viewMode}
      sucursalesResumen={data.sucursalesResumen}
      sucursales={data.sucursales}
      currentBranch={data.currentBranch}
      userRol={session.user?.rol}
    />
  );
}
