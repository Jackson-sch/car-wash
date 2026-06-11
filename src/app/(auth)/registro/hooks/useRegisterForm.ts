"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function useRegisterForm() {
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
    } catch {
      setError("Ocurrió un error inesperado. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    nombre, setNombre,
    apellido, setApellido,
    email, setEmail,
    password, setPassword,
    confirmPassword, setConfirmPassword,
    rol, setRol,
    sucursalId, setSucursalId,
    showPassword, setShowPassword,
    isLoading, success, error,
    handleSubmit,
  };
}
