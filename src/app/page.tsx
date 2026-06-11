import Link from "next/link";
import { Sparkles, Car, ArrowRight } from "lucide-react";
import { FeaturesGrid } from "./components/FeaturesGrid";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden"
      style={{ backgroundColor: "#050510", color: "#e4e4e7" }}
    >
      {/* Ambient glow orbs */}
      <div
        className="pointer-events-none absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute bottom-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20"
        style={{ background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full blur-[80px] opacity-15"
        style={{ background: "radial-gradient(circle, #06b6d4 0%, transparent 70%)" }}
      />

      {/* Header - Glass */}
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
              className="px-4 py-2 text-sm font-medium transition-colors rounded-lg"
              style={{ color: "#a1a1aa" }}
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all"
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
        <div className="text-center max-w-3xl mb-20">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 backdrop-blur-md"
            style={{
              border: "1px solid rgba(14,165,233,0.25)",
              backgroundColor: "rgba(14,165,233,0.08)",
              color: "#38bdf8",
              boxShadow: "0 0 15px rgba(14,165,233,0.1)",
            }}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Sistema de Gestión Integral Car Wash v1.0
          </div>

          {/* Hero Title */}
          <h1
            className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-6 bg-clip-text text-transparent leading-tight"
            style={{
              backgroundImage: "linear-gradient(to bottom right, #ffffff, #d4d4d8, #71717a)",
            }}
          >
            Control absoluto de tu autolavado
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg leading-relaxed mb-10 max-w-2xl mx-auto" style={{ color: "#71717a" }}>
            Administra clientes, vehículos, órdenes de servicio en tiempo real, caja y reportes
            financieros desde una sola plataforma unificada y de alto rendimiento.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="group w-full sm:w-auto px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2.5 text-base"
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

        {/* Features Grid - Glass Cards */}
        <FeaturesGrid />
      </main>

      {/* Footer - Glass */}
      <footer
        className="px-6 py-6 text-center text-xs relative z-10"
        style={{
          borderTop: "1px solid rgba(255,255,255,0.05)",
          backgroundColor: "rgba(5,5,16,0.5)",
          color: "#3f3f46",
        }}
      >
        <p>© 2026 CarWash Pro. Todos los derechos reservados. Diseñado para alto rendimiento.</p>
      </footer>
    </div>
  );
}
