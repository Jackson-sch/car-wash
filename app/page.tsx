import Link from "next/link";
import { Sparkles, Car, Shield, BarChart3, Settings, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-between selection:bg-teal-500 selection:text-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
              <Car className="h-6 w-6 text-zinc-950 font-bold" />
            </div>
            <div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                CarWash
              </span>
              <span className="font-semibold text-xl text-zinc-100 tracking-tight"> Pro</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/registro"
              className="px-4 py-2 text-sm font-medium rounded-lg bg-teal-500 text-zinc-950 hover:bg-teal-400 transition-colors shadow-md shadow-teal-500/10"
            >
              Registro
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/30 bg-teal-950/20 text-teal-400 text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5" />
            Sistema de Gestión Integral Car Wash v1.0
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 bg-gradient-to-r from-white via-zinc-200 to-zinc-500 bg-clip-text text-transparent">
            Control absoluto de tu autolavado
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed mb-8">
            Administra clientes, vehículos, órdenes de servicio en tiempo real, caja y reportes financieros desde una sola plataforma unificada y de alto rendimiento.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 text-zinc-950 font-bold hover:opacity-90 transition-opacity shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2"
            >
              Acceder al Panel Control
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-6xl">
          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:border-zinc-700 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-teal-950/50 group-hover:text-teal-400 transition-colors">
              <Users className="h-6 w-6 text-zinc-400 group-hover:text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Clientes y Vehículos</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Búsqueda ultrarrápida por placa, registro simplificado y control detallado del historial de cada vehículo.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:border-zinc-700 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-teal-950/50 group-hover:text-teal-400 transition-colors">
              <Shield className="h-6 w-6 text-zinc-400 group-hover:text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Ordenes en Vivo (Kanban)</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Seguimiento en tiempo real del estado de lavado y asignación de lavadores para mejorar la productividad.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/30 backdrop-blur-sm hover:border-zinc-700 transition-all group">
            <div className="h-12 w-12 rounded-xl bg-zinc-800 flex items-center justify-center mb-4 group-hover:bg-teal-950/50 group-hover:text-teal-400 transition-colors">
              <BarChart3 className="h-6 w-6 text-zinc-400 group-hover:text-teal-400" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Caja y Reportes</h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              Gestión de turnos de caja, múltiples métodos de pago (Efectivo, Yape, Tarjetas) y reportes automatizados.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-6 py-6 text-center text-xs text-zinc-600">
        <p>© 2026 CarWash Pro. Todos los derechos reservados. Diseñado para alto rendimiento.</p>
      </footer>
    </div>
  );
}
