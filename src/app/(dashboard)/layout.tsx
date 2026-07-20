import { Suspense } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AmbientBackground } from "@/components/ui/ambient-background";
import AuthGate from "@/components/layout/AuthGate";
import PageSkeleton from "@/components/ui/page-skeleton";

/*
  Layout PPR (Partial Prerendering) — verano 2026.

  Estrategia:
  ┌──────────────────────────────────────────────────┐
  │ 1. SidebarProvider (estático - prerenderizado)   │
  │ 2. Suspense boundary ─────────────────────────── │
  │    ├─ AuthGate (dinámico - conexión deferida)    │
  │    └─ children (streaming vía Suspense)          │
  └──────────────────────────────────────────────────┘

  El shell (SidebarProvider, estructura HTML base) se sirve
  desde CDN inmediatamente. La autenticación se verifica en
  el request (connection() + headers()) y el contenido
  fluye via Suspense.

  NOTA: NO usar force-dynamic. El layout contiene Suspense
  boundaries que Next.js usa para PPR. Los componentes que
  necesitan headers()/cookies() se encargan de deferirse.
*/

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider className="h-screen overflow-hidden font-sans relative">
      {/* Sidebar — estático, prerenderizado */}
      <Sidebar />

      {/* Main Content Area */}
      <SidebarInset className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10 shadow-sm">
        {/* Header — contenido dentro de AuthGate */}
        <Suspense fallback={<div className="h-14 border-b border-border bg-card/50" />}>
          <AuthGate>
            <Header />

            {/* Content Page wrapper */}
            <main className="flex-1 overflow-y-auto p-6">
              <AmbientBackground />
              <div className="max-w-7xl mx-auto w-full animate-in fade-in slide-in-from-bottom-2 duration-500">
                <Suspense fallback={<PageSkeleton />}>
                  {children}
                </Suspense>
              </div>
            </main>
          </AuthGate>
        </Suspense>
      </SidebarInset>
    </SidebarProvider>
  );
}
