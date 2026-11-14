"use client";

import Link from "next/link";
import { 
  Plus, 
  Tv, 
  Wallet, 
  Car, 
  Package, 
  CalendarClock,
  Sparkles,
  ArrowRight
} from "lucide-react";

interface QuickActionsBarProps {
  cajaAbierta?: boolean;
  saldoCaja?: number;
  activasCount?: number;
}

export function QuickActionsBar({
  cajaAbierta = false,
  saldoCaja = 0,
  activasCount = 0,
}: QuickActionsBarProps) {
  const actions = [
    {
      label: "Nueva Orden",
      subtitle: "Ingreso al patio",
      href: "/ordenes/nueva",
      icon: Plus,
      badge: "POS",
      color: "from-sky-500/10 to-blue-600/15 text-secondary border-secondary/30 hover:border-secondary shadow-xs",
      iconBg: "bg-secondary text-slate-950 font-black",
      highlight: true,
    },
    {
      label: "Modo TV Patio",
      subtitle: `${activasCount} en lavado`,
      href: "/kiosco",
      icon: Tv,
      badge: "LIVE",
      color: "bg-card/90 hover:bg-card border-border/80 hover:border-sky-500/40",
      iconBg: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20",
    },
    {
      label: "Caja y Turnos",
      subtitle: cajaAbierta ? `S/ ${saldoCaja.toFixed(2)}` : "Turno cerrado",
      href: "/caja",
      icon: Wallet,
      badge: cajaAbierta ? "ABIERTA" : "CERRADA",
      badgeColor: cajaAbierta ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
      color: "bg-card/90 hover:bg-card border-border/80 hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20",
    },
    {
      label: "Control de Patio",
      subtitle: "Bahías y tiempos",
      href: "/patio",
      icon: Car,
      color: "bg-card/90 hover:bg-card border-border/80 hover:border-secondary/40",
      iconBg: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20",
    },
    {
      label: "Inventario",
      subtitle: "Control de stock",
      href: "/inventario",
      icon: Package,
      color: "bg-card/90 hover:bg-card border-border/80 hover:border-secondary/40",
      iconBg: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20",
    },
    {
      label: "Reservas",
      subtitle: "Citas programadas",
      href: "/reservas",
      icon: CalendarClock,
      color: "bg-card/90 hover:bg-card border-border/80 hover:border-secondary/40",
      iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          Acciones Rápidas del Día
        </span>
        <span className="text-[11px] text-muted-foreground hidden sm:inline">
          Accesos directos a los módulos operativos más utilizados
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.label}
              href={act.href}
              className={`p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between group cursor-pointer hover:-translate-y-0.5 hover:shadow-md ${act.color}`}
            >
              <div className="flex items-center justify-between gap-1 mb-2">
                <div className={`p-1.5 rounded-lg ${act.iconBg} transition-transform group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
                {act.badge && (
                  <span className={`text-[9px] font-black uppercase px-1.5 py-0.2 rounded border ${act.badgeColor || "bg-secondary/20 text-secondary border-secondary/30"}`}>
                    {act.badge}
                  </span>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-extrabold text-foreground group-hover:text-secondary transition-colors truncate">
                    {act.label}
                  </p>
                  <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-secondary group-hover:translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
                </div>
                <p className="text-[11px] text-muted-foreground font-medium truncate mt-0.5">
                  {act.subtitle}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
