"use client";

import { useState } from "react";
import { Car, Save, Gauge, Bike, Truck, Van, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const VEHICULOS = [
  { id: "sedan", label: "Sedán", icon: Car },
  { id: "suv", label: "SUV", icon: Gauge },
  { id: "pickup", label: "Pick-up", icon: Truck },
  { id: "moto", label: "Moto", icon: Bike },
  { id: "camion", label: "Camión", icon: Truck },
  { id: "furgon", label: "Furgón", icon: Van },
  { id: "otro", label: "Otro", icon: Sparkles },
];

interface PreciosPanelProps {
  initialMultipliers: Record<string, number>;
  isPending: boolean;
  onSave: (multipliers: Record<string, number>) => Promise<void>;
}

export function PreciosPanel({ initialMultipliers, isPending, onSave }: PreciosPanelProps) {
  const [multipliers, setMultipliers] = useState<Record<string, number>>(initialMultipliers);

  const handleSave = async () => {
    await onSave(multipliers);
  };

  return (
    <Card className="border-border bg-card shadow-sm max-w-2xl">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Multiplicadores de Tarifa</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Define el factor de costo según el tipo de vehículo. El precio base se multiplica por este factor.
            </p>
          </div>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {VEHICULOS.map((v) => {
            const Icon = v.icon;
            return (
              <div
                key={v.id}
                className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-muted/30 hover:border-zinc-350 hover:bg-muted/50 transition-all"
              >
                <span className="text-sm font-bold text-foreground flex items-center gap-2.5">
                  <Icon className="h-4 w-4 text-secondary" />
                  {v.label}
                </span>
                <div className="flex items-center gap-2 w-28">
                  <span className="text-xs text-muted-foreground font-medium">x</span>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={multipliers[v.id] ?? 1.0}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1.0;
                      setMultipliers((prev) => ({ ...prev, [v.id]: val }));
                    }}
                    className="bg-card border-border text-center text-xs h-8 rounded-lg"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-4 flex justify-end border-t border-border">
          <Button
            onClick={handleSave}
            disabled={isPending}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-6"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar Tarifas"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
