"use client";

import { useState, useTransition } from "react";
import { Settings, Building, Car, Gift } from "lucide-react";
import Link from "next/link";
import { updateSucursalInfo, updateSucursalConfigJSON } from "@/lib/actions/configuracion";
import { toast } from "sonner";
import { GeneralPanel } from "./components/GeneralPanel";
import { PreciosPanel } from "./components/PreciosPanel";
import { LealtadPanel } from "./components/LealtadPanel";

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  logoUrl: string | null;
  config: unknown;
}

interface ConfiguracionClientProps {
  initialSucursal: Sucursal;
}

export function ConfiguracionClient({ initialSucursal }: ConfiguracionClientProps) {
  const [sucursal, setSucursal] = useState<Sucursal>(initialSucursal);
  const [activeTab, setActiveTab] = useState<"general" | "precios" | "lealtad">("general");
  const [isPending, startTransition] = useTransition();

  const config = (sucursal.config as Record<string, any>) || {};

  const handleSaveInfo = async (data: {
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    ruc: string;
    logoUrl: string;
  }) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await updateSucursalInfo(data);
        if (res.success && res.data) {
          toast.success("Información de la sucursal actualizada");
          setSucursal((prev) => ({ ...prev, ...res.data }));
        } else {
          toast.error(res.error || "Ocurrió un error");
        }
        resolve();
      });
    });
  };

  const handleSaveMultipliers = async (multipliers: Record<string, number>) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await updateSucursalConfigJSON({ multipliers });
        if (res.success && res.data) {
          toast.success("Tarifas por tipo de vehículo guardadas");
          setSucursal((prev) => ({ ...prev, ...res.data }));
        } else {
          toast.error(res.error || "Ocurrió un error");
        }
        resolve();
      });
    });
  };

  const handleSaveLoyaltyRules = async (puntosPorSol: string, solesPorPunto: string) => {
    return new Promise<void>((resolve) => {
      startTransition(async () => {
        const res = await updateSucursalConfigJSON({
          loyalty: {
            puntosPorSol: parseFloat(puntosPorSol) || 1,
            solesPorPunto: parseFloat(solesPorPunto) || 0.05,
          },
        });
        if (res.success && res.data) {
          toast.success("Reglas del programa de lealtad actualizadas");
          setSucursal((prev) => ({ ...prev, ...res.data }));
        } else {
          toast.error(res.error || "Ocurrió un error");
        }
        resolve();
      });
    });
  };

  const tabs = [
    {
      id: "general" as const,
      label: "General Sucursal",
      description: "Datos de la sucursal y contacto",
      icon: Building,
    },
    {
      id: "precios" as const,
      label: "Precios por Vehículo",
      description: "Multiplicadores por vehículo",
      icon: Car,
    },
    {
      id: "lealtad" as const,
      label: "Programa de Lealtad",
      description: "Reglas de puntos y canjes",
      icon: Gift,
    },
    {
      id: "sucursales" as const,
      label: "Gestión de Sucursales",
      description: "Locales y límites de plan",
      icon: Building,
      href: "/configuracion/sucursales",
    },
  ];

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-secondary animate-spin-slow" />
          Configuración del Sistema
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajusta la información de la sucursal, factores de precios por vehículo y reglas de lealtad.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-1.5 bg-card/30 p-2.5 rounded-2xl border border-border/60">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const hasHref = "href" in tab;
            const isActive = !hasHref && activeTab === tab.id;
            
            const btnClassName = `flex items-center gap-3 w-full text-left px-3.5 py-3 text-sm font-semibold rounded-xl transition-all cursor-pointer border ${
              isActive
                ? "bg-secondary/10 dark:bg-secondary/20 text-secondary border-secondary/20 shadow-xs"
                : "bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 border-transparent"
            }`;

            const innerContent = (
              <>
                <div
                  className={`p-2 rounded-lg transition-colors shrink-0 ${
                    isActive
                      ? "bg-secondary text-white"
                      : "bg-muted/65 dark:bg-muted/30 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div className="min-w-0">
                  <div className="font-extrabold text-foreground leading-none text-xs sm:text-sm">
                    {tab.label}
                  </div>
                  <div className="text-[10px] text-muted-foreground/85 font-semibold mt-1 truncate">
                    {tab.description}
                  </div>
                </div>
              </>
            );

            if (hasHref && tab.href) {
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={btnClassName}
                >
                  {innerContent}
                </Link>
              );
            }

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "general" | "precios" | "lealtad")}
                className={btnClassName}
              >
                {innerContent}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="animate-in fade-in slide-in-from-right-3 duration-300">
            {activeTab === "general" && (
              <GeneralPanel sucursal={sucursal} isPending={isPending} onSave={handleSaveInfo} />
            )}

            {activeTab === "precios" && (
              <PreciosPanel
                initialMultipliers={config.multipliers || {}}
                isPending={isPending}
                onSave={handleSaveMultipliers}
              />
            )}

            {activeTab === "lealtad" && (
              <LealtadPanel
                initialPuntosPorSol={config.loyalty?.puntosPorSol?.toString() || "1"}
                initialSolesPorPunto={config.loyalty?.solesPorPunto?.toString() || "0.05"}
                isPending={isPending}
                onSave={handleSaveLoyaltyRules}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
