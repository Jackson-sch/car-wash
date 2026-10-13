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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 p-3 sm:p-4 md:p-6">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div>
            <h3 className="text-base font-bold text-foreground">Registrar Cliente Nuevo</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Ingresa los datos para registrar un nuevo cliente en la sucursal.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Columna 1: Identificación y Nombres */}
              <div className="space-y-4">
                <div className="border-b border-border/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Datos del Cliente
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regNombre" className="text-xs font-bold text-muted-foreground">
                    Nombres *
                  </Label>
                  <Input
                    id="regNombre"
                    placeholder="Ej. Darwin"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regApellido" className="text-xs font-bold text-muted-foreground">
                    Apellidos
                  </Label>
                  <Input
                    id="regApellido"
                    placeholder="Ej. Jackson"
                    value={apellido}
                    onChange={(e) => setApellido(e.target.value)}
                    className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5 col-span-1">
                    <Label htmlFor="regDocType" className="text-xs font-bold text-muted-foreground">
                      Tipo Doc
                    </Label>
                    <Select
                      value={tipoDoc || "none"}
                      onValueChange={(val: string | null) => setTipoDoc(!val || val === "none" ? "" : val)}
                    >
                      <SelectTrigger id="regDocType" className="w-full bg-background border-border text-foreground rounded-lg text-xs h-9.5 px-3">
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
                  <div className="space-y-1.5 col-span-2">
                    <Label htmlFor="regDocNo" className="text-xs font-bold text-muted-foreground">
                      N° Documento
                    </Label>
                    <Input
                      id="regDocNo"
                      placeholder="Ej. 76543210"
                      value={nroDoc}
                      onChange={(e) => setNroDoc(e.target.value)}
                      className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Columna 2: Contacto y Observaciones */}
              <div className="space-y-4">
                <div className="border-b border-border/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Contacto y Notas
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regTel" className="text-xs font-bold text-muted-foreground">
                    Número Celular
                  </Label>
                  <Input
                    id="regTel"
                    type="tel"
                    placeholder="999888777"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regEmail" className="text-xs font-bold text-muted-foreground">
                    Correo Electrónico
                  </Label>
                  <Input
                    id="regEmail"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="regNotes" className="text-xs font-bold text-muted-foreground">
                    Notas sobre el Cliente
                  </Label>
                  <textarea
                    id="regNotes"
                    placeholder="Ej. Cliente preferente, solicitar boleta..."
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    rows={2.5}
                    className="w-full bg-background border border-border focus:border-secondary rounded-lg text-xs p-3 text-foreground outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-4 sm:px-6 border-t border-border bg-muted/30 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="font-bold text-xs h-9 rounded-lg px-6 shadow-sm cursor-pointer"
            >
              {isPending ? "Registrando..." : "Registrar Cliente"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
