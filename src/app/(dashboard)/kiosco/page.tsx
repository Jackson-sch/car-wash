import { getOrdenes, getEmpleadosLavadores } from "@/lib/actions/ordenes";
import { KioscoClient } from "./kiosco-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kiosco Live de Bahías - WashMaster Pro",
  description: "Monitor en vivo para taller y lavadores con cronómetro y semáforo de tiempo.",
};

export default async function KioscoPage() {
  const [ordenesList, lavadoresList] = await Promise.all([
    getOrdenes(),
    getEmpleadosLavadores(),
  ]);

  return <KioscoClient initialOrdenes={ordenesList} lavadores={lavadoresList} />;
}
