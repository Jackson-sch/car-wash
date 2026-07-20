"use client";

import { Mail, Save, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SmtpSectionProps {
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPass: string;
  smtpFromEmail: string;
  smtpFromName: string;
  showPass: boolean;
  saving: boolean;
  onHostChange: (v: string) => void;
  onPortChange: (v: string) => void;
  onUserChange: (v: string) => void;
  onPassChange: (v: string) => void;
  onFromEmailChange: (v: string) => void;
  onFromNameChange: (v: string) => void;
  onToggleShowPass: () => void;
  onSave: () => void;
}

export function SmtpSection({
  smtpHost, smtpPort, smtpUser, smtpPass, smtpFromEmail, smtpFromName,
  showPass, saving,
  onHostChange, onPortChange, onUserChange, onPassChange, onFromEmailChange, onFromNameChange,
  onToggleShowPass, onSave,
}: SmtpSectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
          <Mail className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Configuración SMTP</h2>
          <p className="text-[10px] text-muted-foreground">Servidor de correo para notificaciones y recuperación de contraseñas.</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="smtpHost" className="text-xs font-semibold text-foreground">Host</Label>
            <Input
              id="smtpHost"
              value={smtpHost}
              onChange={(e) => onHostChange(e.target.value)}
              placeholder="smtp.gmail.com"
              className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtpPort" className="text-xs font-semibold text-foreground">Puerto</Label>
            <Input
              id="smtpPort"
              type="number"
              value={smtpPort}
              onChange={(e) => onPortChange(e.target.value)}
              placeholder="587"
              className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtpUser" className="text-xs font-semibold text-foreground">Usuario</Label>
            <Input
              id="smtpUser"
              value={smtpUser}
              onChange={(e) => onUserChange(e.target.value)}
              placeholder="tu@correo.com"
              className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtpPass" className="text-xs font-semibold text-foreground">Contraseña</Label>
            <div className="relative">
              <Input
                id="smtpPass"
                type={showPass ? "text" : "password"}
                value={smtpPass}
                onChange={(e) => onPassChange(e.target.value)}
                placeholder="••••••••"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl pr-9"
              />
              <button
                type="button"
                onClick={onToggleShowPass}
                aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                {showPass ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtpFromEmail" className="text-xs font-semibold text-foreground">Correo Remitente</Label>
            <Input
              id="smtpFromEmail"
              value={smtpFromEmail}
              onChange={(e) => onFromEmailChange(e.target.value)}
              placeholder="noreply@washmaster.pe"
              className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="smtpFromName" className="text-xs font-semibold text-foreground">Nombre Remitente</Label>
            <Input
              id="smtpFromName"
              value={smtpFromName}
              onChange={(e) => onFromNameChange(e.target.value)}
              placeholder="WashMaster Pro"
              className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
            />
          </div>
        </div>
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto mt-4"
        >
          <Save className="size-3.5" />
          {saving ? "Guardando..." : "Guardar Configuración SMTP"}
        </Button>
      </div>
    </section>
  );
}
