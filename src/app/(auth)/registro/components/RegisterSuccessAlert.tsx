"use client";

import { Check } from "lucide-react";

interface RegisterSuccessAlertProps {
  show: boolean;
}

export function RegisterSuccessAlert({ show }: RegisterSuccessAlertProps) {
  if (!show) return null;

  return (
    <div className="mb-5 p-4 rounded-lg bg-emerald-950/20 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <div className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
        <Check className="h-3.5 w-3.5 stroke-[3]" />
      </div>
      <span>¡Registro exitoso! Redireccionando...</span>
    </div>
  );
}
