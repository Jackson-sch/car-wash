"use client";

import { useState } from "react";
import { Keyboard, ChevronUp, ChevronDown } from "lucide-react";

export function BandejaShortcutsDock() {
  const [isMinimized, setIsMinimized] = useState(false);

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsMinimized(false)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-card/90 backdrop-blur-md border border-border shadow-lg text-xs font-bold text-foreground hover:border-secondary transition-all cursor-pointer"
        >
          <Keyboard className="size-4 text-secondary" />
          <span>Atajos Bandeja</span>
          <ChevronUp className="size-3 text-muted-foreground" />
        </button>
      </div>
    );
  }

  return (
    <div className="sticky bottom-3 z-30 w-full mt-6">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-card/95 backdrop-blur-xl border border-border/90 rounded-2xl p-2.5 sm:px-4 shadow-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 shrink-0">
            <span className="p-1 rounded-md bg-secondary/15 text-secondary">
              <Keyboard className="size-3.5" />
            </span>
            <span className="font-extrabold text-[11px] uppercase tracking-wider text-foreground hidden sm:inline">
              Atajos Rápidos:
            </span>
          </div>

          {/* Quick pills */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar text-[11px]">
            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-secondary text-slate-950 font-mono font-black text-[10px] border border-secondary">
                N
              </kbd>
              <span className="font-bold text-foreground">Nueva Orden</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-foreground border border-border">
                /
              </kbd>
              <span className="text-muted-foreground">Buscar</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-foreground border border-border">
                P
              </kbd>
              <span className="text-muted-foreground">Patio</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-foreground border border-border">
                L
              </kbd>
              <span className="text-muted-foreground">Lista</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-foreground border border-border">
                T
              </kbd>
              <span className="text-muted-foreground">Modo TV</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono font-bold text-[10px] text-foreground border border-border">
                R
              </kbd>
              <span className="text-muted-foreground">Refrescar</span>
            </div>
          </div>

          {/* Minimize button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsMinimized(true)}
              title="Minimizar barra de atajos"
              className="p-1 rounded text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
