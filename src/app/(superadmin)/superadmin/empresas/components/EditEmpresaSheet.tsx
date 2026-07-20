"use client";

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

interface EditEmpresaSheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  empresaNombre: string | null;
  editNombre: string;
  editPlan: string;
  isSubmitting: boolean;
  onNombreChange: (v: string) => void;
  onPlanChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

export function EditEmpresaSheet({
  isOpen,
  onOpenChange,
  empresaNombre,
  editNombre,
  editPlan,
  isSubmitting,
  onNombreChange,
  onPlanChange,
  onSubmit,
  onClose,
}: EditEmpresaSheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={(val) => { onOpenChange(val); if (!val) onClose(); }}>
      <SheetContent side="right" className="bg-card text-foreground border-l border-border p-6 w-full max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-xl font-bold text-foreground">Editar Empresa</SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Modifica los datos de {empresaNombre}.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          <div className="space-y-4.5 bg-muted/30 border border-border p-4.5 rounded-2xl">
            <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-1">Datos de la Empresa</h3>
            <div className="space-y-1.5">
              <Label htmlFor="editNombre" className="text-xs font-semibold text-foreground">Nombre del Car Wash</Label>
              <Input id="editNombre" required value={editNombre}
                onChange={(e) => onNombreChange(e.target.value)}
                className="bg-card border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="editPlan" className="text-xs font-semibold text-foreground">Plan de Suscripción</Label>
              <select id="editPlan" value={editPlan}
                onChange={(e) => onPlanChange(e.target.value)}
                className="w-full bg-card border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring">
                <option value="free">Plan Free (1 Sucursal - Prueba)</option>
                <option value="pro">Plan Pro (Multi-Sucursal)</option>
                <option value="enterprise">Plan Enterprise (Ilimitado)</option>
              </select>
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
              {isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
