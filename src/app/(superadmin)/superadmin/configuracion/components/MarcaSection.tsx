"use client";

import { Brush, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoUploader } from "@/components/shared/LogoUploader";

interface MarcaSectionProps {
  nombreApp: string;
  logoUrl: string;
  saving: boolean;
  onNombreAppChange: (nombre: string) => void;
  onLogoUrlChange: (url: string) => void;
  onSave: () => void;
}

export function MarcaSection({
  nombreApp,
  logoUrl,
  saving,
  onNombreAppChange,
  onLogoUrlChange,
  onSave,
}: MarcaSectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
          <Brush className="size-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-foreground">Personalización de Marca</h2>
          <p className="text-[10px] text-muted-foreground">Nombre de la aplicación y logo.</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="appName" className="text-xs font-semibold text-foreground">Nombre de la App</Label>
            <Input
              id="appName"
              value={nombreApp}
              onChange={(e) => onNombreAppChange(e.target.value)}
              className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logoUrl" className="text-xs font-semibold text-foreground">Logotipo de la Plataforma</Label>
            <LogoUploader
              value={logoUrl}
              onChange={onLogoUrlChange}
            />
          </div>
        </div>
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto"
        >
          <Save className="size-3.5" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </section>
  );
}
