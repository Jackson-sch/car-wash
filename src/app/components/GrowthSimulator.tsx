"use client";

import { useState } from "react";
import { TrendingUp, Gift, Sparkles, ArrowUpRight, Calculator } from "lucide-react";

export function GrowthSimulator() {
  const [lavadosDiarios, setLavadosDiarios] = useState(40);
  const [precioPromedio, setPrecioPromedio] = useState(35);

  const ingresosMensualesActuales = lavadosDiarios * precioPromedio * 30;
  const incrementoFidelizacion = ingresosMensualesActuales * 0.25;
  const incrementoHorasPico = ingresosMensualesActuales * 0.15;
  const ingresosMensualesProyectados =
    ingresosMensualesActuales + incrementoFidelizacion + incrementoHorasPico;
  const gananciaAnualExtra = (incrementoFidelizacion + incrementoHorasPico) * 12;

  return (
    <div className="w-full max-w-5xl mt-16 mb-20 relative">
      {/* Gentle Apple Ambient Light */}
      <div
        className="absolute inset-0 -z-10 blur-3xl pointer-events-none opacity-20"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, rgba(16, 185, 129, 0.25) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 mb-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
          <Calculator className="h-3.5 w-3.5" />
          <span>Calculadora Interactiva de Rendimiento</span>
        </div>
        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-[-0.03em] leading-tight">
          Simula el impacto en tu facturación
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 max-w-xl mx-auto mt-2">
          Calcula el retorno de implementar programas de retención (+25%) y optimización de bahías (+15%).
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Sliders Panel: Apple Glass Controller */}
        <div className="lg:col-span-5 p-7 rounded-[28px] bg-white/[0.03] border border-white/[0.08] backdrop-blur-2xl flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_20px_50px_-20px_rgba(0,0,0,0.6)]">
          <div className="space-y-7">
            
            {/* Slider 1 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider">Lavados por día</span>
                <span className="text-white font-mono font-bold text-sm bg-white/[0.06] border border-white/10 px-3 py-1 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  {lavadosDiarios} vehículos
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
                className="w-full h-1.5 rounded-full bg-white/15 appearance-none cursor-pointer accent-sky-400 focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                <span>10</span>
                <span>80</span>
                <span>150</span>
              </div>
            </div>

            {/* Slider 2 */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-zinc-400 font-semibold uppercase tracking-wider">Ticket promedio</span>
                <span className="text-white font-mono font-bold text-sm bg-white/[0.06] border border-white/10 px-3 py-1 rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  S/ {precioPromedio}.00
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
                className="w-full h-1.5 rounded-full bg-white/15 appearance-none cursor-pointer accent-sky-400 focus:outline-none"
              />
              <div className="flex justify-between text-[11px] text-zinc-500 font-mono">
                <span>S/ 15</span>
                <span>S/ 65</span>
                <span>S/ 120</span>
              </div>
            </div>
          </div>

          {/* Current Baseline */}
          <div className="mt-8 pt-6 border-t border-white/[0.06] text-left">
            <div className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
              Facturación Base Actual
            </div>
            <div className="text-2xl font-bold text-white font-mono mt-1">
              S/ {ingresosMensualesActuales.toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              <span className="text-xs text-zinc-500 font-normal ml-1.5">/ mes</span>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Card 1: Fidelización */}
          <div className="p-6 rounded-[24px] bg-white/[0.025] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-rose-400/10 border border-rose-400/20 flex items-center justify-center mb-4 text-rose-400">
                <Gift className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Retención por Puntos</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                El club de lealtad incrementa la recurrencia mensual en un 25%.
              </p>
            </div>
            <div className="mt-5 text-rose-400 font-mono font-bold text-lg flex items-baseline gap-1">
              + S/ {incrementoFidelizacion.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              <span className="text-[10px] text-zinc-500 font-normal">/ mes</span>
            </div>
          </div>

          {/* Card 2: Horas Pico */}
          <div className="p-6 rounded-[24px] bg-white/[0.025] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <div>
              <div className="h-10 w-10 rounded-2xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center mb-4 text-amber-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Horas Pico & Dinámica</h3>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Distribución inteligente de personal y promociones en horas valle (+15%).
              </p>
            </div>
            <div className="mt-5 text-amber-400 font-mono font-bold text-lg flex items-baseline gap-1">
              + S/ {incrementoHorasPico.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              <span className="text-[10px] text-zinc-500 font-normal">/ mes</span>
            </div>
          </div>

          {/* Card 3: Total Proyectado */}
          <div className="p-6 rounded-[24px] bg-white/[0.025] border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04] transition-all duration-300 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Facturación Proyectada
            </h3>
            <div className="mt-4">
              <div className="text-[11px] text-zinc-500">Nuevo ingreso mensual estimado</div>
              <div className="text-xl font-mono text-white mt-1 font-bold">
                S/ {ingresosMensualesProyectados.toLocaleString("es-PE", { maximumFractionDigits: 0 })}
              </div>
            </div>
          </div>

          {/* Card 4: Impacto Anual (Apple Green Accent) */}
          <div className="p-6 rounded-[24px] bg-emerald-500/[0.08] border border-emerald-500/25 flex flex-col justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_10px_30px_rgba(16,185,129,0.1)]">
            <div className="flex justify-between items-start">
              <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Ganancia Anual Extra
              </h3>
              <Sparkles className="h-4.5 w-4.5 text-emerald-400 animate-pulse" />
            </div>
            <div className="mt-4">
              <div className="text-[11px] text-emerald-300/80 font-semibold flex items-center gap-1">
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
