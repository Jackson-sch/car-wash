"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CrearEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  onSave: (data: {
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    rol: "admin" | "supervisor" | "cajero" | "lavador";
  }) => Promise<boolean>;
}

export function CrearEmpleadoModal({ isOpen, onClose, isPending, onSave }: CrearEmpleadoModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [rol, setRol] = useState<"admin" | "supervisor" | "cajero" | "lavador">("lavador");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    const success = await onSave({
      nombre,
      apellido,
      email,
      telefono,
      rol,
    });

    if (success) {
      setNombre("");
      setApellido("");
      setEmail("");
      setTelefono("");
      setRol("lavador");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Registrar Nuevo Personal</h3>
            <p className="text-xs text-muted-foreground mt-1">Completa los datos del nuevo miembro del equipo.</p>
          </div>
          <button type="button" onClick={onClose}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empNom" className="text-xs font-bold text-muted-foreground">Nombres *</Label>
              <Input
                id="empNom"
                placeholder="Darwin"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="bg-card border-border focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empApe" className="text-xs font-bold text-muted-foreground">Apellidos</Label>
              <Input
                id="empApe"
                placeholder="Jackson"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="bg-card border-border focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="empMail" className="text-xs font-bold text-muted-foreground">Email *</Label>
            <Input
              id="empMail"
              type="email"
              placeholder="empleado@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-card border-border focus:border-secondary text-xs h-9 rounded-lg"
            />
            <p className="text-[10px] text-muted-foreground mt-1">
              Contraseña inicial: <code className="bg-muted px-1.5 py-0.5 rounded font-mono font-bold text-foreground">WashMaster2026!</code>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="empTel" className="text-xs font-bold text-muted-foreground">Teléfono Celular</Label>
              <Input
                id="empTel"
                type="tel"
                placeholder="999888777"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="bg-card border-border focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="empRol" className="text-xs font-bold text-muted-foreground">Rol Asignado</Label>
              <Select
                value={rol}
                onValueChange={(val: string | null) => val && setRol(val as "admin" | "supervisor" | "cajero" | "lavador")}
              >
                <SelectTrigger id="empRol" className="w-full bg-card border-border text-foreground rounded-lg text-xs h-9 px-3">
                  <SelectValue>
                    {(val) => {
                      const map: Record<string, string> = {
                        lavador: "Lavador / Operario",
                        cajero: "Cajero / Administrativo",
                        supervisor: "Supervisor de Patio",
                        admin: "Administrador General",
                      };
                      return map[val] || val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full bg-card text-card-foreground border border-border">
                  <SelectItem value="lavador">Lavador / Operario</SelectItem>
                  <SelectItem value="cajero">Cajero / Administrativo</SelectItem>
                  <SelectItem value="supervisor">Supervisor de Patio</SelectItem>
                  <SelectItem value="admin">Administrador General</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-border pt-4 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 rounded-lg px-5 shadow-sm cursor-pointer"
            >
              {isPending ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
