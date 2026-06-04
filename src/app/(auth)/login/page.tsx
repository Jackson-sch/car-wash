"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Car, Lock, Mail, Loader2, ArrowRight, Eye, EyeOff, Sparkles, CheckCircle2, TrendingUp, Users } from "lucide-react";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";

const loginSchema = z.object({
  email: z.string().email("Por favor ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      const { error } = await signIn.email({
        email: values.email,
        password: values.password,
        callbackURL: "/dashboard",
      });

      if (error) {
        toast.error(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      } else {
        toast.success("Sesión iniciada con éxito");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      toast.error("Ocurrió un error inesperado al iniciar sesión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-zinc-950 text-zinc-100 overflow-hidden relative selection:bg-teal-500 selection:text-zinc-950">
      
      {/* BACKGROUND GLOWS (Mobile & Desktop) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* LEFT COLUMN: AUTH FORM */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative z-10 bg-zinc-950/40 backdrop-blur-md border-r border-zinc-900/50">
        
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-8 lg:mb-0">
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
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-white">
              Bienvenido de nuevo
            </h2>
            <p className="text-zinc-400 text-sm">
              Ingresa tus credenciales para acceder a la plataforma administrativa.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@carwash.com"
                  className="w-full h-11 pl-11 pr-4 rounded-xl border border-zinc-800/80 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={loading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  Contraseña
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-zinc-500 group-focus-within:text-teal-400 transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-11 pl-11 pr-11 rounded-xl border border-zinc-800/80 bg-zinc-900/30 text-zinc-100 placeholder-zinc-600 focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/10 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={loading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-rose-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600 bg-[length:200%_auto] hover:bg-right text-zinc-950 font-extrabold rounded-xl shadow-lg shadow-teal-500/10 flex items-center justify-center gap-2 transition-all duration-500 cursor-pointer text-sm"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  Ingresar a la Plataforma
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>

          {/* Redirection */}
          <div className="mt-8 text-center border-t border-zinc-900/80 pt-6">
            <span className="text-xs text-zinc-500">¿No tienes una cuenta de personal? </span>
            <Link
              href="/registro"
              className="text-xs font-bold text-teal-400 hover:text-teal-300 transition-colors hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center lg:text-left">
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
          Rendimiento y Control Extremo
        </div>

        {/* Dynamic Center Graphic (Stats Dashboard concept) */}
        <div className="my-auto max-w-lg space-y-8 relative">
          <div className="space-y-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Lleva tu autolavado al <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">siguiente nivel</span>
            </h3>
            <p className="text-zinc-400 leading-relaxed text-sm">
              Nuestra plataforma unificada permite a gerentes, cajeros y lavadores coordinar servicios en tiempo real, optimizando el rendimiento operativo diario.
            </p>
          </div>

          {/* Floating Stats Widgets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm space-y-2 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 text-teal-400">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Servicios Hoy</span>
              </div>
              <div className="text-2xl font-black text-white">+142 vehículos</div>
              <p className="text-[10px] text-zinc-500">Capacidad óptima en tiempo real</p>
            </div>

            <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm space-y-2 hover:border-zinc-700 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400">
                <TrendingUp className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Cierres de Caja</span>
              </div>
              <div className="text-2xl font-black text-white">100% Cuadrados</div>
              <p className="text-[10px] text-zinc-500">Cero discrepancias auditadas</p>
            </div>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-800/80 bg-zinc-950/50 backdrop-blur-sm flex items-center gap-4 hover:border-zinc-700 transition-colors">
            <div className="h-10 w-10 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Asignación Directa de Turnos</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">Controla la productividad de tus lavadores al instante.</p>
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
