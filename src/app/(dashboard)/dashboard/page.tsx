import { getDashboardData } from "@/lib/actions/dashboard";
import { DashboardClient } from "./dashboard-client";

export const metadata = {
  title: "Resumen Operativo - CarWash Pro",
  description: "Monitoreo en tiempo real de bahías, cola de lavado y balances de caja.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ vista?: string }>;
}) {
  const { vista } = await searchParams;
  const viewMode = vista === "todas" ? "todas" : "sucursal";

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
