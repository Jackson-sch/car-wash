"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface CrearClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  onSave: (data: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
    tipoDoc: string;
    nroDoc: string;
    notas: string;
  }) => Promise<void>;
}

export function CrearClienteModal({
  isOpen,
  onClose,
  isPending,
  onSave,
}: CrearClienteModalProps) {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [tipoDoc, setTipoDoc] = useState<string>("");
  const [nroDoc, setNroDoc] = useState("");
  const [notas, setNotas] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    await onSave({
      nombre,
      apellido,
      telefono,
      email,
      tipoDoc,
      nroDoc,
      notas,
    });

    // Reset fields on success (caller handles closing)
    setNombre("");
    setApellido("");
    setTelefono("");
    setEmail("");
    setTipoDoc("");
    setNroDoc("");
    setNotas("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 text-foreground">
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Registrar Cliente Nuevo</h3>
            <p className="text-xs text-zinc-500 mt-1">
              Ingresa los datos para registrar un nuevo cliente en la sucursal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regNombre" className="text-xs font-bold text-zinc-650">
                Nombres *
              </Label>
              <Input
                id="regNombre"
                placeholder="Ej. Darwin"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regApellido" className="text-xs font-bold text-zinc-650">
                Apellidos
              </Label>
              <Input
                id="regApellido"
                placeholder="Jackson"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="regTel" className="text-xs font-bold text-zinc-650">
                Número Celular
              </Label>
              <Input
                id="regTel"
                type="tel"
                placeholder="999888777"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="regEmail" className="text-xs font-bold text-zinc-650">
                Correo Electrónico
              </Label>
              <Input
                id="regEmail"
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="regDocType" className="text-xs font-bold text-zinc-650">
                Tipo Doc
              </Label>
              <Select
                value={tipoDoc || "none"}
                onValueChange={(val: string | null) => setTipoDoc(!val || val === "none" ? "" : val)}
              >
                <SelectTrigger id="regDocType" className="w-full bg-card border-border text-foreground rounded-lg text-xs h-9 px-3">
                  <SelectValue placeholder="Ninguno">
                    {(val) => (val === "none" ? "Ninguno" : val)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full bg-card text-card-foreground border border-border">
                  <SelectItem value="none">Ninguno</SelectItem>
                  <SelectItem value="DNI">DNI</SelectItem>
                  <SelectItem value="RUC">RUC</SelectItem>
                  <SelectItem value="CE">CE</SelectItem>
                  <SelectItem value="PASAPORTE">PASAPORTE</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="regDocNo" className="text-xs font-bold text-zinc-650">
                Número de Documento
              </Label>
              <Input
                id="regDocNo"
                placeholder="Ej. 76543210"
                value={nroDoc}
                onChange={(e) => setNroDoc(e.target.value)}
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="regNotes" className="text-xs font-bold text-zinc-650">
              Notas sobre el Cliente
            </Label>
            <textarea
              id="regNotes"
              placeholder="Ej. Cliente VIP preferente, desea boleta..."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={2}
              className="w-full bg-card border border-zinc-300 focus:border-secondary rounded-lg text-xs p-3 text-zinc-800 outline-none resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-4 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="font-bold text-xs h-9 rounded-lg px-5 shadow-sm cursor-pointer"
            >
              {isPending ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
