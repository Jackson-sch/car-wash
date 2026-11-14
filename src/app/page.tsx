import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  Car,
  ArrowRight,
  LayoutDashboard,
  Coins,
  Users,
  Clock,
  ShieldCheck,
  ChevronRight,
  Gauge,
  Tv,
} from "lucide-react";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { GrowthSimulator } from "./components/GrowthSimulator";

export default function Home() {
  return (
    <div className="min-h-dvh flex flex-col justify-between bg-black text-zinc-100 relative overflow-hidden font-sans selection:bg-white/20 selection:text-white">
      {/* Apple-style Cinematic Ambient Lighting */}
      <div
        className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[1100px] h-[550px] opacity-40 blur-[140px] -z-10"
        style={{
          background:
            "radial-gradient(ellipse 65% 50% at 50% 0%, rgba(56, 189, 248, 0.35), rgba(99, 102, 241, 0.15) 50%, transparent 80%)",
        }}
      />
      <div
        className="pointer-events-none absolute top-[700px] left-1/2 -translate-x-1/2 w-[900px] h-[450px] opacity-20 blur-[130px] -z-10"
        style={{
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.25) 0%, rgba(16, 185, 129, 0.1) 60%, transparent 80%)",
        }}
      />

      {/* Header - Apple Translucent Glass Navigation */}
      <header className="sticky top-0 z-50 px-6 py-3.5 backdrop-blur-2xl bg-black/60 border-b border-white/[0.08] shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo with optical tracking */}
          <Link href="/" className="flex items-center gap-2.5 group transition-transform duration-200 active:scale-95">
            <div className="h-9 w-9 flex items-center justify-center shrink-0 rounded-xl bg-white/[0.04] border border-white/10 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] group-hover:border-white/25 transition-colors">
              <Image
                src="/logo-shield.png"
                alt="WashMaster Logo"
                width={32}
                height={32}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex items-center tracking-tight">
              <span className="font-bold text-lg text-white">WashMaster</span>
              <span className="font-semibold text-lg text-sky-400 ml-1">Pro</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs sm:text-sm font-medium text-zinc-400 hover:text-white transition-colors duration-200 active:scale-95"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="px-5 py-2 text-xs sm:text-sm font-semibold rounded-full bg-white text-black hover:bg-zinc-100 transition-all duration-200 active:scale-95 shadow-[0_2px_14px_rgba(255,255,255,0.2),inset_0_1px_0_rgba(255,255,255,0.8)]"
            >
              Registro
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pt-16 sm:pt-24 pb-20 max-w-6xl mx-auto w-full relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          
          {/* Eyebrow Badge (Frosted Apple Pill) */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-zinc-300 border border-white/15 bg-white/[0.04] backdrop-blur-xl mb-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_4px_16px_rgba(0,0,0,0.2)]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500" />
            </span>
            <span className="tracking-wide">Sistema Operativo v1.5 • Producción en Vivo</span>
          </div>

          {/* Hero Heading: Apple Optical Typography */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[76px] font-black tracking-[-0.035em] leading-[1.04] mb-6 bg-gradient-to-b from-white via-white/95 to-zinc-400 bg-clip-text text-transparent">
            Control absoluto de tu autolavado
          </h1>

          {/* Subtitle: Clean, human & comfortable leading */}
          <p className="text-sm sm:text-base md:text-lg text-zinc-400 max-w-2xl mx-auto font-normal leading-relaxed tracking-[-0.01em] mb-9">
            Gestión en tiempo real de bahías, control de caja con arqueo ciego de alta precisión,
            programas de puntos automatizados y analítica de rendimiento multi-sede.
          </p>

          {/* CTAs: Response & Spring-like feedback */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base bg-white text-black hover:bg-zinc-100 active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_10px_35px_-8px_rgba(255,255,255,0.3),inset_0_1px_0_rgba(255,255,255,0.9)]"
            >
              <span>Acceder al Panel de Control</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>

            <Link
              href="/consulta/DEMO"
              className="w-full sm:w-auto px-6 py-3.5 rounded-full font-semibold text-sm sm:text-base text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 backdrop-blur-xl active:scale-[0.97] transition-all duration-200 flex items-center justify-center gap-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]"
            >
              <Tv className="h-4 w-4 text-sky-400" />
              <span>Ver Tracking en Vivo</span>
            </Link>
          </div>
        </div>

        {/* DASHBOARD PREVIEW MOCKUP (macOS / iPadOS Hardware Aesthetic) */}
        <div className="w-full max-w-5xl rounded-[28px] sm:rounded-[34px] border border-white/[0.12] bg-[#0c0d14]/90 backdrop-blur-3xl shadow-[0_30px_100px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(255,255,255,0.06)] relative overflow-hidden mb-16 p-3 sm:p-5 group transition-all duration-500">
          
          {/* Specular Top Edge Light Reflection */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />

          {/* Window Titlebar */}
          <div className="flex items-center justify-between px-2 pb-3 mb-3 border-b border-white/[0.07]">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)] block" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)] block" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[inset_0_1px_1px_rgba(0,0,0,0.3)] block" />
              <span className="text-[11px] text-zinc-500 font-mono ml-2 hidden sm:inline-block">washmaster.terminal • v1.5</span>
            </div>

            <div className="flex items-center gap-2 text-[10px] text-zinc-300 font-medium bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">Servidor Operativo:</span>
              <span className="text-emerald-400 font-semibold">18ms</span>
            </div>
          </div>

          {/* Window Workspace Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Frosted Sidebar */}
            <div className="hidden md:flex md:col-span-3 flex-col gap-1.5 border-r border-white/[0.06] pr-3 text-xs font-medium text-zinc-400">
              <div className="flex items-center gap-2.5 px-3 py-2 bg-white/[0.09] text-white border border-white/[0.12] rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] font-semibold">
                <LayoutDashboard className="h-4 w-4 text-sky-400" />
                <span>Resumen Operativo</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] rounded-xl transition-colors text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <Car className="h-4 w-4" />
                <span>Órdenes de Lavado</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] rounded-xl transition-colors text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <Coins className="h-4 w-4" />
                <span>Cierre de Caja</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 hover:bg-white/[0.04] rounded-xl transition-colors text-zinc-400 hover:text-zinc-200 cursor-pointer">
                <Users className="h-4 w-4" />
                <span>Directorio Clientes</span>
              </div>
            </div>

            {/* Main Stage */}
            <div className="md:col-span-9 space-y-4">
              
              {/* Mini KPI Cards (Apple Glass Metrics) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider">Caja Abierta</span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <div className="text-lg font-bold text-white font-mono mt-1">S/ 3,420.50</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Sede: San Isidro</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Órdenes en Bahía</span>
                  <div className="text-lg font-bold text-white font-mono mt-1">18 Servicios</div>
                  <span className="text-[10px] text-zinc-400 font-medium">7 en espera • 11 lavando</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:border-white/20 hover:bg-white/[0.05] transition-all duration-300">
                  <span className="text-[10px] text-zinc-400 font-semibold uppercase tracking-wider block">Fidelización</span>
                  <div className="text-lg font-bold text-white font-mono mt-1">+125 Canjes</div>
                  <span className="text-[10px] text-sky-400 font-medium">Puntos aplicados hoy</span>
                </div>

              </div>

              {/* Live Kanban Patio Board (Physical acrylic tiles) */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#07070d]/90 p-3.5 shadow-xl backdrop-blur-xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-sky-400" />
                    Patio en Tiempo Real (Cola de Bahías)
                  </h4>
                  <span className="text-[10px] font-semibold text-zinc-400 bg-white/[0.04] border border-white/[0.06] px-2.5 py-0.5 rounded-full">
                    Sincronización WebSocket
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  
                  {/* Column 1: En Espera */}
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      <span>En Espera</span>
                      <span className="bg-amber-400/10 px-1.5 py-0.5 rounded text-amber-300 font-mono">2</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.04] border border-amber-500/25 space-y-1.5 shadow-sm hover:border-amber-400/40 transition-colors">
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold text-white">
                        <span className="tracking-wide">F4L-101</span>
                        <span className="text-[9px] text-zinc-400 font-sans bg-white/[0.06] px-1.5 py-0.5 rounded">Toyota</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block">Lavado Completo</span>
                    </div>
                  </div>

                  {/* Column 2: Lavado en Proceso */}
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-sky-400 uppercase tracking-wider">
                      <span>Lavando en Bahía</span>
                      <span className="bg-sky-400/10 px-1.5 py-0.5 rounded text-sky-300 font-mono">1</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.04] border border-sky-500/30 space-y-1.5 relative shadow-sm hover:border-sky-400/45 transition-colors">
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-sky-400 animate-ping" />
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold text-white">
                        <span className="tracking-wide">B2P-202</span>
                        <span className="text-[9px] text-sky-300 font-sans bg-sky-400/10 px-1.5 py-0.5 rounded">Hyundai</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block">Lavado Premium + Cera</span>
                    </div>
                  </div>

                  {/* Column 3: Completado */}
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                      <span>Listo para Entrega</span>
                      <span className="bg-emerald-400/10 px-1.5 py-0.5 rounded text-emerald-300 font-mono">3</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/[0.04] border border-emerald-500/30 space-y-1.5 shadow-sm hover:border-emerald-400/45 transition-colors">
                      <div className="flex justify-between items-center text-[11px] font-mono font-bold text-white">
                        <span className="tracking-wide">K9X-909</span>
                        <span className="text-[9px] text-emerald-300 font-sans bg-emerald-400/10 px-1.5 py-0.5 rounded">Kia Rio</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block">Espera de Cobro</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* SECTION: BENTO GRID OF MODULES */}
        <div className="text-center mt-12 w-full max-w-3xl mx-auto mb-4">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-400 uppercase tracking-wider mb-2">
            <Sparkles className="h-3 w-3" />
            <span>Ingeniería de Software para Autolavados</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-[-0.03em] leading-tight">
            Diseñado para fluidez operativa total
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-xl mx-auto">
            Cada módulo ha sido concebido para eliminar cuellos de botella y maximizar el rendimiento por bahía.
          </p>
        </div>
        <FeaturesGrid />

        {/* SECTION: GROWTH SIMULATOR */}
        <GrowthSimulator />

      </main>

      {/* Footer - Apple Minimalist Translucent Ground */}
      <footer className="px-6 py-10 border-t border-white/[0.08] bg-black/80 backdrop-blur-xl relative z-10 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-md bg-white/[0.05] border border-white/10 flex items-center justify-center p-0.5">
              <Image src="/logo-shield.png" alt="Logo" width={16} height={16} className="object-contain" />
            </div>
            <p>© 2026 WashMaster Pro. Plataforma de alto rendimiento para autolavados y car detailing.</p>
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span className="inline-flex items-center gap-1.5 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full bg-emerald-500/10">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              PWA Instalable
            </span>
            <span className="text-zinc-500">v1.5_Release</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
