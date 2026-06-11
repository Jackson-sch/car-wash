"use client";

import { Eye, EyeOff } from "lucide-react";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InputField } from "./InputField";

interface Branch {
  id: string;
  nombre: string;
}

interface RegisterFormFieldsProps {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  rol: string;
  sucursalId: string;
  showPassword: boolean;
  isLoading: boolean;
  success: boolean;
  branches: Branch[];
  onNombreChange: (v: string) => void;
  onApellidoChange: (v: string) => void;
  onEmailChange: (v: string) => void;
  onPasswordChange: (v: string) => void;
  onConfirmPasswordChange: (v: string) => void;
  onRolChange: (v: string) => void;
  onSucursalChange: (v: string) => void;
  onTogglePassword: (v: boolean) => void;
}

export function RegisterFormFields({
  nombre, apellido, email, password, confirmPassword,
  rol, sucursalId, showPassword,
  isLoading, success, branches,
  onNombreChange, onApellidoChange, onEmailChange,
  onPasswordChange, onConfirmPasswordChange,
  onRolChange, onSucursalChange, onTogglePassword,
}: RegisterFormFieldsProps) {
  const disabled = isLoading || success;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          id="nombre"
          label="Nombre"
          required
          placeholder="Juan"
          value={nombre}
          onChange={onNombreChange}
          disabled={disabled}
        />
        <InputField
          id="apellido"
          label="Apellido"
          placeholder="Pérez"
          value={apellido}
          onChange={onApellidoChange}
          disabled={disabled}
        />
      </div>

      <InputField
        id="email"
        label="Correo Electrónico"
        type="email"
        required
        placeholder="juan@carwash.com"
        value={email}
        onChange={onEmailChange}
        disabled={disabled}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Contraseña <span className="text-secondary">*</span>
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="••••••••"
              className="w-full h-10 pl-3.5 pr-10 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground/60 focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm"
              disabled={disabled}
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
            />
            <button
              type="button"
              onClick={() => onTogglePassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
            </button>
          </div>
        </div>

        <InputField
          id="confirmPassword"
          label="Confirmar"
          type={showPassword ? "text" : "password"}
          required
          placeholder="••••••••"
          value={confirmPassword}
          onChange={onConfirmPasswordChange}
          disabled={disabled}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label htmlFor="rol" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Rol
          </label>
          <Select
            value={rol}
            disabled={disabled}
            onValueChange={(val: string | null) => val && onRolChange(val)}
          >
            <SelectTrigger id="rol" className="w-full h-10 px-3.5 rounded-lg border border-input bg-card text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm">
              <SelectValue>
                {(val: string) => {
                  const rolesMap: Record<string, string> = {
                    admin: "Administrador",
                    supervisor: "Supervisor",
                    cajero: "Cajero",
                    lavador: "Lavador",
                  };
                  return rolesMap[val] || val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full bg-card text-foreground border border-border">
              <SelectItem value="cajero">Cajero</SelectItem>
              <SelectItem value="supervisor">Supervisor</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="lavador">Lavador</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="sucursal" className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Sucursal
          </label>
          <Select
            value={sucursalId || "none"}
            disabled={disabled}
            onValueChange={(val: string | null) => onSucursalChange(!val || val === "none" ? "" : val)}
          >
            <SelectTrigger id="sucursal" className="w-full h-10 px-3.5 rounded-lg border border-input bg-card text-foreground focus:border-secondary focus:ring-2 focus:ring-secondary/15 focus:outline-none transition-all duration-300 disabled:opacity-50 text-sm">
              <SelectValue placeholder="Ninguna / Central">
                {(val: string) => {
                  if (!val || val === "none") return "Ninguna / Central";
                  const branch = branches.find((b) => b.id === val);
                  return branch ? branch.nombre : val;
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="w-full bg-card text-foreground border border-border">
              <SelectItem value="none">Ninguna / Central</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
