import { getDashboardData } from "@/lib/actions/dashboard";
import { DashboardClient } from "./dashboard-client";
import { getSessionOrThrow } from "@/lib/actions/servicios";

export const metadata = {
  title: "Resumen Operativo - WashMaster Pro",
  description: "Monitoreo en tiempo real de bahías, cola de lavado y balances de caja.",
};

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

  let data;
  try {
    data = await getDashboardData(viewMode);
  } catch {
    return (
      <div className="p-6 text-center text-zinc-500">
        No autorizado. Por favor inicie sesión de nuevo.
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
    />
  );
}
