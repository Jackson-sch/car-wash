"use client";

import { useState } from "react";
import { User, Phone, Mail, ChevronDown, ChevronUp, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ClienteQuickFormProps {
  clienteNombre: string;
  setClienteNombre: (v: string) => void;
  clienteApellido: string;
  setClienteApellido: (v: string) => void;
  clienteTelefono: string;
  setClienteTelefono: (v: string) => void;
  clienteEmail: string;
  setClienteEmail: (v: string) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
}

export function ClienteQuickForm({
  clienteNombre,
  setClienteNombre,
  clienteApellido,
  setClienteApellido,
  clienteTelefono,
  setClienteTelefono,
  clienteEmail,
  setClienteEmail,
  inputRef,
}: ClienteQuickFormProps) {
  const [showOptional, setShowOptional] = useState(false);

  return (
    <div className="bg-card border border-border/80 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
            <User className="size-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
              Datos del Cliente
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Asociación para puntos de fidelidad y notificaciones WhatsApp
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-flex items-center text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-muted text-muted-foreground border border-border">
            Alt + C
          </span>
          <button
            type="button"
            onClick={() => setShowOptional(!showOptional)}
            className="text-xs text-secondary hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            {showOptional ? "Menos campos" : "+ Apellidos / Correo"}
            {showOptional ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Teléfono Celular */}
        <div className="space-y-1">
          <Label htmlFor="cliente-telefono" className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <Phone className="size-3.5 text-muted-foreground" />
            <span>Teléfono Celular (WhatsApp)</span>
          </Label>
          <Input
            id="cliente-telefono"
            ref={inputRef}
            placeholder="987 654 321"
            value={clienteTelefono}
            onChange={(e) => setClienteTelefono(e.target.value)}
            className="h-10 text-sm bg-background border-border rounded-xl focus:border-secondary font-medium"
          />
        </div>

        {/* Nombres del Cliente */}
        <div className="space-y-1">
          <Label htmlFor="cliente-nombre" className="text-xs font-bold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-muted-foreground" />
              <span>Nombres *</span>
            </span>
            <span className="text-[10px] text-amber-500 font-semibold">Obligatorio</span>
          </Label>
          <Input
            id="cliente-nombre"
            placeholder="Ej. Juan Carlos"
            value={clienteNombre}
            onChange={(e) => setClienteNombre(e.target.value)}
            required
            className="h-10 text-sm bg-background border-border rounded-xl focus:border-secondary font-medium"
          />
        </div>
      </div>

      {/* Campos Opcionales (Apellidos y Correo) */}
      {showOptional && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60 animate-in fade-in-50 duration-200">
          <div className="space-y-1">
            <Label htmlFor="cliente-apellido" className="text-xs font-semibold text-muted-foreground">
              Apellidos
            </Label>
            <Input
              id="cliente-apellido"
              placeholder="Ej. Pérez Quispe"
              value={clienteApellido}
              onChange={(e) => setClienteApellido(e.target.value)}
              className="h-9 text-xs bg-background border-border rounded-lg"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="cliente-email" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Mail className="size-3 text-muted-foreground" />
              <span>Correo Electrónico</span>
            </Label>
            <Input
              id="cliente-email"
              type="email"
              placeholder="cliente@ejemplo.com"
              value={clienteEmail}
              onChange={(e) => setClienteEmail(e.target.value)}
              className="h-9 text-xs bg-background border-border rounded-lg"
            />
          </div>
        </div>
      )}
    </div>
  );
}
