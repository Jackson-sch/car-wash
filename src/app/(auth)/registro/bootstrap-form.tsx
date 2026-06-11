"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, ArrowRight, CheckCircle2, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { bootstrapSystem } from "@/lib/actions/bootstrap";
import { toast } from "sonner";

export default function BootstrapForm() {
  const router = useRouter();
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [sucursalNombre, setSucursalNombre] = useState("Sucursal Principal");
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim() || !password.trim() || !sucursalNombre.trim()) {
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
      const res = await bootstrapSystem({
        nombre,
        apellido,
        email,
        password,
        sucursalNombre,
      });

      if (res.success) {
        setSuccess(true);
        toast.success("¡Sistema inicializado con éxito!", {
          description: "Redireccionando a la pantalla de login...",
        });
        setTimeout(() => {
          router.push("/login");
          router.refresh();
        }, 2000);
      } else {
        setError(res.error || "Ocurrió un error al inicializar el sistema.");
      }
    } catch (err) {
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden text-foreground"
      style={{ backgroundColor: "#050510" }}
    >
      {/* Background glow orbs */}
      <div
        className="absolute w-[350px] h-[350px] rounded-full filter blur-[100px] opacity-[0.25] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
          top: "10%",
          left: "15%",
        }}
      />
      <div
        className="absolute w-[400px] h-[400px] rounded-full filter blur-[120px] opacity-[0.2] pointer-events-none"
        style={{
          background: "radial-gradient(circle, #8b5cf6 0%, transparent 70%)",
          bottom: "10%",
          right: "15%",
        }}
      />

      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]" />
          <span className="font-extrabold tracking-wider text-sm text-white">
            WashMaster<span className="text-cyan-400"> Pro</span>
          </span>
        </div>
        <div className="text-xs text-white/50 flex items-center gap-1.5 font-medium">
          <HelpCircle className="h-4 w-4" />
          Configuración Inicial
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Brand presentation */}
          <div className="md:col-span-5 space-y-6 text-left hidden md:block">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-cyan-500/20 bg-cyan-950/10 text-cyan-400 text-[10px] font-bold tracking-wider uppercase animate-pulse">
              Instalador del Sistema
            </div>
            <h1 className="text-3xl font-extrabold leading-tight text-white tracking-tight">
              Configura tu primer autolavado en <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400">segundos</span>.
            </h1>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Al no detectarse usuarios en la base de datos, has entrado al asistente de inicialización. Define tus datos de Administrador y el nombre de la sucursal matriz para arrancar el sistema.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mt-0.5">1</div>
                <p className="text-xs text-zinc-400 font-medium">Se crea la sucursal matriz por defecto.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mt-0.5">2</div>
                <p className="text-xs text-zinc-400 font-medium">Se crea la primera cuenta con rol de Administrador.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-cyan-950/30 border border-cyan-500/20 flex items-center justify-center text-[10px] font-bold text-cyan-400 mt-0.5">3</div>
                <p className="text-xs text-zinc-400 font-medium">Una vez creada, el registro público se bloquea automáticamente por seguridad.</p>
              </div>
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="md:col-span-7 flex justify-center">
            <Card
              className="w-full max-w-xl p-8 rounded-2xl border backdrop-blur-xl transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)]"
              style={{
                backgroundColor: "rgba(10, 10, 15, 0.7)",
                borderColor: "rgba(255, 255, 255, 0.08)",
                boxShadow: "0 0 40px rgba(59, 130, 246, 0.05)",
              }}
            >
              <div className="space-y-2 mb-6">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Inicializar WashMaster Pro
                </h2>
                <p className="text-zinc-400 text-xs font-medium">
                  Configura la cuenta raíz del administrador y la sucursal inicial.
                </p>
              </div>

              {success && (
                <div className="mb-6 p-4 rounded-xl border border-emerald-500/20 bg-emerald-950/10 text-emerald-400 text-xs flex items-center gap-3 animate-in fade-in duration-300">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <div>
                    <span className="font-bold">¡Inicialización exitosa!</span> Redireccionando a la pantalla de ingreso.
                  </div>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-500/20 bg-red-950/10 text-red-400 text-xs animate-in fade-in duration-300 font-bold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Sucursal Input */}
                <div className="space-y-2 border-b border-white/5 pb-4">
                  <Label htmlFor="sucNombre" className="text-xs font-bold text-zinc-400">
                    Nombre de la Sucursal Principal *
                  </Label>
                  <Input
                    id="sucNombre"
                    placeholder="Ej. Sucursal Central Miraflores"
                    value={sucursalNombre}
                    onChange={(e) => setSucursalNombre(e.target.value)}
                    required
                    disabled={isLoading || success}
                    className="h-10 bg-white/5 border-white/10 text-white focus:border-cyan-400 placeholder:text-zinc-600 rounded-lg text-xs"
                  />
                </div>

                {/* Admin Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admNom" className="text-xs font-bold text-zinc-400">
                      Nombres del Administrador *
                    </Label>
                    <Input
                      id="admNom"
                      placeholder="Alex"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      required
                      disabled={isLoading || success}
                      className="h-10 bg-white/5 border-white/10 text-white focus:border-cyan-400 placeholder:text-zinc-650 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admApe" className="text-xs font-bold text-zinc-400">
                      Apellidos
                    </Label>
                    <Input
                      id="admApe"
                      placeholder="Administrador"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      disabled={isLoading || success}
                      className="h-10 bg-white/5 border-white/10 text-white focus:border-cyan-400 placeholder:text-zinc-650 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admEmail" className="text-xs font-bold text-zinc-400">
                    Correo Electrónico *
                  </Label>
                  <Input
                    id="admEmail"
                    type="email"
                    placeholder="admin@autolavado.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading || success}
                    className="h-10 bg-white/5 border-white/10 text-white focus:border-cyan-400 placeholder:text-zinc-650 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="admPass" className="text-xs font-bold text-zinc-400">
                      Contraseña *
                    </Label>
                    <Input
                      id="admPass"
                      type="password"
                      placeholder="••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading || success}
                      className="h-10 bg-white/5 border-white/10 text-white focus:border-cyan-400 placeholder:text-zinc-650 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admConfirm" className="text-xs font-bold text-zinc-400">
                      Confirmar Contraseña *
                    </Label>
                    <Input
                      id="admConfirm"
                      type="password"
                      placeholder="••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading || success}
                      className="h-10 bg-white/5 border-white/10 text-white focus:border-cyan-400 placeholder:text-zinc-650 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || success}
                  className="w-full h-10 mt-4 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-bold rounded-lg shadow-lg flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                      Inicializando sistema...
                    </>
                  ) : (
                    <>
                      Inicializar y Guardar
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center border-t border-white/5 pt-4">
                <Link
                  href="/login"
                  className="text-xs font-semibold text-cyan-400 hover:underline"
                >
                  ← Ir al Inicio de Sesión
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-t border-white/5 text-xs text-white/30 z-10">
        <span>© 2026 Jackson Tech Inc.</span>
        <span>v1.0 Installer</span>
      </footer>
    </div>
  );
}
