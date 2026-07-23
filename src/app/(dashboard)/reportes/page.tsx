export const dynamic = "force-dynamic";

import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedReportesVentas } from "@/lib/data";
import { ReportesClient } from "./reportes-client";

export const metadata = {
  title: "Reportes y Estadísticas - WashMaster Pro",
  description: "Estadísticas de facturación, gráficos de ventas e informes de rendimiento de lavado.",
};

export default async function ReportesPage() {
  const session = await getSessionOrThrow();

  // Reportes se cachean 2 minutos (datos históricos, no crítica la frescura)
  const reportesData = await getCachedReportesVentas(session.user.sucursalId!);

  return <ReportesClient initialData={reportesData} />;
}
