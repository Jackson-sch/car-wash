"use client";

import type { Orden } from "./OrdenesTable";

interface StatusCardDef {
  id: string;
  label: string;
  color: string;
  activeBg: string;
}

const STATUS_CARDS: StatusCardDef[] = [
  { id: "todos", label: "Todas", color: "text-zinc-900", activeBg: "border-secondary/60 bg-secondary/5" },
  { id: "pendiente", label: "En Espera", color: "text-amber-600 dark:text-amber-400", activeBg: "border-amber-500/40 bg-amber-500/5 dark:bg-amber-500/10" },
  { id: "en_proceso", label: "En Proceso", color: "text-sky-600 dark:text-sky-400", activeBg: "border-secondary/40 bg-secondary/5" },
  { id: "completado", label: "Completadas", color: "text-emerald-600 dark:text-emerald-400", activeBg: "border-emerald-500/40 bg-emerald-500/5 dark:bg-emerald-500/10" },
  { id: "cobrado", label: "Cobradas", color: "text-zinc-600", activeBg: "border-zinc-500/40 bg-zinc-500/5" },
];

interface OrdenesStatusCardsProps {
  ordenes: Orden[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
}

export function OrdenesStatusCards({ ordenes, activeFilter, onFilterChange }: OrdenesStatusCardsProps) {
  const countPorEstado = (estado: string) => {
    if (estado === "todos") return ordenes.length;
    return ordenes.filter((o) => o.estado === estado).length;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {STATUS_CARDS.map((item) => {
        const isActive = activeFilter === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            className={`p-4 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer hover:scale-[1.02] shadow-[0_1px_3px_0_rgba(0,0,0,0.05)] ${
              isActive
                ? `${item.activeBg} border-current ring-1 ring-current/25`
                : "border-border bg-card/60 backdrop-blur-md hover:border-zinc-400"
            }`}
          >
            <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
              {item.label}
            </span>
            <div className={`text-xl sm:text-2xl font-black mt-1 ${item.color}`}>
              {countPorEstado(item.id)}
            </div>
            {/* Indicator removed for cleaner premium look */}
          </button>
        );
      })}
    </div>
  );
}
