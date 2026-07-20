"use client";

import { useState } from "react";
import { ShieldCheck, Info, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";

interface CreateFormState {
  nombreEmpresa: string;
  plan: "free" | "pro" | "enterprise";
  adminNombre: string;
  adminApellido: string;
  adminEmail: string;
  adminTelefono: string;
}

interface CreatedCredentials {
  empresaNombre: string;
  email: string;
  pass: string;
}

interface CreateEmpresaSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isSubmitting: boolean;
  createForm: CreateFormState;
  createdCredentials: CreatedCredentials | null;
  onFormChange: (field: string, value: unknown) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function CreateEmpresaSheet({
  isOpen,
  onOpenChange,
  isSubmitting,
  createForm,
  createdCredentials,
  onFormChange,
  onSubmit,
  onClose,
}: CreateEmpresaSheetProps) {
  const { nombreEmpresa, plan, adminNombre, adminApellido, adminEmail, adminTelefono } = createForm;
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    if (!createdCredentials) return;
    const text = `Credenciales de Acceso - ${createdCredentials.empresaNombre}\n` +
      `Enlace: ${window.location.origin}/login\n` +
      `Usuario/Email: ${createdCredentials.email}\n` +
      `Contraseña Temporal: ${createdCredentials.pass}\n\n` +
      `* Nota: Por seguridad, se recomienda cambiar la contraseña en el primer inicio de sesión.`;
    
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credenciales copiadas al portapapeles");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(val) => {
      onOpenChange(val);
      if (!val) onClose();
    }}>
      <SheetContent side="right" className="bg-card text-foreground border-l border-border p-6 w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-foreground">Nueva Empresa Inquilina</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Crea una nueva organización aislada, asigna un plan y configura su administrador principal.
          </SheetDescription>
        </SheetHeader>

        {createdCredentials ? (
          <div className="space-y-6 animate-in fade-in-50 zoom-in-95 duration-200">
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/25 rounded-2xl flex flex-col items-center text-center gap-3">
              <div className="p-2.5 bg-emerald-500/20 text-emerald-500 rounded-full">
                <ShieldCheck className="size-7" />
              </div>
              <div>
                <h3 className="font-bold text-emerald-500">¡Empresa Registrada!</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  La empresa y el usuario administrador han sido creados correctamente.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 border border-border rounded-2xl p-5 space-y-4 relative">
              <h4 className="text-xs font-bold uppercase tracking-wider text-secondary">Credenciales de Acceso</h4>
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-muted-foreground block">Empresa</span>
                  <span className="font-semibold text-foreground">{createdCredentials.empresaNombre}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Usuario / Email</span>
                  <span className="font-mono text-foreground select-all">{createdCredentials.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block">Contraseña Temporal</span>
                  <span className="font-mono text-foreground select-all font-bold tracking-wider">{createdCredentials.pass}</span>
                </div>
              </div>
              <div className="flex gap-2 p-3 bg-secondary/5 border border-secondary/10 rounded-xl">
                <Info className="size-4.5 text-secondary shrink-0 mt-0.5" />
                <p className="text-[10px] text-secondary/80 leading-normal">
                  Copia estas credenciales y proporciónalas al administrador. Se le sugerirá cambiar la contraseña en su primer acceso.
                </p>
              </div>
              <Button 
                onClick={copyToClipboard}
                className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 cursor-pointer py-5.5 mt-2 rounded-xl"
              >
                {copied ? <Check className="size-4.5" /> : <Copy className="size-4.5" />}
                {copied ? "¡Copiado!" : "Copiar Credenciales"}
              </Button>
            </div>

            <Button 
              variant="ghost" 
              onClick={() => { onOpenChange(false); onClose(); }}
              className="w-full text-muted-foreground hover:text-foreground font-semibold py-5.5 rounded-xl border border-border hover:bg-muted/50"
            >
              Cerrar Panel
            </Button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Datos de la Empresa</h3>
              <div className="space-y-1.5">
                <Label htmlFor="nombreEmpresa" className="text-xs font-semibold text-foreground">Nombre del Car Wash</Label>
                <Input id="nombreEmpresa" required value={nombreEmpresa}
                  onChange={(e) => onFormChange("nombreEmpresa", e.target.value)}
                  placeholder="Ej. Car Wash Los Amigos S.A."
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="plan" className="text-xs font-semibold text-foreground">Plan de Suscripción</Label>
                <select id="plan" value={plan}
                  onChange={(e) => onFormChange("plan", e.target.value)}
                  className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring">
                  <option value="free">Plan Free (1 Sucursal - Prueba)</option>
                  <option value="pro">Plan Pro (Multi-Sucursal)</option>
                  <option value="enterprise">Plan Enterprise (Ilimitado)</option>
                </select>
              </div>
            </div>

            <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-1">Administrador Principal</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="adminNombre" className="text-xs font-semibold text-foreground">Nombre</Label>
                  <Input id="adminNombre" required value={adminNombre}
                    onChange={(e) => onFormChange("adminNombre", e.target.value)}
                    placeholder="Ej. Juan"
                    className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="adminApellido" className="text-xs font-semibold text-foreground">Apellido</Label>
                  <Input id="adminApellido" required value={adminApellido}
                    onChange={(e) => onFormChange("adminApellido", e.target.value)}
                    placeholder="Ej. Pérez"
                    className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adminEmail" className="text-xs font-semibold text-foreground">Correo Electrónico (Login)</Label>
                <Input id="adminEmail" type="email" required value={adminEmail}
                  onChange={(e) => onFormChange("adminEmail", e.target.value)}
                  placeholder="ejemplo@correo.com"
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adminTelefono" className="text-xs font-semibold text-foreground">Teléfono (Opcional)</Label>
                <Input id="adminTelefono" value={adminTelefono}
                  onChange={(e) => onFormChange("adminTelefono", e.target.value)}
                  placeholder="Ej. 987654321"
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
              </div>
            </div>

            <div className="pt-2 flex gap-3">
              <SheetClose render={
                <Button type="button" variant="ghost" className="flex-1 text-muted-foreground hover:text-foreground border border-border py-5.5 rounded-xl cursor-pointer">
                  Cancelar
                </Button>
              } />
              <Button type="submit" disabled={isSubmitting}
                className="flex-1 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold py-5.5 rounded-xl cursor-pointer">
                {isSubmitting ? "Registrando..." : "Crear Empresa"}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
