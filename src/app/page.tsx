import Link from "next/link";
import { Sparkles, Car, ArrowRight, LayoutDashboard, Coins, Users, CheckCircle2, Clock, Star } from "lucide-react";
import { FeaturesGrid } from "./components/FeaturesGrid";
import { GrowthSimulator } from "./components/GrowthSimulator";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden"
      style={{
        backgroundColor: "#050510",
        backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.035) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
        color: "#e4e4e7",
      }}
    >
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute top-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full blur-[130px] opacity-25"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-15%] right-[-5%] w-[600px] h-[600px] rounded-full blur-[110px] opacity-20"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-[40%] right-[10%] w-[400px] h-[400px] rounded-full blur-[90px] opacity-15"
        style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }}
      />

      {/* Header - Glass Navbar */}
      <header
        className="sticky top-0 z-50 px-6 py-4 backdrop-blur-xl"
        style={{
          backgroundColor: "rgba(5,5,16,0.6)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                boxShadow: "0 0 20px rgba(14,165,233,0.35)",
              }}
            >
              <Car className="h-5.5 w-5.5" style={{ color: "#050510" }} />
            </div>
            <div>
              <span
                className="font-bold text-xl tracking-tight bg-clip-text text-transparent"
                style={{ backgroundImage: "linear-gradient(to right, #0ea5e9, #38bdf8)" }}
              >
                CarWash
              </span>
              <span className="font-semibold text-xl tracking-tight" style={{ color: "#f4f4f5" }}>
                {" "}Pro
              </span>
            </div>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg hover:text-white"
              style={{ color: "#a1a1aa" }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-secondary/20"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
                color: "#050510",
                boxShadow: "0 0 20px rgba(14,165,233,0.25)",
              }}
            >
              Registro
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 max-w-7xl mx-auto w-full relative z-10">
        
        {/* HERO SECTION */}
        <div className="text-center max-w-4xl mb-12">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold mb-8 backdrop-blur-md border uppercase tracking-wider"
            style={{
              borderColor: "rgba(14,165,233,0.25)",
              backgroundColor: "rgba(14,165,233,0.08)",
              color: "#38bdf8",
              boxShadow: "0 0 15px rgba(14,165,233,0.1)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5 animate-pulse" />
            Sistema de Gestión Integral Car Wash v1.5
          </div>

          {/* Hero Title */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent leading-[1.1]"
            style={{
              backgroundImage: "linear-gradient(to bottom right, #ffffff 30%, #e4e4e7, #71717a)",
            }}
          >
            Control absoluto de tu autolavado
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base md:text-lg leading-relaxed mb-10 max-w-3xl mx-auto text-gray-400">
            La plataforma multi-sede definitiva para la gestión operativa en vivo, control de caja con arqueo ciego,
            programas de puntos automatizados y analítica predictiva de demanda.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2.5 text-base hover:scale-[1.01]"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #06b6d4)",
                color: "#050510",
                boxShadow: "0 0 30px rgba(14,165,233,0.3), 0 10px 40px rgba(14,165,233,0.15)",
              }}
            >
              Acceder al Panel de Control
              <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* DASHBOARD PREVIEW MOCKUP */}
        <div className="w-full max-w-5xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.01] dark:from-zinc-950/40 dark:to-zinc-950/20 p-4 sm:p-6 backdrop-blur-xl shadow-2xl relative mb-12 overflow-hidden">
          
          {/* Glassmorphism Background Glow Orbs behind the mockup content */}
          <div className="absolute -inset-4 -z-10 rounded-[40px] bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-emerald-500/10 blur-xl opacity-75 pointer-events-none" />

          {/* Mockup Title bar */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/60 block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/60 block" />
              <span className="w-3 h-3 rounded-full bg-green-500/60 block" />
              <span className="text-[10px] text-gray-500 font-mono ml-2">washmaster-prod-v1.5</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-emerald-450 font-bold bg-emerald-500/5 border border-emerald-500/10 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Servidor Operativo
            </div>
          </div>

          {/* Mockup Dashboard Content Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            
            {/* Sidebar Mockup */}
            <div className="hidden md:flex md:col-span-3 flex-col gap-2 border-r border-white/10 pr-4 text-xs font-semibold text-gray-400">
              <div className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-white">
                <LayoutDashboard className="h-3.5 w-3.5 text-secondary" />
                <span>Resumen Operativo</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all">
                <Car className="h-3.5 w-3.5" />
                <span>Órdenes de Lavado</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all">
                <Coins className="h-3.5 w-3.5" />
                <span>Cierre de Caja</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 hover:bg-white/5 border border-transparent hover:border-white/5 rounded-xl transition-all">
                <Users className="h-3.5 w-3.5" />
                <span>Directorio Clientes</span>
              </div>
            </div>

            {/* Main Area Mockup */}
            <div className="md:col-span-9 space-y-6">
              
              {/* Mini KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 shadow-lg relative overflow-hidden group hover:border-white/20 transition-all duration-300">
                  <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Caja Abierta (Efectivo)</span>
                  <span className="text-base font-black text-white font-mono mt-1 block">S/ 3,420.50</span>
                  <span className="text-[9px] text-emerald-400 font-medium block mt-0.5">Sede: San Isidro</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 shadow-lg group hover:border-white/20 transition-all duration-300">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Órdenes Activas</span>
                  <span className="text-base font-black text-white font-mono mt-1 block">18 Servicios</span>
                  <span className="text-[9px] text-gray-450 font-medium block mt-0.5">7 en cola, 11 en lavado</span>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 shadow-lg group hover:border-white/20 transition-all duration-300">
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Fidelización de Clientes</span>
                  <span className="text-base font-black text-white font-mono mt-1 block">+125 Canjes</span>
                  <span className="text-[9px] text-gray-450 font-medium block mt-0.5">1 Punto = S/ 0.20 descuento</span>
                </div>

              </div>

              {/* Kanban Mockup */}
              <div className="rounded-2xl border border-white/10 bg-zinc-950/45 p-4 shadow-xl">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-extrabold text-white flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-secondary" />
                    Patio en Tiempo Real (Cola de Lavado)
                  </h4>
                  <span className="text-[9px] font-bold text-gray-500 bg-white/5 border border-white/5 px-2 py-0.5 rounded">Vista de Supervisor</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  
                  {/* Column 1: Espera */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-amber-500 uppercase">
                      <span>En Espera</span>
                      <span>(2)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/10 space-y-2 shadow-md hover:border-white/20 transition-all duration-300">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-white">
                        <span>F4L-101</span>
                        <span className="text-[9px] text-gray-400 font-sans bg-white/5 px-1.5 py-0.5 rounded">Toyota</span>
                      </div>
                      <span className="text-[9px] text-gray-500 block">Lavado Completo</span>
                    </div>
                  </div>

                  {/* Column 2: Lavado */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-blue-500 uppercase">
                      <span>Lavado / Proceso</span>
                      <span>(1)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-white/[0.07] to-white/[0.01] border border-blue-500/20 space-y-2 relative shadow-md hover:border-blue-500/35 transition-all duration-300">
                      <div className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-white">
                        <span>B2P-202</span>
                        <span className="text-[9px] text-blue-400 font-sans bg-blue-500/10 px-1.5 py-0.5 rounded">Hyundai</span>
                      </div>
                      <span className="text-[9px] text-gray-500 block">Lavado Premium + Cera</span>
                    </div>
                  </div>

                  {/* Column 3: Completado */}
                  <div className="p-2.5 rounded-xl bg-zinc-900/40 border border-white/5 space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-bold text-emerald-500 uppercase">
                      <span>Completado</span>
                      <span>(3)</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-emerald-500/20 space-y-2 shadow-md hover:border-emerald-500/35 transition-all duration-300">
                      <div className="flex justify-between items-center text-[10px] font-mono font-bold text-white">
                        <span>K9X-909</span>
                        <span className="text-[9px] text-emerald-400 font-sans bg-emerald-500/10 px-1.5 py-0.5 rounded">Kia Rio</span>
                      </div>
                      <span className="text-[9px] text-gray-500 block">Espera de Cobro</span>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>

        {/* FEATURES GRID */}
        <div className="text-center mt-12 w-full">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight">
            Módulos del Sistema Integrado
          </h2>
          <p className="text-sm text-gray-400 mt-2 max-w-xl mx-auto">
            Descubre las características avanzadas diseñadas especialmente para la optimización de tu autolavado.
          </p>
        </div>
        <FeaturesGrid />

        {/* GROWTH SIMULATOR */}
        <GrowthSimulator />

      </main>

      {/* Footer - Glass */}
      <footer
        className="px-6 py-8 text-center text-xs relative z-10"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "rgba(5,5,16,0.5)",
          color: "#4b5563",
        }}
      >
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 CarWash Pro. Todos los derechos reservados. Diseñado para rendimiento corporativo y multi-tenant.</p>
          <div className="flex items-center gap-4 text-[11px] font-semibold">
            <span className="text-emerald-450 border border-emerald-500/10 px-2 py-0.5 rounded bg-emerald-500/5">PWA Activa</span>
            <span className="text-gray-500">v1.5_Release</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
