import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { empresas, configGlobal } from "@/lib/db/schema";
import { getSessionOrThrow } from "@/lib/actions/servicios";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * AuthGate — verificación de autenticación para el layout del dashboard.
 *
 * Se renderiza dentro de un <Suspense> en el layout, permitiendo que
 * Next.js sirva el sidebar y estructura base mientras auth se resuelve.
 *
 * Utiliza getSessionOrThrow() memoizado con React.cache() para deduplicar
 * llamadas dentro del mismo ciclo de request.
 */
export default async function AuthGate({ children }: AuthGateProps) {
  let session;
  try {
    session = await getSessionOrThrow();
  } catch {
    redirect("/login");
  }

  // Verificar modo mantenimiento global y estado de empresa en paralelo
  const [globalConfigResult, empresaResult] = await Promise.all([
    db
      .select({ mantenimientoActivo: configGlobal.mantenimientoActivo })
      .from(configGlobal)
      .limit(1),
    session.user.empresaId
      ? db
          .select({ activo: empresas.activo })
          .from(empresas)
          .where(eq(empresas.id, session.user.empresaId))
          .limit(1)
      : Promise.resolve([]),
  ]);

  const globalConfig = globalConfigResult[0];
  if (globalConfig?.mantenimientoActivo && session.user.rol !== "superadmin") {
    redirect("/mantenimiento");
  }

  const empresa = empresaResult[0];
  if (session.user.empresaId && empresa && !empresa.activo) {
    redirect("/suspendido");
  }

  return <>{children}</>;
}
