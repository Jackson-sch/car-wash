"use client";

import { useState, useTransition } from "react";
import { Settings, Building, Car, Gift } from "lucide-react";
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
    { id: "general" as const, label: "General Sucursal", icon: Building },
    { id: "precios" as const, label: "Precios por Vehículo", icon: Car },
    { id: "lealtad" as const, label: "Programa de Lealtad", icon: Gift },
  ];

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Settings className="h-7 w-7 text-secondary" />
          Configuración del Sistema
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Ajusta la información de la sucursal, factores de precios por vehículo y reglas de lealtad.
        </p>
      </div>

      {/* Premium Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted/50 border border-border w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all cursor-pointer ${
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Contents */}
      <div>
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
  );
}
