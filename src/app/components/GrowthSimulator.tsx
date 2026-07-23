"use client";

import { useState } from "react";
import { TrendingUp, Gift, Sparkles, ArrowUpRight } from "lucide-react";

export function GrowthSimulator() {
  const [lavadosDiarios, setLavadosDiarios] = useState(40);
  const [precioPromedio, setPrecioPromedio] = useState(35);

  const ingresosMensualesActuales = lavadosDiarios * precioPromedio * 30;
  const incrementoFidelizacion = ingresosMensualesActuales * 0.25;
  const incrementoHorasPico = ingresosMensualesActuales * 0.15;
  const ingresosMensualesProyectados = ingresosMensualesActuales + incrementoFidelizacion + incrementoHorasPico;
  const gananciaAnualExtra = (incrementoFidelizacion + incrementoHorasPico) * 12;

  return (
    <div className="w-full max-w-5xl mt-24 mb-16 relative">
      {/* Background decoration */}
      <div 
        className="absolute inset-0 -z-10 blur-3xl pointer-events-none" 
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 60%)" }}
      />

      <div className="text-center mb-10">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-3">
          Simulador de Crecimiento WashMaster
        </h2>
        <p className="text-sm sm:text-base text-gray-400 max-w-xl mx-auto">
          Calcula el impacto de implementar nuestro Programa de Fidelización (+25%) y Analítica Predictiva (+15%) en tu flujo mensual.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Sliders panel */}
        <div className="lg:col-span-5 p-8 rounded-3xl bg-linear-to-b from-white/4 to-white/1 border border-white/10 backdrop-blur-xl flex flex-col justify-between shadow-xl">
          <div className="space-y-8">
            {/* Slider 1 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-semibold">Lavados por día</span>
                <span className="text-white font-mono font-bold text-lg bg-white/8 border border-white/5 px-3 py-1 rounded-lg">
                  {lavadosDiarios}
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="150"
                step="5"
                value={lavadosDiarios}
                onChange={(e) => setLavadosDiarios(Number(e.target.value))}
                aria-label="Lavados por día"
                className="w-full h-2 rounded-lg bg-white/10 appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>10</span>
                <span>80</span>
                <span>150</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-semibold">Ticket promedio (S/)</span>
                <span className="text-white font-mono font-bold text-lg bg-white/8 border border-white/5 px-3 py-1 rounded-lg">
                  S/ {precioPromedio}
                </span>
              </div>
              <input
                type="range"
                min="15"
                max="120"
                step="5"
                value={precioPromedio}
                onChange={(e) => setPrecioPromedio(Number(e.target.value))}
                aria-label="Ticket promedio"
                className="w-full h-2 rounded-lg bg-white/10 appearance-none cursor-pointer accent-secondary"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>S/ 15</span>
                <span>S/ 65</span>
                <span>S/ 120</span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/5 text-center lg:text-left">
            <div className="text-xs text-gray-500 font-medium">Facturación base estimada</div>
            <div className="text-2xl font-black text-white/90 font-mono mt-1">
              S/ {ingresosMensualesActuales.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              <span className="text-xs text-gray-400 font-bold ml-1">/ mes</span>
            </div>
          </div>
        </div>

        {/* Results panel */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Card 1: Fidelización */}
          <div className="p-6 rounded-2xl bg-linear-to-br from-white/3 to-transparent border border-white/10 hover:border-white/20 transition-colors duration-300 flex flex-col justify-between shadow-md">
            <div>
              <div className="h-10 w-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-4">
                <Gift className="h-5 w-5 text-pink-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-300">Retención por Puntos</h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                El club de lealtad incrementa la frecuencia de visitas en un 25%.
              </p>
            </div>
            <div className="mt-6 text-pink-500 font-mono font-extrabold text-lg flex items-center gap-1">
              + S/ {incrementoFidelizacion.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              <span className="text-[10px] text-gray-400 font-medium">/ mes</span>
            </div>
          </div>

          {/* Card 2: Horas Pico */}
          <div className="p-6 rounded-2xl bg-linear-to-br from-white/3 to-transparent border border-white/10 hover:border-white/20 transition-colors duration-300 flex flex-col justify-between shadow-md">
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-4">
                <TrendingUp className="h-5 w-5 text-amber-500" />
              </div>
              <h3 className="text-sm font-bold text-gray-300">Horas Pico & Promociones</h3>
              <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
                Campañas automatizadas en horas muertas elevan la facturación un 15%.
              </p>
            </div>
            <div className="mt-6 text-amber-500 font-mono font-extrabold text-lg flex items-center gap-1">
              + S/ {incrementoHorasPico.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              <span className="text-[10px] text-gray-400 font-medium">/ mes</span>
            </div>
          </div>

          {/* Card 3: Total Proyectado */}
          <div className="p-6 rounded-2xl bg-linear-to-br from-white/3 to-transparent border border-white/10 hover:border-white/20 transition-colors duration-300 flex flex-col justify-between shadow-md">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Facturación Proyectada</h3>
            <div className="mt-4">
              <div className="text-xs text-gray-500 font-medium">Nuevo ingreso mensual</div>
              <div className="text-xl font-mono text-white/95 mt-1 font-semibold">
                S/ {ingresosMensualesProyectados.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Card 4: Impacto Anual */}
          <div className="p-6 rounded-2xl bg-linear-to-br from-emerald-500/10 to-emerald-500/2 border border-emerald-500/25 flex flex-col justify-between shadow-lg shadow-emerald-500/5">
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-emerald-450 uppercase tracking-wider">Ganancia Anual Extra</h3>
              <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            </div>
            <div className="mt-4">
              <div className="text-[11px] text-emerald-350/80 font-semibold flex items-center gap-1">
                Retorno de Inversión Neto
                <ArrowUpRight className="h-3 w-3" />
              </div>
              <div className="text-2xl font-mono font-black text-emerald-400 mt-1">
                S/ {gananciaAnualExtra.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
