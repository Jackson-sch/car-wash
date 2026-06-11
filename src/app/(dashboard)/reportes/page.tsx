import { getReportesVentas } from "@/lib/actions/reportes";
import { ReportesClient } from "./reportes-client";

export const metadata = {
  title: "Reportes y Estadísticas - CarWash Pro",
  description: "Estadísticas de facturación, gráficos de ventas e informes de rendimiento de lavado.",
};

export default async function ReportesPage() {
  const reportesData = await getReportesVentas();

  return <ReportesClient initialData={reportesData} />;
}
