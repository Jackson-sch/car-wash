"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { LayoutDashboard, Store } from "lucide-react";

export function DashboardViewSelector({ currentView }: { currentView: "todas" | "sucursal" }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const switchView = (view: "todas" | "sucursal") => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "todas") {
      params.set("vista", "todas");
    } else {
      params.delete("vista");
    }
    const query = params.toString();
    router.push(query ? `/dashboard?${query}` : "/dashboard");
  };

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border w-fit">
      <button
        onClick={() => switchView("sucursal")}
        data-active={currentView === "sucursal"}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm text-muted-foreground hover:text-foreground"
      >
        <Store className="h-3.5 w-3.5" />
        Esta Sucursal
      </button>
      <button
        onClick={() => switchView("todas")}
        data-active={currentView === "todas"}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer data-[active=true]:bg-background data-[active=true]:text-foreground data-[active=true]:shadow-sm text-muted-foreground hover:text-foreground"
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        Todas las Sucursales
      </button>
    </div>
  );
}
