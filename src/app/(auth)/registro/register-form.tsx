"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Car, Loader2, AlertCircle, Eye, EyeOff, Check, ArrowRight } from "lucide-react";
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
        name: nombre,
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden selection:bg-teal-500 selection:text-zinc-950">
      {/* Background Decorative Blur Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-lg z-10">
        {/* Brand/Logo */}
        <div className="flex flex-col items-center mb-6">
          <Link href="/" className="flex items-center gap-2.5 mb-1 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Car className="h-6 w-6 text-zinc-950 font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
                CarWash
              </span>
              <span className="font-semibold text-xl text-zinc-100 tracking-tight"> Pro</span>
            </div>
          </Link>
          <p className="text-xs text-zinc-400">Crea una nueva cuenta de personal administrativo</p>
        </div>

        {/* Card wrapper */}
        <div className="bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-6 sm:p-8 shadow-2xl shadow-black/50">
          <h2 className="text-lg font-bold text-white mb-5 text-center">Registrar Cuenta</h2>

          {/* Success Message */}
          {success && (
            <div className="mb-5 p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Check className="h-4 w-4 stroke-[3]" />
              </div>
              <span>¡Registro exitoso! Redireccionando al panel...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre y Apellido */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nombre <span className="text-teal-400">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  required
                  disabled={isLoading || success}
                  placeholder="Juan"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all disabled:opacity-50 text-sm"
                />
              </div>

              <div>
                <label htmlFor="apellido" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Apellido
                </label>
                <input
                  id="apellido"
                  type="text"
                  disabled={isLoading || success}
                  placeholder="Pérez"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all disabled:opacity-50 text-sm"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Correo Electrónico <span className="text-teal-400">*</span>
              </label>
              <input
                id="email"
                type="email"
                required
                disabled={isLoading || success}
                placeholder="juan.perez@autolavado.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all disabled:opacity-50 text-sm"
              />
            </div>

            {/* Password y Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Contraseña <span className="text-teal-400">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    disabled={isLoading || success}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-10 pl-3.5 pr-10 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all disabled:opacity-50 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Confirmar <span className="text-teal-400">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading || success}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-10 px-3.5 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all disabled:opacity-50 text-sm"
                />
              </div>
            </div>

            {/* Rol y Sucursal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="rol" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Rol del Usuario
                </label>
                <select
                  id="rol"
                  disabled={isLoading || success}
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all text-sm cursor-pointer"
                >
                  <option value="cajero" className="bg-zinc-950 text-zinc-100">Cajero</option>
                  <option value="supervisor" className="bg-zinc-950 text-zinc-100">Supervisor</option>
                  <option value="admin" className="bg-zinc-950 text-zinc-100">Administrador</option>
                  <option value="lavador" className="bg-zinc-950 text-zinc-100">Lavador</option>
                </select>
              </div>

              <div>
                <label htmlFor="sucursal" className="block text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Sucursal Asignada
                </label>
                <select
                  id="sucursal"
                  disabled={isLoading || success}
                  value={sucursalId}
                  onChange={(e) => setSucursalId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-zinc-800 bg-zinc-950 text-zinc-100 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all text-sm cursor-pointer"
                >
                  <option value="" className="bg-zinc-950 text-zinc-100">Ninguna / Central</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id} className="bg-zinc-950 text-zinc-100">
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
              className="w-full h-10 mt-3 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-zinc-950 font-bold rounded-lg shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                <>
                  Registrar Cuenta
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Social Sign In Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-zinc-900/40 px-3 text-zinc-500 font-semibold tracking-wider">O registrarse con</span>
            </div>
          </div>

          {/* Google Sign In */}
          <button
            type="button"
            onClick={async () => {
              setError(null);
              try {
                await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/dashboard",
                });
              } catch (err: any) {
                setError("Error al conectar con Google.");
              }
            }}
            disabled={isLoading || success}
            className="w-full h-10 rounded-lg border border-zinc-800 bg-zinc-950 hover:bg-zinc-900 text-zinc-300 font-medium hover:text-white flex items-center justify-center gap-2.5 transition-colors text-sm disabled:opacity-50 mb-5"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Google
          </button>

          {/* Footer Card Redirect */}
          <div className="text-center">
            <span className="text-xs text-zinc-500">¿Ya tienes una cuenta? </span>
            <Link
              href="/login"
              className="text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
