"use client";

import { AlertCircle } from "lucide-react";

interface RegisterErrorAlertProps {
  message: string | null;
}

export function RegisterErrorAlert({ message }: RegisterErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="mb-5 p-4 rounded-lg bg-red-950/20 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
      <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
