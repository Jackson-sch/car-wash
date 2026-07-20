"use client";

import { useReducer, useRef, useEffect } from "react";
import { Save, Building, MapPin, Phone, Mail, Hash, Image as ImageIcon } from "lucide-react";
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

type FormState = {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  ruc: string;
  logoUrl: string;
};

type FormAction =
  | { type: "SET_FIELD"; field: keyof FormState; value: string }
  | { type: "RESET"; payload: FormState };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "RESET":
      return action.payload;
    default:
      return state;
  }
}

export function GeneralPanel({ sucursal, isPending, onSave }: GeneralPanelProps) {
  const [state, dispatch] = useReducer(
    formReducer,
    sucursal,
    (s): FormState => ({
      nombre: s.nombre,
      direccion: s.direccion || "",
      telefono: s.telefono || "",
      email: s.email || "",
      ruc: s.ruc || "",
      logoUrl: s.logoUrl || "",
    })
  );
  const prevSucursalRef = useRef(sucursal.id);

  // Sincronizar cuando cambia la sucursal (ej: navegar a otra sucursal)
  useEffect(() => {
    if (prevSucursalRef.current !== sucursal.id) {
      dispatch({
        type: "RESET",
        payload: {
          nombre: sucursal.nombre,
          direccion: sucursal.direccion || "",
          telefono: sucursal.telefono || "",
          email: sucursal.email || "",
          ruc: sucursal.ruc || "",
          logoUrl: sucursal.logoUrl || "",
        },
      });
      prevSucursalRef.current = sucursal.id;
    }
  }, [sucursal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.nombre.trim()) return;
    await onSave(state);
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
              value={state.nombre}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "nombre", value: e.target.value })}
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
              value={state.ruc}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "ruc", value: e.target.value })}
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
            value={state.direccion}
            onChange={(e) => dispatch({ type: "SET_FIELD", field: "direccion", value: e.target.value })}
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
              value={state.telefono}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "telefono", value: e.target.value })}
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
              value={state.email}
              onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
              className="bg-card border-border focus:border-secondary text-sm h-10 rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="logo" className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <ImageIcon className="h-3.5 w-3.5" />
            Logotipo de la Sucursal
          </Label>
          <LogoUploader
            value={state.logoUrl}
            onChange={(url) => dispatch({ type: "SET_FIELD", field: "logoUrl", value: url })}
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
