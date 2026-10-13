import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { empresas, configGlobal } from "@/lib/db/schema";

interface AuthGateProps {
  children: React.ReactNode;
}

/**
 * AuthGate — verificación de autenticación para el layout del dashboard.
 *
 * Se renderiza dentro de un <Suspense> en el layout, permitiendo que
 * Next.js sirva el sidear y estructura base mientras auth se resuelve.
 *
 * - Si no hay sesión → redirect a /login
 * - Si el sistema está en mantenimiento → redirect a /mantenimiento
 * - Si la empresa está suspendida → redirect a /suspendido
 * - Si todo ok → renderiza children
 */
export default async function AuthGate({ children }: AuthGateProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
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
