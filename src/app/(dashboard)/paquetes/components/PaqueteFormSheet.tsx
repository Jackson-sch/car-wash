"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";
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
import { formatCurrency } from "@/lib/formats";
import { PaqueteItem, ServicioOption, PaqueteFormData } from "./types";

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
  const [form, setForm] = useState<PaqueteFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingId && initialData) {
        setForm({
          nombre: initialData.nombre,
          descripcion: initialData.descripcion || "",
          precio: initialData.precio,
          servicioIds: initialData.servicios.map((s) => s.id),
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, editingId, initialData]);

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

          <div className="space-y-3">
            <Label>Servicios Incluidos</Label>
            <p className="text-xs text-muted-foreground">
              Selecciona los servicios que forman parte de este paquete.
            </p>
            <div className="space-y-2 max-h-80 overflow-y-auto border border-border rounded-lg p-3">
              {servicios
                .filter((s) => s.nombre)
                .map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <div
                      className={`h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                        form.servicioIds.includes(s.id)
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-muted-foreground/30"
                      }`}
                      onClick={(e) => {
                        e.preventDefault();
                        toggleServicio(s.id);
                      }}
                    >
                      {form.servicioIds.includes(s.id) && <Check className="h-3 w-3" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{s.nombre}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatCurrency(parseFloat(s.precio))}
                      </div>
                    </div>
                  </label>
                ))}
              {servicios.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay servicios disponibles
                </p>
              )}
            </div>
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
