"use client";

import Link from "next/link";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { useRegisterForm } from "./hooks/useRegisterForm";
import { RegisterFormFields } from "./components/RegisterFormFields";
import { RegisterSuccessAlert } from "./components/RegisterSuccessAlert";
import { RegisterErrorAlert } from "./components/RegisterErrorAlert";
import { RegisterLayout } from "./components/RegisterLayout";
import { RegisterBenefitsPanel } from "./components/RegisterBenefitsPanel";

interface Branch {
  id: string;
  nombre: string;
}

interface RegisterFormProps {
  branches: Branch[];
}

export default function RegisterForm({ branches }: RegisterFormProps) {
  const {
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
  } = useRegisterForm();

  return (
    <RegisterLayout
      leftPanel={
        <div className="w-full max-w-md mx-auto my-auto py-6">
          <div className="space-y-2 mb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-foreground">
              Crear Cuenta Administrativa
            </h2>
            <p className="text-muted-foreground text-xs">
              Únete al equipo administrativo y operativo de WashMaster.
            </p>
          </div>

          <RegisterSuccessAlert show={success} />
          <RegisterErrorAlert message={error} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <RegisterFormFields
              nombre={nombre}
              apellido={apellido}
              email={email}
              password={password}
              confirmPassword={confirmPassword}
              rol={rol}
              sucursalId={sucursalId}
              showPassword={showPassword}
              isLoading={isLoading}
              success={success}
              branches={branches}
              onNombreChange={setNombre}
              onApellidoChange={setApellido}
              onEmailChange={setEmail}
              onPasswordChange={setPassword}
              onConfirmPasswordChange={setConfirmPassword}
              onRolChange={setRol}
              onSucursalChange={setSucursalId}
              onTogglePassword={setShowPassword}
            />

            <Button
              type="submit"
              disabled={isLoading || success}
              className="w-full h-10 mt-3 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer text-sm"
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

          <div className="mt-6 text-center border-t border-border pt-4">
            <span className="text-xs text-muted-foreground">¿Ya tienes una cuenta? </span>
            <Link
              href="/login"
              className="text-xs font-bold text-secondary hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </div>
        </div>
      }
      rightPanel={<RegisterBenefitsPanel />}
    />
  );
}
