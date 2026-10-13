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
    <div className="border border-border/80 bg-card/60 backdrop-blur-sm rounded-2xl p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between">
        {STEPS.map((item, index) => {
          const isActive = step === item.step;
          const isDone = step > item.step;
          const Icon = item.icon;

          return (
            <div key={item.step} className="flex-1 flex items-center">
              {/* Step indicator */}
              <div className="flex items-center gap-3">
                <div
                  className={`size-10 rounded-xl flex items-center justify-center font-black text-xs border transition-all shrink-0 ${
                    isDone
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                      : isActive
                      ? "bg-secondary text-secondary-foreground border-secondary shadow-md shadow-secondary/20 ring-4 ring-secondary/15"
                      : "bg-muted/50 border-border text-muted-foreground"
                  }`}
                >
                  {isDone ? (
                    <span className="text-sm font-black">✓</span>
                  ) : (
                    <Icon className="size-4.5" />
                  )}
                </div>

                <div className="hidden sm:block text-left">
                  <p
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      isActive
                        ? "text-secondary"
                        : isDone
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-muted-foreground/80"
                    }`}
                  >
                    Paso {item.step}
                  </p>
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isActive
                        ? "text-foreground"
                        : isDone
                        ? "text-foreground/90"
                        : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
              </div>

              {/* Connecting line to next step */}
              {index < STEPS.length - 1 && (
                <div className="flex-1 mx-3 sm:mx-6 h-0.5 rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      step > item.step ? "w-full bg-emerald-500" : "w-0"
                    }`}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
