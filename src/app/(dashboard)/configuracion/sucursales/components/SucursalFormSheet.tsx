"use client";

import { useState, useEffect } from "react";
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
import { createSucursalAction, updateSucursalAction } from "@/lib/actions/sucursales";
import { toast } from "sonner";
import { SucursalItem, SucursalFormData } from "./types";

interface SucursalFormSheetProps {
  isOpen: boolean;
  onClose: () => void;
  editingId: string | null;
  initialData: SucursalItem | null;
  onSuccess: (refreshedSucursales: SucursalItem[]) => void;
}

const emptyForm: SucursalFormData = {
  nombre: "",
  direccion: "",
  telefono: "",
  email: "",
  ruc: "",
};

export function SucursalFormSheet({
  isOpen,
  onClose,
  editingId,
  initialData,
  onSuccess,
}: SucursalFormSheetProps) {
  const [form, setForm] = useState<SucursalFormData>(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (editingId && initialData) {
        setForm({
          nombre: initialData.nombre,
          direccion: initialData.direccion || "",
          telefono: initialData.telefono || "",
          email: initialData.email || "",
          ruc: initialData.ruc || "",
        });
      } else {
        setForm(emptyForm);
      }
    }
  }, [isOpen, editingId, initialData]);

  const handleSave = async () => {
    if (!form.nombre.trim()) {
      toast.error("El nombre de la sucursal es obligatorio.");
      return;
    }

    setSaving(true);
    const res = editingId
      ? await updateSucursalAction(editingId, form)
      : await createSucursalAction(form);

    if (res.success) {
      toast.success(editingId ? "Sucursal actualizada con éxito" : "Sucursal creada con éxito");
      onClose();
      // Refrescar lista
      const refreshed = await import("@/lib/actions/sucursales").then((m) => m.getSucursalesList());
      if (refreshed.success) {
        onSuccess(refreshed.sucursales as SucursalItem[]);
      }
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
            <SheetTitle>{editingId ? "Editar Sucursal" : "Nueva Sucursal"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "Modifica los datos comerciales y de contacto de la sucursal."
                : "Agrega una nueva sucursal comercial a tu empresa."}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre de Sucursal *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Sucursal Lima - Miraflores"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ruc">RUC / Identificación Fiscal</Label>
            <Input
              id="ruc"
              value={form.ruc}
              onChange={(e) => setForm({ ...form, ruc: e.target.value })}
              placeholder="Ej. 20123456789"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección Física</Label>
            <Input
              id="direccion"
              value={form.direccion}
              onChange={(e) => setForm({ ...form, direccion: e.target.value })}
              placeholder="Ej. Av. Santa Cruz 830, Miraflores, Lima"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono de Contacto</Label>
              <Input
                id="telefono"
                value={form.telefono}
                onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                placeholder="Ej. 01-4456789"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email de Atención</Label>
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="Ej. miraflores@carwash.pe"
              />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-card mt-auto">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : editingId ? "Actualizar Sucursal" : "Crear Sucursal"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
