import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { db } from "@/lib/db";
import { empresas, configGlobal } from "@/lib/db/schema";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AmbientBackground } from "@/components/ui/ambient-background";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  // Verificar modo mantenimiento global
  const [globalConfig] = await db.select().from(configGlobal).limit(1);
  if (globalConfig?.mantenimientoActivo && session.user.rol !== "superadmin") {
    redirect("/mantenimiento");
  }

  // Verificar que la empresa del usuario esté activa
  if (session.user.empresaId) {
    const [empresa] = await db
      .select({ activo: empresas.activo })
      .from(empresas)
      .where(eq(empresas.id, session.user.empresaId))
      .limit(1);

    if (!empresa?.activo) {
      redirect("/suspendido");
    }
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden font-sans relative">
      {/* Sidebar Navigation */}
      <Sidebar userRole={session.user.rol} />

      {/* Main Content Area (Floating Inset Card) */}
      <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 shadow-sm">
        {/* Header Widget */}
        <Header />

        {/* Content Page wrapper */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Background soft glows */}
          <AmbientBackground />
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
