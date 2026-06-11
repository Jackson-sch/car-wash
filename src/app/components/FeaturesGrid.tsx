"use client";

import { Users, Shield, BarChart3 } from "lucide-react";
import { useState } from "react";

const features = [
  {
    icon: Users,
    title: "Clientes y Vehículos",
    desc: "Búsqueda ultrarrápida por placa, registro simplificado y control detallado del historial de cada vehículo.",
    glow: "#0ea5e9",
  },
  {
    icon: Shield,
    title: "Órdenes en Vivo",
    desc: "Seguimiento en tiempo real del estado de lavado y asignación de lavadores para mejorar la productividad.",
    glow: "#8b5cf6",
  },
  {
    icon: BarChart3,
    title: "Caja y Reportes",
    desc: "Gestión de turnos de caja, múltiples métodos de pago (Efectivo, Yape, Tarjetas) y reportes automatizados.",
    glow: "#06b6d4",
  },
];

function FeatureCard({ icon: Icon, title, desc, glow }: typeof features[number]) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="p-6 rounded-2xl backdrop-blur-xl transition-all duration-500 cursor-default"
      style={{
        backgroundColor: hovered ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${hovered ? `${glow}33` : "rgba(255,255,255,0.06)"}`,
        boxShadow: hovered
          ? `inset 0 1px 0 rgba(255,255,255,0.08), 0 0 30px ${glow}15`
          : "inset 0 1px 0 rgba(255,255,255,0.05)",
        transform: hovered ? "scale(1.02)" : "scale(1)",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="h-11 w-11 rounded-xl flex items-center justify-center mb-5 transition-all duration-500"
        style={{
          backgroundColor: hovered ? `${glow}18` : "rgba(255,255,255,0.05)",
          border: `1px solid ${hovered ? `${glow}30` : "rgba(255,255,255,0.08)"}`,
        }}
      >
        <Icon
          className="h-5 w-5 transition-colors duration-500"
          style={{ color: hovered ? glow : "#a1a1aa" }}
        />
      </div>
      <h3 className="text-base font-bold mb-2" style={{ color: "#f4f4f5" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "#71717a" }}>
        {desc}
      </p>
    </div>
  );
}

export function FeaturesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full max-w-5xl">
      {features.map((feature) => (
        <FeatureCard key={feature.title} {...feature} />
      ))}
    </div>
  );
}
