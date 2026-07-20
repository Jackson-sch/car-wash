import { getSucursalesList } from "@/lib/actions/sucursales";
import { SucursalesClient } from "./sucursales-client";
import type { SucursalItem } from "./components/types";

export const metadata = {
  title: "Administración de Sucursales - WashMaster Pro",
  description: "Administra los locales de servicio y datos comerciales de la empresa.",
};

export default async function SucursalesPage() {
  const res = await getSucursalesList();

  if (!res.success) {
    return (
      <div className="p-8 text-center text-destructive max-w-xl mx-auto bg-destructive/5 border border-destructive/20 rounded-2xl mt-12">
        <h2 className="font-bold text-lg">Error de Acceso</h2>
        <p className="text-sm mt-1 text-muted-foreground">
          {res.error || "No tienes permisos suficientes para ver esta sección."}
        </p>
      </div>
    );
  }

  return (
    <SucursalesClient
      initialSucursales={res.sucursales as SucursalItem[]}
      limiteSucursales={res.limiteSucursales}
      initialUserSucursalId={res.userSucursalId ?? null}
    />
  );
}
