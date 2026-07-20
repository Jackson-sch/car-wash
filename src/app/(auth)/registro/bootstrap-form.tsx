"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { bootstrapSystem } from "@/lib/actions/bootstrap";
import { toast } from "sonner";

import { BackgroundOrbs } from "./components/BackgroundOrbs";
import { BootstrapHeader } from "./components/BootstrapHeader";
import { BrandSection } from "./components/BrandSection";
import { BootstrapFormFields } from "./components/BootstrapFormFields";

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
      <BackgroundOrbs />
      <BootstrapHeader />

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          
          {/* Left Side: Brand presentation */}
          <BrandSection />

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

              <BootstrapFormFields
                sucursalNombre={sucursalNombre}
                onSucursalNombreChange={setSucursalNombre}
                nombre={nombre}
                onNombreChange={setNombre}
                apellido={apellido}
                onApellidoChange={setApellido}
                email={email}
                onEmailChange={setEmail}
                password={password}
                onPasswordChange={setPassword}
                confirmPassword={confirmPassword}
                onConfirmPasswordChange={setConfirmPassword}
                isLoading={isLoading}
                success={success}
                onSubmit={handleSubmit}
              />

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
