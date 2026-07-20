"use client";

import { User, Layers, Sparkles } from "lucide-react";

interface StepperHeaderProps {
  step: number;
}

const STEPS = [
  { step: 1, label: "Cliente y Vehículo", icon: User },
  { step: 2, label: "Servicios y Costo", icon: Layers },
  { step: 3, label: "Operación & Notas", icon: Sparkles },
] as const;

export function StepperHeader({ step }: StepperHeaderProps) {

  return (
    <div className="flex items-center justify-between border-b border-zinc-200 pb-6">        {STEPS.map((item) => {
        const isActive = step === item.step;
        const isDone = step > item.step;

        return (
          <div
            key={item.step}
            className={`flex items-center gap-3 ${
              isActive
                ? "text-secondary"
                : isDone
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-zinc-500"
            }`}
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center font-bold text-xs border transition-all ${
                isActive
                  ? "bg-secondary/10 border-secondary text-secondary"
                  : isDone
                  ? "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-500 text-emerald-600 dark:text-emerald-400"
                  : "bg-zinc-50 border-zinc-200 text-zinc-500"
              }`}
            >
              {item.step}
            </div>
            <span className="text-xs font-bold hidden sm:inline">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}
