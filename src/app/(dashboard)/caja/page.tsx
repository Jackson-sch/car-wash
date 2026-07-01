import { getTurnoActivo, getTurnosHistorial } from "@/lib/actions/caja";
import { CajaClient } from "./caja-client";

export const metadata = {
  title: "Caja y Turnos - WashMaster Pro",
  description: "Administración de turnos de caja, cortes de efectivo e historial de transacciones.",
};

export default async function CajaPage() {
  const [turnoActivo, turnosHistorial] = await Promise.all([
    getTurnoActivo(),
    getTurnosHistorial(),
  ]);

  return (
    <CajaClient
      turnoActivo={turnoActivo}
      initialHistorial={turnosHistorial}
    />
  );
}
