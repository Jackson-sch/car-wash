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
      const { data, error } = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      } else if (data?.user) {
        const redirectTo = data.user.rol === "superadmin" ? "/superadmin" : "/dashboard";
        toast.success("Sesión iniciada con éxito");
        window.location.href = redirectTo;
      }
    } catch (err) {
      toast.error("Ocurrió un error inesperado al iniciar sesión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground overflow-hidden relative selection:bg-secondary/20 selection:text-foreground">
      
      {/* BACKGROUND GLOWS (Mobile & Desktop) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/5 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* LEFT COLUMN: AUTH FORM */}
      <div className="lg:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-16 relative z-10 bg-card/40 border-r border-border">
        
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-8 lg:mb-0">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shadow-md shadow-secondary/10 group-hover:scale-105 transition-transform duration-300">
              <Car className="h-5.5 w-5.5 text-secondary-foreground font-bold" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                WashMaster
              </span>
              <span className="font-semibold text-xl text-secondary tracking-tight"> Pro</span>
            </div>
          </Link>
        </div>

        {/* Center Form Container */}
        <div className="w-full max-w-md mx-auto my-auto py-8">
          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
              Bienvenido de nuevo
            </h2>
            <p className="text-muted-foreground text-sm">
              Ingresa tus credenciales para acceder a la plataforma administrativa.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Correo Electrónico
              </label>
              <div className="relative group">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@carwash.com"
                  className="w-full h-11 pl-11 pr-4 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={loading}
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">{errors.email.message}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  Contraseña
                </label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground group-focus-within:text-secondary transition-colors" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full h-11 pl-11 pr-11 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
                  disabled={loading}
                  {...register("password")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 mt-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-sm"
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
          <div className="mt-8 text-center border-t border-border pt-6">
            <span className="text-xs text-muted-foreground">¿No tienes una cuenta de personal? </span>
            <Link
              href="/registro"
              className="text-xs font-bold text-secondary hover:underline"
            >
              Regístrate aquí
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center lg:text-left">
          <Link href="/" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1">
            ← Volver al inicio
          </Link>
        </div>

      </div>

      {/* RIGHT COLUMN: PREMIUM VISUAL PANEL (Desktop only) */}
      <div className="hidden lg:col-span-7 bg-muted/30 border-l border-border relative overflow-hidden lg:flex flex-col justify-between p-16 z-10">
        
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--foreground)/0.03)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--foreground)/0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-sky-500/10 to-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Glowing badge */}
        <div className="self-start inline-flex items-center gap-2 px-3 py-1 rounded-full border border-secondary/20 bg-secondary/5 text-secondary text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          Rendimiento y Control Extremo
        </div>

        {/* Dynamic Center Graphic (Stats Dashboard concept) */}
        <div className="my-auto max-w-lg space-y-8 relative">
          <div className="space-y-4">
            <h3 className="text-4xl font-extrabold tracking-tight text-foreground leading-tight">
              Lleva tu autolavado al <span className="text-secondary">siguiente nivel</span>
            </h3>
            <p className="text-muted-foreground leading-relaxed text-sm">
              Nuestra plataforma unificada permite a gerentes, cajeros y lavadores coordinar servicios en tiempo real, optimizando el rendimiento operativo diario.
            </p>
          </div>

          {/* Floating Stats Widgets */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-lg border border-border bg-card/80 shadow-sm space-y-2 hover:border-secondary/30 transition-all duration-300">
              <div className="flex items-center gap-2 text-secondary">
                <CheckCircle2 className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Servicios Hoy</span>
              </div>
              <div className="text-2xl font-black text-foreground">+142 vehículos</div>
              <p className="text-[10px] text-muted-foreground/80">Capacidad óptima en tiempo real</p>
            </div>

            <div className="p-5 rounded-lg border border-border bg-card/80 shadow-sm space-y-2 hover:border-secondary/30 transition-all duration-300">
              <div className="flex items-center gap-2 text-secondary">
                <TrendingUp className="h-4.5 w-4.5" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Cierres de Caja</span>
              </div>
              <div className="text-2xl font-black text-foreground">100% Cuadrados</div>
              <p className="text-[10px] text-muted-foreground/80">Cero discrepancias auditadas</p>
            </div>
          </div>

          <div className="p-5 rounded-lg border border-border bg-card/80 shadow-sm flex items-center gap-4 hover:border-secondary/30 transition-all duration-300">
            <div className="h-10 w-10 rounded-md bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Asignación Directa de Turnos</h4>
              <p className="text-[11px] text-muted-foreground mt-0.5">Controla la productividad de tus lavadores al instante.</p>
            </div>
          </div>
        </div>

        {/* Footer brand info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>WashMaster Pro v1.0</span>
          <span>© 2026 Jackson Tech Inc.</span>
        </div>

      </div>

    </div>
  );
}
