export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getSessionOrThrow } from "@/lib/actions/servicios";
import { getCachedEmpleados } from "@/lib/data";
import { EmpleadosClient } from "./empleados-client";

export const metadata = {
  title: "Gestión de Empleados y Comisiones - WashMaster Pro",
  description: "Monitoreo del personal, control de asistencia y comisiones acumuladas por lavado.",
};

export default async function EmpleadosPage() {
  const session = await getSessionOrThrow({ modulo: "empleados", accion: "ver" });
  const empleadosList = await getCachedEmpleados(session.user.sucursalId!);

  return (
    <Suspense fallback={<div className="p-8 text-center text-xs text-zinc-500">Cargando empleados...</div>}>
      <EmpleadosClient initialEmpleados={empleadosList} />
    </Suspense>
  );
}

