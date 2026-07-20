"use client";

import { Switch } from "@/components/ui/switch";
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

const FEATURE_LABELS: Record<string, string> = {
  ordenes: "Órdenes de Servicio",
  clientes: "Clientes",
  vehiculos: "Vehículos",
  reportes: "Reportes",
  inventario: "Inventario",
  cupones: "Cupones",
  empleados: "Empleados",
  soporte_prioritario: "Soporte Prioritario",
};

export interface PlanFormData {
  codigo: string;
  nombre: string;
  descripcion: string;
  precio: string;
  limiteSucursales: string;
  limiteUsuarios: string;
  features: Record<string, boolean>;
}

interface PlanFormSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingId: string | null;
  form: PlanFormData;
  isSubmitting: boolean;
  onFormChange: (form: PlanFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function PlanFormSheet({
  isOpen,
  onOpenChange,
  editingId,
  form,
  isSubmitting,
  onFormChange,
  onSubmit,
}: PlanFormSheetProps) {
  const update = (field: keyof PlanFormData, value: unknown) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="bg-card text-foreground border-l border-border p-6 w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-foreground">
            {editingId ? "Editar Plan" : "Nuevo Plan"}
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            {editingId
              ? "Modifica las propiedades del plan de suscripción."
              : "Define un nuevo plan de suscripción con sus límites y características."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Información General</h3>
            {!editingId && (
              <div className="space-y-1.5">
                <Label htmlFor="codigo" className="text-xs font-semibold text-foreground">
                  Código <span className="text-destructive">*</span>
                </Label>
                <Input id="codigo" required value={form.codigo}
                  onChange={(e) => update("codigo", e.target.value)}
                  placeholder="Ej. premium"
                  className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
                <p className="text-[10px] text-muted-foreground">Identificador único en la base de datos.</p>
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="nombre" className="text-xs font-semibold text-foreground">Nombre <span className="text-destructive">*</span></Label>
              <Input id="nombre" required value={form.nombre}
                onChange={(e) => update("nombre", e.target.value)}
                placeholder="Ej. Plan Premium"
                className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="descripcion" className="text-xs font-semibold text-foreground">Descripción</Label>
              <textarea id="descripcion" value={form.descripcion}
                onChange={(e) => update("descripcion", e.target.value)}
                placeholder="Describe brevemente este plan..." rows={2}
                className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring resize-none placeholder-muted-foreground" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="precio" className="text-xs font-semibold text-foreground">Precio Mensual (S/)</Label>
              <Input id="precio" type="number" step="0.01" min="0" value={form.precio}
                onChange={(e) => update("precio", e.target.value)}
                className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
            </div>
          </div>

          <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Límites</h3>
            <p className="text-[10px] text-muted-foreground -mt-2">Dejar vacío = Ilimitado</p>
            <div className="space-y-1.5">
              <Label htmlFor="limiteSucursales" className="text-xs font-semibold text-foreground">Máximo de Sucursales</Label>
              <Input id="limiteSucursales" type="number" min="0" value={form.limiteSucursales}
                onChange={(e) => update("limiteSucursales", e.target.value)} placeholder="Ilimitado"
                className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="limiteUsuarios" className="text-xs font-semibold text-foreground">Máximo de Usuarios</Label>
              <Input id="limiteUsuarios" type="number" min="0" value={form.limiteUsuarios}
                onChange={(e) => update("limiteUsuarios", e.target.value)} placeholder="Ilimitado"
                className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
            </div>
          </div>

          <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Características</h3>
            <div className="space-y-3">
              {Object.entries(FEATURE_LABELS).map(([key, label]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label htmlFor={`feature-${key}`} className="text-xs font-medium text-foreground cursor-pointer">{label}</Label>
                  <Switch id={`feature-${key}`}
                    checked={form.features[key] || false}
                    onCheckedChange={(checked) =>
                      update("features", { ...form.features, [key]: checked })
                    }
                    className="data-[state=checked]:bg-secondary focus-visible:ring-ring/40" />
                </div>
              ))}
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
              {isSubmitting ? "Guardando..." : editingId ? "Actualizar Plan" : "Crear Plan"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
