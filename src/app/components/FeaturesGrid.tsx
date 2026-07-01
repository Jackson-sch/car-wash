"use client";[0.01]

import { Car, Coins, TrendingUp, Gift, Building2, Smartphone } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Car,
    title: "Control de Lavado en Vivo",
    desc: "Seguimiento en tiempo real por patente/placa, flujo operativo en tablero Kanban (Patio/Lista) e impresión rápida de tickets.",
    glow: "#0ea5e9", // Sky Blue
  },
  {
    icon: Coins,
    title: "Caja y Arqueo Ciego",
    desc: "Conciliación sorda de efectivo, POS y billeteras (Yape/Plin). Autorización y firma digital de supervisores en caso de discrepancias.",
    glow: "#10b981", // Emerald Green
  },
  {
    icon: TrendingUp,
    title: "Analítica e Insights",
    desc: "Identificación de horas pico, proyección automatizada de ingresos mensuales y asignación óptima de personal (Staffing).",
    glow: "#f59e0b", // Amber/Gold
  },
  {
    icon: Gift,
    title: "Programa de Puntos",
    desc: "Fidelización automatizada de clientes: acumulación de puntos según consumo y canje directo como descuento en caja.",
    glow: "#ec4899", // Pink/Rose
  },
  {
    icon: Building2,
    title: "Control Multi-Sede",
    desc: "Administra múltiples locales. Define tu sucursal principal y goza de un aislamiento de seguridad absoluto entre empresas.",
    glow: "#8b5cf6", // Violet
  },
  {
    icon: Smartphone,
    title: "Instalable y Offline (PWA)",
    desc: "Instala el sistema como app nativa en PC o celular. Accede rápidamente con soporte offline en caso de cortes de conexión.",
    glow: "#06b6d4", // Cyan
  },
];

function FeatureCard({ icon: Icon, title, desc, glow }: typeof features[number]) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`p-6 rounded-2xl backdrop-blur-xl transition-all duration-500 cursor-default group border shadow-md bg-gradient-to-br ${
        hovered ? "from-white/[0.06] to-white/[0.01]" : "from-white/[0.02] to-transparent"
      }`}
      style={{
        borderColor: hovered ? `${glow}33` : "rgba(255,255,255,0.04)",
        boxShadow: hovered
          ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 10px 30px ${glow}10`
          : "inset 0 1px 0 rgba(255,255,255,0.03)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center mb-5 transition-all duration-500"
        style={{
          backgroundColor: hovered ? `${glow}15` : "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? `${glow}25` : "rgba(255,255,255,0.05)"}`,
        }}
      >
        <Icon
          className="h-5.5 w-5.5 transition-transform duration-500 group-hover:scale-110"
          style={{ color: hovered ? glow : "#9ca3af" }}
        />
      </div>
      <h3 className="text-base font-bold mb-2 transition-colors duration-300" style={{ color: hovered ? "#ffffff" : "#e5e7eb" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
        {desc}
      </p>
    </div>
  );
}

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mt-12">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  );
}
