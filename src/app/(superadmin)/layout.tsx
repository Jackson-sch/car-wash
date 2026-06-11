import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth/config";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

export const dynamic = "force-dynamic";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificación de sesión de Super Admin en el servidor
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  if (session.user.rol !== "superadmin") {
    redirect("/dashboard");
  }

  return (
    <SidebarProvider className="h-screen overflow-hidden font-sans relative">
      {/* Background soft glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[130px] pointer-events-none z-0" />

      {/* Sidebar Navigation */}
      <Sidebar userRole={session.user.rol} />

      {/* Main Content Area */}
      <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden bg-background relative z-10 shadow-sm">
        {/* Header Widget */}
        <Header />

        {/* Content Page wrapper */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
