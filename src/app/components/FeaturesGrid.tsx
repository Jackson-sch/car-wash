"use client";

import { Car, Coins, TrendingUp, Gift, Building2, Smartphone, ArrowUpRight } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Car,
    title: "Control de Bahías en Vivo",
    desc: "Seguimiento en tiempo real por patente y placa. Tablero Kanban operativo interactivo con inspección gráfica de carrocería y tickets.",
    badge: "Tiempo Real",
    accent: "sky",
  },
  {
    icon: Coins,
    title: "Arqueo Ciego & Bóveda",
    desc: "Cierre de turno con desglose de billetes y monedas. Conciliación automática de POS y billeteras digitales (Yape / Plin) sin discrepancias.",
    badge: "Auditoría Total",
    accent: "emerald",
  },
  {
    icon: TrendingUp,
    title: "Analítica de Rendimiento",
    desc: "Predicción de horas de alta demanda, tickets promedio por tipo de vehículo y optimización automática de personal en patio.",
    badge: "Métricas Clave",
    accent: "amber",
  },
  {
    icon: Gift,
    title: "Fidelización & Puntos",
    desc: "Retención automatizada: acumulación de puntos por cada servicio realizado y canjes inmediatos con descuentos calculados en caja.",
    badge: "Retención +35%",
    accent: "rose",
  },
  {
    icon: Building2,
    title: "Gestión Multi-Sede Global",
    desc: "Conmutador instantáneo entre sucursales de trabajo con aislamiento estricto de caja, inventarios de insumos y personal por local.",
    badge: "Multi-Tenant",
    accent: "indigo",
  },
  {
    icon: Smartphone,
    title: "Experiencia Nativa PWA",
    desc: "Instalación en un clic en Mac, iPad, iPhone y PC con soporte offline garantizado para continuar operando aún sin conexión a internet.",
    badge: "Offline Ready",
    accent: "cyan",
  },
];

const accentColors: Record<string, { iconBg: string; iconColor: string; badgeBorder: string; badgeBg: string; badgeText: string }> = {
  sky: {
    iconBg: "bg-sky-400/10 border-sky-400/20",
    iconColor: "text-sky-400",
    badgeBorder: "border-sky-400/20",
    badgeBg: "bg-sky-400/10",
    badgeText: "text-sky-300",
  },
  emerald: {
    iconBg: "bg-emerald-400/10 border-emerald-400/20",
    iconColor: "text-emerald-400",
    badgeBorder: "border-emerald-400/20",
    badgeBg: "bg-emerald-400/10",
    badgeText: "text-emerald-300",
  },
  amber: {
    iconBg: "bg-amber-400/10 border-amber-400/20",
    iconColor: "text-amber-400",
    badgeBorder: "border-amber-400/20",
    badgeBg: "bg-amber-400/10",
    badgeText: "text-amber-300",
  },
  rose: {
    iconBg: "bg-rose-400/10 border-rose-400/20",
    iconColor: "text-rose-400",
    badgeBorder: "border-rose-400/20",
    badgeBg: "bg-rose-400/10",
    badgeText: "text-rose-300",
  },
  indigo: {
    iconBg: "bg-indigo-400/10 border-indigo-400/20",
    iconColor: "text-indigo-400",
    badgeBorder: "border-indigo-400/20",
    badgeBg: "bg-indigo-400/10",
    badgeText: "text-indigo-300",
  },
  cyan: {
    iconBg: "bg-cyan-400/10 border-cyan-400/20",
    iconColor: "text-cyan-400",
    badgeBorder: "border-cyan-400/20",
    badgeBg: "bg-cyan-400/10",
    badgeText: "text-cyan-300",
  },
};

function BentoCard({
  icon: Icon,
  title,
  desc,
  badge,
  accent,
}: (typeof features)[number]) {
  const styles = accentColors[accent] || accentColors.sky;

  return (
    <div className="group relative rounded-[26px] p-7 border border-white/[0.08] bg-white/[0.025] hover:bg-white/[0.05] backdrop-blur-2xl transition-all duration-300 hover:border-white/20 active:scale-[0.985] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_10px_30px_-15px_rgba(0,0,0,0.5)] flex flex-col justify-between overflow-hidden">
      {/* Specular Top Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Header with Icon & Micro-badge */}
        <div className="flex items-center justify-between mb-6">
          <div className={`h-11 w-11 rounded-2xl flex items-center justify-center border transition-transform duration-300 group-hover:scale-105 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] ${styles.iconBg}`}>
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>

          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${styles.badgeBorder} ${styles.badgeBg} ${styles.badgeText}`}>
            {badge}
          </span>
        </div>

        {/* Content */}
        <h3 className="text-lg font-bold text-white tracking-[-0.015em] mb-2.5 group-hover:text-white transition-colors">
          {title}
        </h3>
        <p className="text-sm leading-relaxed text-zinc-400 font-normal">
          {desc}
        </p>
      </div>

      <div className="pt-6 mt-4 border-t border-white/[0.05] flex items-center justify-between text-xs font-semibold text-zinc-400 group-hover:text-zinc-200 transition-colors">
        <span>Explorar función</span>
        <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-zinc-500 group-hover:text-white" />
      </div>
    </div>
  );
}

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full max-w-6xl mt-8 mb-16">
      {features.map((feature) => (
        <BentoCard key={feature.title} {...feature} />
      ))}
    </div>
  );
}
