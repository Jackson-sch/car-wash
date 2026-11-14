export const dynamic = "force-dynamic";

import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedReportesVentas } from "@/lib/data";
import { ReportesClient } from "./reportes-client";

export const metadata = {
  title: "Reportes y Estadísticas - WashMaster Pro",
  description: "Estadísticas de facturación, gráficos de ventas e informes de rendimiento de lavado.",
};

interface ReportesPageProps {
  searchParams?: Promise<{ rango?: string; demo?: string }>;
}

export default async function ReportesPage({ searchParams }: ReportesPageProps) {
  const session = await getSessionOrThrow();
  const params = searchParams ? await searchParams : {};
  const rango = params.rango || "7d";

  // Reportes se cachean 2 minutos (datos históricos, no crítica la frescura)
  const reportesData = await getCachedReportesVentas(session.user.sucursalId!, rango);

  return <ReportesClient initialData={reportesData} currentRango={rango} />;
}
