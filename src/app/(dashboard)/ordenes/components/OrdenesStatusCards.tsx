"use client";

import type { Orden } from "./OrdenesTable";
import { Layers, Clock, Droplets, CheckCircle2, DollarSign, LucideIcon } from "lucide-react";

interface StatusCardDef {
  id: string;
  label: string;
  color: string;
  activeBg: string;
  activeBorder: string;
  glowColor: string;
  icon: LucideIcon;
}

const STATUS_CARDS: StatusCardDef[] = [
  {
    id: "todos",
    label: "Todas",
    color: "text-zinc-700 dark:text-zinc-300",
    activeBg: "bg-zinc-500/5 dark:bg-zinc-500/10",
    activeBorder: "border-zinc-400 dark:border-zinc-500",
    glowColor: "from-zinc-500/10 dark:from-zinc-500/5 to-transparent",
    icon: Layers,
  },
  {
    id: "pendiente",
    label: "En Espera",
    color: "text-amber-600 dark:text-amber-400",
    activeBg: "bg-amber-500/5 dark:bg-amber-500/10",
    activeBorder: "border-amber-500 dark:border-amber-400",
    glowColor: "from-amber-500/10 dark:from-amber-500/5 to-transparent",
    icon: Clock,
  },
  {
    id: "en_proceso",
    label: "En Proceso",
    color: "text-sky-600 dark:text-sky-400",
    activeBg: "bg-sky-500/5 dark:bg-sky-500/10",
    activeBorder: "border-sky-500 dark:border-sky-400",
    glowColor: "from-sky-500/10 dark:from-sky-500/5 to-transparent",
    icon: Droplets,
  },
  {
    id: "completado",
    label: "Completadas",
    color: "text-emerald-600 dark:text-emerald-400",
    activeBg: "bg-emerald-500/5 dark:bg-emerald-500/10",
    activeBorder: "border-emerald-500 dark:border-emerald-400",
    glowColor: "from-emerald-500/10 dark:from-emerald-500/5 to-transparent",
    icon: CheckCircle2,
  },
  {
    id: "cobrado",
    label: "Cobradas",
    color: "text-violet-600 dark:text-violet-400",
    activeBg: "bg-violet-500/5 dark:bg-violet-500/10",
    activeBorder: "border-violet-500 dark:border-violet-400",
    glowColor: "from-violet-500/10 dark:from-violet-500/5 to-transparent",
    icon: DollarSign,
  },
];

interface OrdenesStatusCardsProps {
  ordenes: Orden[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
}

export function OrdenesStatusCards({ ordenes, activeFilter, onFilterChange }: OrdenesStatusCardsProps) {
  // Calculos de totales
  const countPorEstado = (estado: string) => {
    if (estado === "todos") return ordenes.length;
    return ordenes.filter((o) => o.estado === estado).length;
  };

  const totalRevenue = ordenes
    .filter((o) => o.estado === "cobrado")
    .reduce((sum, o) => sum + parseFloat(o.total || "0"), 0);

  const formatRevenue = (val: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getSubtext = (item: StatusCardDef) => {
    if (item.id === "todos") {
      return "Órdenes registradas hoy";
    }
    if (item.id === "cobrado") {
      return `Ingresos: ${formatRevenue(totalRevenue)}`;
    }
    const count = countPorEstado(item.id);
    if (ordenes.length === 0) return "0% del total";
    const pct = Math.round((count / ordenes.length) * 100);
    return `${pct}% del total de órdenes`;
  };

  return (
    <>
      {STATUS_CARDS.map((item) => {
        const isActive = activeFilter === item.id;
        const Icon = item.icon;
        const count = countPorEstado(item.id);
        const subtext = getSubtext(item);

        return (
          <button
            key={item.id}
            onClick={() => onFilterChange(item.id)}
            className={`p-4 rounded-2xl border text-left transition-all duration-300 relative overflow-hidden group cursor-pointer hover:-translate-y-0.5 hover:shadow-xs h-full w-full flex flex-col justify-between ${
              isActive
                ? `${item.activeBg} ${item.activeBorder} ring-2 ring-current/10 shadow-xs`
                : "border-border bg-card/45 backdrop-blur-md hover:border-zinc-400 dark:hover:border-zinc-700"
            }`}
          >
            {/* Ambient background glow on hover or active */}
            <div
              className={`absolute -right-6 -bottom-6 w-20 h-20 rounded-full bg-gradient-to-tr ${item.glowColor} blur-xl opacity-30 group-hover:opacity-75 transition-opacity duration-300`}
            />

            <div className="flex justify-between items-start gap-3 relative z-10 w-full">
              <div className="flex flex-col min-w-0">
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-muted-foreground truncate">
                  {item.label}
                </span>
                <div className={`text-2xl sm:text-3xl font-black mt-1 tracking-tight ${item.color}`}>
                  {count}
                </div>
              </div>
              <div
                className={`p-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/40 dark:border-zinc-800/40 ${item.color} group-hover:scale-105 transition-transform duration-300 shrink-0`}
              >
                <Icon className="h-4.5 w-4.5" />
              </div>
            </div>

            <div className="text-[10px] font-bold text-muted-foreground mt-3.5 flex items-center gap-1.5 border-t border-border/40 pt-2.5 relative z-10 w-full">
              <span className="truncate">{subtext}</span>
            </div>
          </button>
        );
      })}
    </>
  );
}

