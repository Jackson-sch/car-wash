"use client";

import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface FormFieldsProps {
  sucursalNombre: string;
  onSucursalNombreChange: (val: string) => void;
  nombre: string;
  onNombreChange: (val: string) => void;
  apellido: string;
  onApellidoChange: (val: string) => void;
  email: string;
  onEmailChange: (val: string) => void;
  password: string;
  onPasswordChange: (val: string) => void;
  confirmPassword: string;
  onConfirmPasswordChange: (val: string) => void;
  isLoading: boolean;
  success: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function BootstrapFormFields({
  sucursalNombre, onSucursalNombreChange,
  nombre, onNombreChange,
  apellido, onApellidoChange,
  email, onEmailChange,
  password, onPasswordChange,
  confirmPassword, onConfirmPasswordChange,
  isLoading, success, onSubmit,
}: FormFieldsProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2 border-b border-white/5 pb-4">
        <Label htmlFor="sucNombre" className="text-xs font-bold text-zinc-400">
          Nombre de la Sucursal Principal *
        </Label>
        <Input
          id="sucNombre"
          placeholder="Ej. Sucursal Central Miraflores"
          value={sucursalNombre}
          onChange={(e) => onSucursalNombreChange(e.target.value)}
          required
          disabled={isLoading || success}
          className="h-10 bg-white/5 border-white/10 text-white focus:border-cyan-400 placeholder:text-zinc-600 rounded-lg text-xs"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="admNom" className="text-xs font-bold text-zinc-400">
            Nombres del Administrador *
          </Label>
          <Input
            id="admNom"
            placeholder="Alex"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
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
            onChange={(e) => onApellidoChange(e.target.value)}
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
          onChange={(e) => onEmailChange(e.target.value)}
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
            onChange={(e) => onPasswordChange(e.target.value)}
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
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
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
  );
}
