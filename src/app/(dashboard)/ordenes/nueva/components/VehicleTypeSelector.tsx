"use client";

import { 
  Car, 
  Truck, 
  Bike, 
  Layers
} from "lucide-react";
import { 
  VEHICULO_TIPOS_CONFIG, 
  type VehiculoTipo
} from "../hooks/useNuevaOrden";

interface VehicleTypeSelectorProps {
  vehiculoTipo: VehiculoTipo;
  setVehiculoTipo: (v: VehiculoTipo) => void;
  sucursalConfig?: { multipliers?: Record<string, number> };
}

function getVehicleIcon(tipo: VehiculoTipo) {
  switch (tipo) {
    case "moto":
      return Bike;
    case "camion":
    case "furgon":
      return Truck;
    case "pickup":
    case "suv":
    case "sedan":
    default:
      return Car;
  }
}

export function VehicleTypeSelector({
  vehiculoTipo,
  setVehiculoTipo,
  sucursalConfig = {},
}: VehicleTypeSelectorProps) {
  const dbMultipliers = sucursalConfig.multipliers || {};

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
            <Layers className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Tipo de Vehículo & Tarifa
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Ajusta automáticamente el multiplicador de precio para todos los servicios
            </p>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
          Alt + 1..7
        </span>
      </div>

      {/* Grid de 7 tipos táctiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {VEHICULO_TIPOS_CONFIG.map((opt) => {
          const isSelected = vehiculoTipo === opt.id;
          const Icon = getVehicleIcon(opt.id);
          const effectiveMultiplier = dbMultipliers[opt.id] ?? opt.defaultMultiplier;

          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setVehiculoTipo(opt.id)}
              className={`group relative p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-secondary/15 border-secondary ring-2 ring-secondary/40 shadow-sm shadow-secondary/15"
                  : "bg-background hover:bg-muted/60 border-border hover:border-secondary/40"
              }`}
            >
              {/* Header card: Icon + Shortcut number badge */}
              <div className="flex items-center justify-between w-full mb-1.5">
                <Icon
                  className={`size-4 transition-colors ${
                    isSelected ? "text-secondary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border transition-colors ${
                    isSelected
                      ? "bg-secondary text-slate-950 border-secondary"
                      : "bg-muted text-muted-foreground border-border group-hover:text-foreground"
                  }`}
                >
                  {opt.shortcut}
                </span>
              </div>

              {/* Title & Multiplier */}
              <div>
                <p
                  className={`text-xs font-bold truncate leading-tight ${
                    isSelected ? "text-foreground" : "text-slate-700 dark:text-slate-300 group-hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </p>
                <p className="text-[10px] font-semibold text-muted-foreground mt-0.5">
                  x{effectiveMultiplier.toFixed(1)}
                </p>
              </div>

              {/* Selected indicator dot */}
              {isSelected && (
                <div className="absolute top-1 right-1">
                  <span className="flex size-1.5 rounded-full bg-secondary" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
