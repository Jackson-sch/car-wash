"use client";

import { Wrench, ShieldAlert, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface MantenimientoSectionProps {
  mantenimientoActivo: boolean;
  mantenimientoMensaje: string;
  saving: boolean;
  onMantenimientoChange: (activo: boolean) => void;
  onMensajeChange: (mensaje: string) => void;
  onSave: () => void;
}

export function MantenimientoSection({
  mantenimientoActivo,
  mantenimientoMensaje,
  saving,
  onMantenimientoChange,
  onMensajeChange,
  onSave,
}: MantenimientoSectionProps) {
  return (
    <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <Wrench className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Modo Mantenimiento</h2>
            <p className="text-[10px] text-muted-foreground">Deshabilita el acceso a todos los usuarios no administradores.</p>
          </div>
        </div>
        <Switch
          checked={mantenimientoActivo}
          onCheckedChange={onMantenimientoChange}
          className="data-[state=checked]:bg-amber-500 focus-visible:ring-ring/40"
        />
      </div>
      <div className="p-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="mantMsg" className="text-xs font-semibold text-foreground">Mensaje para los usuarios</Label>
          <textarea
            id="mantMsg"
            value={mantenimientoMensaje}
            onChange={(e) => onMensajeChange(e.target.value)}
            rows={2}
            className="w-full bg-muted/30 border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring resize-none placeholder-muted-foreground"
          />
        </div>
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
          <ShieldAlert className="size-4 text-amber-500 shrink-0" />
          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
            {mantenimientoActivo
              ? "El modo mantenimiento está activo. Los usuarios no administradores verán la página de mantenimiento al intentar acceder."
              : "Al activarlo, todos los usuarios (excepto superadmins) serán redirigidos a una página de mantenimiento."}
          </p>
        </div>
        <Button
          onClick={onSave}
          disabled={saving}
          className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto"
        >
          <Save className="size-3.5" />
          {saving ? "Guardando..." : "Guardar Cambios"}
        </Button>
      </div>
    </section>
  );
}
