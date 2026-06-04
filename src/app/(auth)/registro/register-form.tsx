"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Car, Loader2, AlertCircle, Eye, EyeOff, Check, ArrowRight, Sparkles, ShieldCheck, Zap, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Branch {
  id: string;
  nombre: string;
}

interface RegisterFormProps {
  branches: Branch[];
}

export default function RegisterForm({ branches }: RegisterFormProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [rol, setRol] = useState("cajero");
  const [sucursalId, setSucursalId] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password || !confirmPassword) {
      setError("Por favor, completa todos los campos obligatorios.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name: `${nombre} ${apellido}`.trim(),
        rol,
        sucursalId: sucursalId || undefined,
        callbackURL: "/dashboard",
      });

      if (signUpError) {
        setError(signUpError.message || "Error al registrar la cuenta.");
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1500);
      }
    } catch (err: any) {
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-zinc-950 text-zinc-100 overflow-hidden relative selection:bg-teal-500 selection:text-zinc-950">
      
      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* LEFT COLUMN: REGISTRATION FORM */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative z-10 bg-zinc-950/40 backdrop-blur-md border-r border-zinc-900/50 overflow-y-auto max-h-screen">
        
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-6 lg:mb-0 shrink-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform duration-300">
              <Car className="h-5.5 w-5.5 text-zinc-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                CarWash
              </span>
              <span className="font-semibold text-xl text-zinc-100 tracking-tight"> Pro</span>
            </div>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-white">
              Crear Cuenta Administrativa
            </h2>
            <p className="text-zinc-400 text-xs">
              Únete al equipo administrativo y operativo del CarWash.
            </p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </div>
              <span>¡Registro exitoso! Redireccionando...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="nombre" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Nombre <span className="text-teal-400">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  placeholder="Juan"
                  className="w-full h-10 px-3.5 rounded-xl border border-zinc-800/85 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={isLoading || success}
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="apellido" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Apellido
                </label>
                <input
                  id="apellido"
                  type="text"
                  placeholder="Pérez"
                  className="w-full h-10 px-3.5 rounded-xl border border-zinc-800/85 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={isLoading || success}
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Correo Electrónico <span className="text-teal-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                placeholder="juan@carwash.com"
                className="w-full h-10 px-3.5 rounded-xl border border-zinc-800/85 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                disabled={isLoading || success}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password y Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Contraseña <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    className="w-full h-10 pl-3.5 pr-10 rounded-xl border border-zinc-800/85 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                    disabled={isLoading || success}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Confirmar <span className="text-teal-400">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full h-10 px-3.5 rounded-xl border border-zinc-800/85 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={isLoading || success}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Rol y Sucursal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label htmlFor="rol" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Rol
                </label>
                <select
                  id="rol"
                  disabled={isLoading || success}
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-800/85 bg-zinc-950 text-zinc-100 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all text-sm cursor-pointer"
                >
                  <option value="cajero">Cajero</option>
                  <option value="supervisor">Supervisor</option>
                  <option value="admin">Administrador</option>
                  <option value="lavador">Lavador</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="sucursal" className="block text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  Sucursal
                </label>
                <select
                  id="sucursal"
                  disabled={isLoading || success}
                  value={sucursalId}
                  onChange={(e) => setSucursalId(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-zinc-800/85 bg-zinc-950 text-zinc-100 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all text-sm cursor-pointer"
                >
                  <option value="">Ninguna / Central</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full h-10 mt-3 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 bg-[length:200%_auto] hover:bg-right text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 transition-all duration-500 cursor-pointer text-sm"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear Cuenta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Redirection */}
          <div className="mt-6 text-center border-t border-zinc-900/80 pt-4">
            <span className="text-xs text-zinc-500">¿Ya tienes una cuenta? </span>
            <Link
              href="/login"
              className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center lg:text-left shrink-0 mt-6 lg:mt-0">
          <Link href="/" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors inline-flex items-center gap-1">
            ← Volver al inicio
          </Link>
        </div>

      </div>

      {/* RIGHT COLUMN: PREMIUM VISUAL PANEL (Desktop only) */}
      <div className="hidden lg:col-span-7 bg-zinc-900/10 border-l border-zinc-900 relative overflow-hidden lg:flex flex-col justify-between p-16 z-10">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-teal-500/10 to-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Glowing badge */}
        <div className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full border border-teal-500/20 bg-teal-950/20 text-teal-400 text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Únete a la eficiencia operativa
        </div>

        {/* Dynamic Center Graphic */}
        <div className="my-auto max-w-lg space-y-8 relative">
          <div className="space-y-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Controla todo desde <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">cualquier lugar</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Al registrar tu cuenta, tendrás acceso a herramientas de alta fidelidad diseñadas para agilizar la entrada de órdenes, la facturación y el seguimiento del lavado en tiempo real.
            </p>
          </div>

          {/* List of Benefits */}
          <div className="space-y-4">
            <div className="flex gap-4 items-start">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Seguridad y Roles</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Acceso personalizado según tu puesto (administrador, cajero, supervisor o lavador).</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Órdenes en Tiempo Real</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Visualiza el avance del lavado de vehículos mediante un tablero ágil e interactivo.</p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="h-9 w-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Conectividad de Base de Datos</h4>
                <p className="text-xs text-zinc-400 mt-0.5">Toda la información de tus clientes y caja está sincronizada y respaldada de manera segura.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer brand info */}
        <div className="flex items-center justify-between text-xs text-zinc-600">
          <span>CarWash Pro v1.0</span>
          <span>© 2026 Jackson Tech Inc.</span>
        </div>

      </div>

    </div>
  );
}
