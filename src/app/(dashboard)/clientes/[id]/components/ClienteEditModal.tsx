"use client";

import { useState } from "react";
import { X, Pencil, Save } from "lucide-react";
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
import { updateClienteAction } from "@/lib/actions/clientes";
import { toast } from "sonner";
import type { ClienteData } from "../types";

interface ClienteEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: ClienteData;
  onClientUpdated: (updated: Partial<ClienteData>) => void;
}

export function ClienteEditModal({
  isOpen,
  onClose,
  cliente,
  onClientUpdated,
}: ClienteEditModalProps) {
  const [nombre, setNombre] = useState(cliente.nombre || "");
  const [apellido, setApellido] = useState(cliente.apellido || "");
  const [telefono, setTelefono] = useState(cliente.telefono || "");
  const [email, setEmail] = useState(cliente.email || "");
  const [tipoDoc, setTipoDoc] = useState<"DNI" | "RUC" | "CE" | "PASAPORTE" | "">(
    (cliente.tipoDoc as "DNI" | "RUC" | "CE" | "PASAPORTE") || "DNI"
  );
  const [nroDoc, setNroDoc] = useState(cliente.nroDoc || "");
  const [notas, setNotas] = useState(cliente.notas || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre es obligatorio");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updateClienteAction({
        id: cliente.id,
        nombre,
        apellido,
        telefono,
        email,
        tipoDoc: tipoDoc ? (tipoDoc as "DNI" | "RUC" | "CE" | "PASAPORTE") : null,
        nroDoc,
        notas,
      });

      if (res.success) {
        toast.success("Datos del cliente actualizados correctamente");
        onClientUpdated({
          nombre,
          apellido,
          telefono,
          email,
          tipoDoc: tipoDoc || null,
          nroDoc,
          notas,
        });
        onClose();
      } else {
        toast.error(res.error || "No se pudo actualizar el cliente");
      }
    } catch {
      toast.error("Ocurrió un error inesperado al actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <Pencil className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">Editar Datos del Cliente</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Actualiza datos de contacto, documento y observaciones.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edNom" className="text-xs font-bold text-muted-foreground">
                  Nombres *
                </Label>
                <Input
                  id="edNom"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  required
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edApe" className="text-xs font-bold text-muted-foreground">
                  Apellidos
                </Label>
                <Input
                  id="edApe"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edTipoDoc" className="text-xs font-bold text-muted-foreground">
                  Tipo de Documento
                </Label>
                <Select
                  value={tipoDoc}
                  onValueChange={(val: string | null) =>
                    setTipoDoc((val as "DNI" | "RUC" | "CE" | "PASAPORTE") || "")
                  }
                >
                  <SelectTrigger
                    id="edTipoDoc"
                    className="w-full bg-background border-border text-foreground rounded-xl text-xs h-10 px-3.5"
                  >
                    <SelectValue placeholder="Tipo de Documento">
                      {tipoDoc || "Seleccionar..."}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border border-border">
                    <SelectItem value="DNI">DNI (Documento Nacional)</SelectItem>
                    <SelectItem value="RUC">RUC (Persona o Empresa)</SelectItem>
                    <SelectItem value="CE">Carnet de Extranjería (CE)</SelectItem>
                    <SelectItem value="PASAPORTE">Pasaporte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edNroDoc" className="text-xs font-bold text-muted-foreground">
                  N° de Documento
                </Label>
                <Input
                  id="edNroDoc"
                  value={nroDoc}
                  onChange={(e) => setNroDoc(e.target.value)}
                  placeholder="Ej. 70123456"
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edTel" className="text-xs font-bold text-muted-foreground">
                  Celular / WhatsApp
                </Label>
                <Input
                  id="edTel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. 987654321"
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edEmail" className="text-xs font-bold text-muted-foreground">
                  Correo Electrónico
                </Label>
                <Input
                  id="edEmail"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="edNotas" className="text-xs font-bold text-muted-foreground">
                Notas y Preferencias del Cliente
              </Label>
              <textarea
                id="edNotas"
                rows={3}
                placeholder="Preferencias de lavado, indicaciones sobre entrega, etc..."
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                className="w-full bg-background border border-border hover:border-zinc-400 focus:border-secondary text-xs p-3 rounded-xl resize-none outline-hidden"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !nombre.trim()}
              className="rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold h-10 px-5 gap-2 cursor-pointer shadow-xs"
            >
              <Save className="size-4" />
              <span>{isSubmitting ? "Guardando..." : "Guardar Cambios"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
