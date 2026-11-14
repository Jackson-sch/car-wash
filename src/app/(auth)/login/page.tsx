"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  Lock, 
  Mail, 
  Loader2, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  Sparkles, 
  CheckCircle2, 
  TrendingUp, 
  Users, 
  ShieldCheck 
} from "lucide-react";
import Image from "next/image";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { DevQuickLogin, type DevAccount } from "./components/DevQuickLogin";

const loginSchema = z.object({
  email: z.string().email({ message: "Por favor ingresa un correo electrónico válido" }),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
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
    setAuthError(null);
    try {
      const { data, error } = await signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        setAuthError(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
        toast.error(error.message || "Error al iniciar sesión. Verifica tus credenciales.");
      } else {
        setAuthError(null);
        const redirectTo = data?.user?.rol === "superadmin" ? "/superadmin" : "/dashboard";
        toast.success("¡Bienvenido! Iniciando sesión...");
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setAuthError("Ocurrió un error inesperado al iniciar sesión.");
      toast.error("Ocurrió un error inesperado al iniciar sesión.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDevAccount = async (account: DevAccount, autoSubmit = false) => {
    setValue("email", account.email, { shouldValidate: true, shouldDirty: true });
    setValue("password", account.password, { shouldValidate: true, shouldDirty: true });
    setAuthError(null);

    if (autoSubmit) {
      await onSubmit({
        email: account.email,
        password: account.password,
      });
    }
  };

  return (
    <div className="min-h-dvh w-full grid grid-cols-1 lg:grid-cols-12 bg-background text-foreground overflow-x-hidden relative selection:bg-secondary/20 selection:text-foreground">
      
      {/* UNIFIED BACKGROUND EFFECTS */}
      <div className="pointer-events-none absolute inset-0 z-0">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.4)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.4)_1px,transparent_1px)] bg-[size-4rem_4rem] [mask-image-radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-40" />
        {/* Glows */}
        <div className="absolute top-[-10%] left-[20%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[5%] w-[35%] h-[35%] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      {/* LEFT COLUMN: AUTH FORM */}
      <div className="lg:col-span-5 flex flex-col justify-between p-4 sm:p-8 lg:p-12 relative z-10 overflow-y-auto">
        
        {/* Header/Logo */}
        <div className="flex items-center justify-between mb-4 lg:mb-2">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-10 w-10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-300">
              <Image src="/logo-shield.png" alt="WashMaster Logo" width={40} height={40} className="h-full w-full object-contain" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-foreground">
                WashMaster
              </span>
              <span className="font-semibold text-xl text-secondary tracking-tight"> Pro</span>
            </div>
          </Link>
        </div>

        {/* Center Form Container (Glassmorphism Card) */}
        <div className="w-full max-w-md sm:max-w-lg mx-auto my-auto py-4">
          <div className="p-6 sm:p-8 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl shadow-background/50">
            <div className="space-y-1.5 mb-6">
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Bienvenido de nuevo
              </h2>
              <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-normal">
                Ingresa tus credenciales para acceder a la plataforma.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400 group-focus-within:text-secondary transition-colors" />
                  <input
                    id="email"
                    type="email"
                    placeholder="admin@carwashpro.com"
                    className="w-full h-11 pl-11 pr-4 rounded-xl border border-border bg-background/80 dark:bg-card text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-secondary focus:ring-4 focus:ring-secondary/15 focus:outline-none transition-colors transition-shadow duration-300 disabled:opacity-50 text-sm font-medium"
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
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Contraseña
                  </label>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 dark:text-slate-400 group-focus-within:text-secondary transition-colors" />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full h-11 pl-11 pr-11 rounded-xl border border-border bg-background/80 dark:bg-card text-foreground placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:border-secondary focus:ring-4 focus:ring-secondary/15 focus:outline-none transition-colors transition-shadow duration-300 disabled:opacity-50 text-sm font-medium"
                    disabled={loading}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-foreground transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1">{errors.password.message}</p>
                )}
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-xs font-semibold text-destructive animate-in fade-in slide-in-from-top-1 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full h-11 mt-1 bg-secondary hover:bg-sky-400 text-slate-950 font-extrabold rounded-xl shadow-lg shadow-secondary/25 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-sm group tracking-wide"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-slate-950" />
                    Iniciando sesión...
                  </>
                ) : (
                  <>
                    Ingresar a la Plataforma
                    <ArrowRight className="h-4 w-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>

            {/* MODO DESARROLLO: ACCESO RÁPIDO A USUARIOS */}
            <DevQuickLogin
              onSelectAccount={handleSelectDevAccount}
              disabled={loading}
            />

            {/* Redirection */}
            <div className="mt-6 text-center border-t border-border/80 pt-4">
              <span className="text-xs text-slate-600 dark:text-slate-300">¿No tienes una cuenta de personal? </span>
              <span className="text-xs font-bold text-sky-600 dark:text-sky-400">Para mayor información comunícate con tu administrador.</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center lg:text-left mt-2">
          <Link href="/" className="text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-foreground transition-colors inline-flex items-center gap-1">
            ← Volver al inicio
          </Link>
        </div>

      </div>

      {/* RIGHT COLUMN: PREMIUM VISUAL PANEL (Desktop only) */}
      <div className="hidden lg:col-span-7 lg:flex flex-col justify-between p-12 lg:p-16 relative z-10 border-l border-border/70 bg-linear-to-br from-secondary/5 via-transparent to-blue-600/5">
        
        {/* Glowing badge */}
        <div className="self-start inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-extrabold tracking-wide shadow-sm shadow-secondary/10">
          <Sparkles className="h-3.5 w-3.5 text-secondary" />
          Rendimiento y Control Extremo
        </div>

        {/* Dynamic Center Graphic */}
        <div className="my-auto max-w-xl space-y-8 relative">
          <div className="space-y-4">
            <h3 className="text-5xl font-black tracking-tight text-foreground leading-none">
              Lleva tu autolavado al <span className="text-secondary drop-shadow-[0_0_15px_hsl(var(--secondary)/0.4)]">siguiente nivel</span>
            </h3>
            <p className="text-slate-600 dark:text-slate-200 leading-relaxed text-base max-w-md font-normal">
              Nuestra plataforma unificada permite a gerentes, cajeros y lavadores coordinar servicios en tiempo real, optimizando el rendimiento operativo diario.
            </p>
          </div>

          {/* Floating Stats Widgets */}
          <div className="grid grid-cols-2 gap-5">
            {/* Widget 1 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md shadow-xl space-y-3 hover:border-secondary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 text-secondary">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Servicios Hoy</span>
              </div>
              <div className="text-3xl font-black text-foreground tracking-tight">+142 <span className="text-sm text-slate-500 dark:text-slate-300 font-bold">vehículos</span></div>
              {/* Mini visual graph */}
              <div className="flex items-end gap-1 h-8 mt-2">
                <div className="w-2 bg-secondary/30 rounded-sm h-1/2"></div>
                <div className="w-2 bg-secondary/40 rounded-sm h-3/4"></div>
                <div className="w-2 bg-secondary/60 rounded-sm h-2/3"></div>
                <div className="w-2 bg-secondary/80 rounded-sm h-4/5"></div>
                <div className="w-2 bg-secondary rounded-sm h-full"></div>
              </div>
            </div>

            {/* Widget 2 */}
            <div className="p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md shadow-xl space-y-3 hover:border-secondary/40 hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-2 text-secondary">
                <ShieldCheck className="h-5 w-5" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Cierres de Caja</span>
              </div>
              <div className="text-3xl font-black text-foreground tracking-tight">100% <span className="text-sm text-slate-500 dark:text-slate-300 font-bold">Cuadrados</span></div>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full w-full bg-linear-to-r from-secondary/50 to-secondary rounded-full"></div>
                </div>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-300">OK</span>
              </div>
            </div>
          </div>

          {/* Wide Widget */}
          <div className="p-6 rounded-2xl border border-border/80 bg-card/90 backdrop-blur-md shadow-xl flex items-center gap-5 hover:border-secondary/40 hover:-translate-y-1 transition-all duration-300">
            <div className="h-12 w-12 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary shrink-0 border border-secondary/30">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Asignación Directa de Turnos</h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium">Controla la productividad de tus lavadores al instante y sin fricciones.</p>
            </div>
          </div>
        </div>

        {/* Footer brand info */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium border-t border-border/70 pt-6">
          <span className="flex items-center gap-2"><TrendingUp className="h-4 w-4 text-secondary" /> WashMaster Pro v1.0</span>
          <span>© 2026 Jackson Tech Inc.</span>
        </div>

      </div>

    </div>
  );
}
