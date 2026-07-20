"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createPaquete, updatePaquete } from "@/lib/actions/paquetes";
import { toast } from "sonner";
import type { PaqueteItem, ServicioOption, PaqueteFormData } from "./types";
import { ServicioSelector } from "./ServicioSelector";

interface PaqueteFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
  initialData: PaqueteItem | null;
  servicios: ServicioOption[];
  onSuccess: (refreshedPaquetes: PaqueteItem[]) => void;
}

const emptyForm: PaqueteFormData = {
  nombre: "",
  descripcion: "",
  precio: "",
  servicioIds: [],
};

export function PaqueteFormSheet({
  isOpen,
  onClose,
  editingId,
  initialData,
  servicios,
  onSuccess,
}: PaqueteFormSheetProps) {
  // La inicialización se maneja con key en el padre, forzando remount
  const [form, setForm] = useState<PaqueteFormData>(() => {
    if (editingId && initialData) {
      return {
        nombre: initialData.nombre,
        descripcion: initialData.descripcion || "",
        precio: initialData.precio,
        servicioIds: initialData.servicios.map((s) => s.id),
      };
    }
    return emptyForm;
  });
  const [saving, setSaving] = useState(false);

  const toggleServicio = (id: string) => {
    setForm((prev) => ({
      ...prev,
      servicioIds: prev.servicioIds.includes(id)
        ? prev.servicioIds.filter((sId) => sId !== id)
        : [...prev.servicioIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.precio.trim()) {
      toast.error("Completa los campos requeridos");
      return;
    }
    setSaving(true);
    const res = editingId
      ? await updatePaquete(editingId, form)
      : await createPaquete(form);

    if (res.success) {
      toast.success(editingId ? "Paquete actualizado" : "Paquete creado");
      onClose();
      const refreshed = await import("@/lib/actions/paquetes").then((m) => m.getPaquetes());
      onSuccess(refreshed);
    } else {
      toast.error(res.error || "Error al guardar");
    }
    setSaving(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col h-full p-0">
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar Paquete" : "Nuevo Paquete"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "Modifica los datos del paquete y sus servicios."
                : "Crea un nuevo paquete combinando servicios."}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del Paquete *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Lavado Completo + Cera"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={3}
              className="w-full bg-card border border-border rounded-lg text-sm p-3 outline-none focus:border-primary resize-none"
              placeholder="Describe brevemente lo que incluye este paquete..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="precio">Precio Total (S/) *</Label>
            <Input
              id="precio"
              type="number"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              placeholder="99.90"
            />
          </div>

          <div className="space-y-2">
            <Label>Servicios Incluidos</Label>
            <ServicioSelector
              servicios={servicios}
              selectedIds={form.servicioIds}
              onToggle={toggleServicio}
            />
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-card mt-auto">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : editingId ? "Actualizar Paquete" : "Crear Paquete"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
