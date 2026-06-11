import { Suspense } from "react";
import { getEmpleadosComisiones } from "@/lib/actions/empleados";
import { EmpleadosClient } from "./empleados-client";

export const metadata = {
  title: "Gestión de Empleados y Comisiones - CarWash Pro",
  description: "Monitoreo del personal, control de asistencia y comisiones acumuladas por lavado.",
};

export default async function EmpleadosPage() {
  const empleadosList = await getEmpleadosComisiones();

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando empleados...</div>}>
      <EmpleadosClient initialEmpleados={empleadosList} />
    </Suspense>
  );
}

