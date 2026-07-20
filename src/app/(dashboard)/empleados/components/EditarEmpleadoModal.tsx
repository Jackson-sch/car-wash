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

interface Empleado {
  id: string;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  rol: "superadmin" | "admin" | "supervisor" | "cajero" | "lavador";
  activo: boolean | null;
}

interface EditarEmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  empleado: Empleado | null;
  currentUserId: string | undefined;
  onSave: (
    id: string,
    data: {
      nombre: string;
      apellido: string;
      telefono: string;
      rol: "admin" | "supervisor" | "cajero" | "lavador";
    }
  ) => Promise<boolean>;
}

export function EditarEmpleadoModal(props: EditarEmpleadoModalProps) {
  const { isOpen, empleado } = props;
  if (!isOpen || !empleado) return null;

  // Usamos key={empleado.id} para que React remonte el formulario
  // con estado fresco cuando se selecciona un empleado distinto,
  // evitando así el patrón useEffect + setState que el linter rechaza.
  return (
    <EditarEmpleadoForm
      key={empleado.id}
      empleado={empleado}
      onClose={props.onClose}
      isPending={props.isPending}
      currentUserId={props.currentUserId}
      onSave={props.onSave}
    />
  );
}

// Tipo separado para el subcomponente: omite `isOpen` (solo la usa el padre)
// y exige `empleado` no-null (el padre ya validó que existe).
type EditarEmpleadoFormProps = Omit<EditarEmpleadoModalProps, 'isOpen'> & {
  empleado: NonNullable<EditarEmpleadoModalProps['empleado']>;
};

function EditarEmpleadoForm({
  onClose,
  isPending,
  empleado,
  currentUserId,
  onSave,
}: EditarEmpleadoFormProps) {
  const [nombre, setNombre] = useState(empleado.nombre);
  const [apellido, setApellido] = useState(empleado.apellido || "");
  const [telefono, setTelefono] = useState(empleado.telefono || "");
  const [rol, setRol] = useState<"admin" | "supervisor" | "cajero" | "lavador">(
    empleado.rol === "superadmin" ? "admin" : (empleado.rol as "admin" | "supervisor" | "cajero" | "lavador")
  );

  const isSelf = currentUserId === empleado.id;
  const isSuperAdmin = empleado.rol === "superadmin";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const success = await onSave(empleado.id, {
      nombre,
      apellido,
      telefono,
      rol,
    });

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Modificar Ficha de Personal</h3>
            <p className="text-xs text-muted-foreground mt-1">Actualiza la información laboral del empleado.</p>
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
              <Label htmlFor="editNom" className="text-xs font-bold text-muted-foreground">Nombres *</Label>
              <Input
                id="editNom"
                placeholder="Darwin"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                disabled={isSuperAdmin}
                className="bg-card border-border focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editApe" className="text-xs font-bold text-muted-foreground">Apellidos</Label>
              <Input
                id="editApe"
                placeholder="Jackson"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                disabled={isSuperAdmin}
                className="bg-card border-border focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="editMail" className="text-xs font-bold text-muted-foreground">Email (Solo lectura)</Label>
            <Input
              id="editMail"
              type="email"
              value={empleado.email}
              disabled
              className="bg-muted/40 border-border text-xs h-9 rounded-lg cursor-not-allowed opacity-75 font-semibold text-muted-foreground"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="editTel" className="text-xs font-bold text-muted-foreground">Teléfono Celular</Label>
              <Input
                id="editTel"
                type="tel"
                placeholder="999888777"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                disabled={isSuperAdmin}
                className="bg-card border-border focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="editRol" className="text-xs font-bold text-muted-foreground">Rol Asignado</Label>
              <Select
                value={rol}
                onValueChange={(val: string | null) => val && setRol(val as "admin" | "supervisor" | "cajero" | "lavador")}
                disabled={isSelf || isSuperAdmin}
              >
                <SelectTrigger id="editRol" className="w-full bg-card border-border text-foreground rounded-lg text-xs h-9 px-3 disabled:cursor-not-allowed disabled:opacity-65">
                  <SelectValue>
                    {(val) => {
                      const map: Record<string, string> = {
                        lavador: "Lavador / Operario",
                        cajero: "Cajero / Administrativo",
                        supervisor: "Supervisor de Patio",
                        admin: "Administrador General",
                        superadmin: "Super Administrador",
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

          {isSelf && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-500/5 border border-amber-500/10 p-2 rounded-xl">
              ⚠️ Estás editando tu propia cuenta. Por seguridad, no puedes rebajar o cambiar tu propio rol de administrador.
            </p>
          )}

          {isSuperAdmin && (
            <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-500/5 border border-indigo-500/10 p-2 rounded-xl">
              🛡️ Esta es una cuenta de Super Administrador del sistema. Las modificaciones están restringidas.
            </p>
          )}

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
              disabled={isPending || isSuperAdmin}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 rounded-lg px-5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
