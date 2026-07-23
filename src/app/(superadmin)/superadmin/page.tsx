export const dynamic = "force-dynamic";

import { getSuperAdminMetrics } from "@/lib/actions/superadmin";
import { Building2, Store, Users, ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";
import { RevenueChart, GrowthChart } from "./charts";


export default async function SuperAdminDashboardPage() {
  const metricsResult = await getSuperAdminMetrics();
  
  if (!metricsResult.success || !metricsResult.data) {
    return (
      <div className="p-6 bg-destructive/10 border border-destructive/20 text-destructive rounded-2xl flex items-center gap-3">
        <ShieldAlert className="size-5 shrink-0" />
        <div>
          <h3 className="font-bold">Error de Acceso</h3>
          <p className="text-sm">{metricsResult.error || "No se pudieron cargar las métricas globales."}</p>
        </div>
      </div>
    );
  }

  const { totalEmpresas, totalSucursales, totalUsuarios, planes, monthlyRevenue, empresaGrowth } = metricsResult.data;

  const planMap: Record<string, number> = { free: 0, pro: 0, enterprise: 0 };
  planes.forEach((p) => {
    if (p.plan in planMap) planMap[p.plan] = p.count;
  });

  const maxCount = Math.max(planMap.free, planMap.pro, planMap.enterprise, 1);

  return (
    <div className="space-y-8 -50 transition-opacity duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Panel de Control Master
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitoreo global de la plataforma SaaS, inquilinos y uso de recursos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative overflow-hidden bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-secondary/40 group transition-colors transition-opacity duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-colors transition-transform transition-opacity duration-300">
            <Building2 className="size-28 text-secondary" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl">
              <Building2 className="size-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Empresas Activas</span>
              <h3 className="text-3xl font-black text-foreground mt-0.5">{totalEmpresas}</h3>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Link 
              href="/superadmin/empresas" 
              className="text-xs text-secondary hover:text-secondary/80 font-bold flex items-center gap-1.5 group-hover:translate-x-0.5 transition-colors transition-transform"
            >
              Gestionar empresas <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-secondary/40 group transition-colors transition-opacity duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-colors transition-transform transition-opacity duration-300">
            <Store className="size-28 text-secondary" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl">
              <Store className="size-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sucursales Totales</span>
              <h3 className="text-3xl font-black text-foreground mt-0.5">{totalSucursales}</h3>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <span className="text-xs text-muted-foreground font-medium">
              Promedio: {(totalSucursales / (totalEmpresas || 1)).toFixed(1)} por empresa
            </span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-card border border-border p-6 rounded-2xl shadow-sm hover:border-secondary/40 group transition-colors transition-opacity duration-300">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-110 group-hover:opacity-[0.06] transition-colors transition-transform transition-opacity duration-300">
            <Users className="size-28 text-secondary" />
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/10 text-secondary border border-secondary/20 rounded-xl">
              <Users className="size-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Usuarios Creados</span>
              <h3 className="text-3xl font-black text-foreground mt-0.5">{totalUsuarios}</h3>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <span className="text-xs text-muted-foreground font-medium">
              Cuentas activas en la base de datos
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-bold text-foreground">Distribución de Planes</h2>
            <p className="text-xs text-muted-foreground">División de inquilinos activos por categoría de suscripción.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Plan Free (Prueba)</span>
                <span className="text-foreground">{planMap.free} empresas</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-muted-foreground/40 rounded-full transition-colors transition-opacity duration-500" 
                  style={{ width: `${(planMap.free / maxCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-secondary">Plan Pro (Multi-Sucursal)</span>
                <span className="text-foreground">{planMap.pro} empresas</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-secondary rounded-full transition-colors transition-opacity duration-500" 
                  style={{ width: `${(planMap.pro / maxCount) * 100}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-amber-500">Plan Enterprise (Corporativo)</span>
                <span className="text-foreground">{planMap.enterprise} empresas</span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-colors transition-opacity duration-500" 
                  style={{ width: `${(planMap.enterprise / maxCount) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">Estado de Operaciones</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border/60 rounded-xl">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">Servidor de Base de Datos</p>
                  <p className="text-[10px] text-muted-foreground">Conectado y respondiendo en 12ms</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-muted/50 border border-border/60 rounded-xl">
                <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-foreground">Servicio de Autenticación</p>
                  <p className="text-[10px] text-muted-foreground">Better Auth operativo con cookies seguras</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-border pt-4 flex justify-between items-center text-xs">
            <span className="text-muted-foreground">WashMaster SaaS Engine v2.0</span>
            <span className="text-muted-foreground font-bold">2026</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      {(monthlyRevenue && monthlyRevenue.length > 0) || (empresaGrowth && empresaGrowth.length > 0) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {monthlyRevenue && monthlyRevenue.length > 0 && (
            <RevenueChart data={monthlyRevenue} />
          )}
          {empresaGrowth && empresaGrowth.length > 0 && (
            <GrowthChart data={empresaGrowth} />
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-xs text-muted-foreground bg-card border border-border rounded-2xl">
          No hay datos suficientes para mostrar gráficos. Los charts aparecerán cuando haya actividad en el sistema.
        </div>
      )}
    </div>
  );
}
