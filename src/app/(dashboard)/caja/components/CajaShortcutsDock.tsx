"use client";

import { useState } from "react";
import { Keyboard, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface CajaShortcutsDockProps {
  className?: string;
}

export function CajaShortcutsDock({ className }: CajaShortcutsDockProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-200 select-none",
        className
      )}
    >
      <div className="bg-card/90 backdrop-blur-md border border-border/80 shadow-2xl rounded-2xl px-3.5 py-1.5 flex items-center gap-3 text-xs text-foreground">
        <div className="flex items-center gap-1.5 font-bold text-muted-foreground text-[11px] pr-2 border-r border-border/80">
          <Keyboard className="size-3.5 text-secondary" />
          <span className="hidden sm:inline">ATAJOS:</span>
        </div>

        {!isMinimized && (
          <div className="flex items-center gap-2.5 text-[11px]">
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-[10px] text-foreground">
                C
              </kbd>
              <span className="text-muted-foreground hidden sm:inline">Cerrar Turno</span>
            </div>

            <span className="text-border">•</span>

            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-[10px] text-foreground">
                E
              </kbd>
              <span className="text-muted-foreground hidden sm:inline">Egreso (-)</span>
            </div>

            <span className="text-border">•</span>

            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-[10px] text-foreground">
                X
              </kbd>
              <span className="text-muted-foreground hidden sm:inline">Corte X</span>
            </div>

            <span className="text-border">•</span>

            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border font-mono font-bold text-[10px] text-foreground">
                /
              </kbd>
              <span className="text-muted-foreground hidden sm:inline">Buscar</span>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsMinimized((prev) => !prev)}
          className="text-muted-foreground hover:text-foreground p-0.5 rounded-lg hover:bg-muted cursor-pointer transition-colors"
          title={isMinimized ? "Expandir atajos" : "Minimizar atajos"}
        >
          {isMinimized ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>
      </div>
    </div>
  );
}
