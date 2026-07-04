"use client";

import { useState } from "react";
import { Save, Building, MapPin, Phone, Mail, Hash, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUploader } from "@/components/shared/LogoUploader";

interface Sucursal {
  id: string;
  nombre: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  logoUrl: string | null;
  config: unknown;
}

interface GeneralPanelProps {
  sucursal: Sucursal;
  isPending: boolean;
  onSave: (data: {
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    ruc: string;
    logoUrl: string;
  }) => Promise<void>;
}

export function GeneralPanel({ sucursal, isPending, onSave }: GeneralPanelProps) {
  const [nombre, setNombre] = useState(sucursal.nombre);
  const [direccion, setDireccion] = useState(sucursal.direccion || "");
  const [telefono, setTelefono] = useState(sucursal.telefono || "");
  const [email, setEmail] = useState(sucursal.email || "");
  const [ruc, setRuc] = useState(sucursal.ruc || "");
  const [logoUrl, setLogoUrl] = useState(sucursal.logoUrl || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    await onSave({ nombre, direccion, telefono, email, ruc, logoUrl });
  };

  return (
    <Card className="border-border bg-card shadow-sm max-w-2xl">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-secondary/10 text-secondary flex items-center justify-center">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground">Información de Sucursal</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Datos comerciales y de contacto de tu sucursal.</p>
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Building className="h-3.5 w-3.5" />
              Nombre Comercial *
            </Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="bg-card border-border focus:border-secondary text-sm h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ruc" className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Hash className="h-3.5 w-3.5" />
              RUC / Identificación Fiscal
            </Label>
            <Input
              id="ruc"
              placeholder="Ej. 20123456789"
              value={ruc}
              onChange={(e) => setRuc(e.target.value)}
              className="bg-card border-border focus:border-secondary text-sm h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="direccion" className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            Dirección Física
          </Label>
          <Input
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="bg-card border-border focus:border-secondary text-sm h-10 rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label htmlFor="telefono" className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5" />
              Teléfono de Contacto
            </Label>
            <Input
              id="telefono"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              className="bg-card border-border focus:border-secondary text-sm h-10 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5" />
              Email de Atención
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-card border-border focus:border-secondary text-sm h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo" className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Image className="h-3.5 w-3.5" />
            Logotipo de la Sucursal
          </Label>
          <LogoUploader
            value={logoUrl}
            onChange={setLogoUrl}
          />
        </div>

        <div className="pt-4 flex justify-end border-t border-border">
          <Button
            type="submit"
            disabled={isPending}
            className="bg-secondary hover:bg-secondary/90 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-6"
          >
            <Save className="h-4 w-4" />
            {isPending ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
