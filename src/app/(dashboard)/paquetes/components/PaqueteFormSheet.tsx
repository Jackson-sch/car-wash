"use client";

import { useState, useMemo } from "react";
import { Sparkles, Clock, FlaskConical, AlertTriangle } from "lucide-react";
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
import { formatCurrency } from "@/lib/formats";
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
  const [form, setForm] = useState<PaqueteFormData>(() => {
    if (editingId && initialData) {
      return {
        nombre: initialData.nombre,
        descripcion: initialData.descripcion || "",
        precio: initialData.precio,
        servicioIds: initialData.servicios.map((s) => s.id),
      };
    }
    if (!editingId && initialData) {
      // Caso duplicar
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

  // Cálculos en vivo de los servicios seleccionados
  const comboMetrics = useMemo(() => {
    const selectedSet = new Set(form.servicioIds);
    const selectedServices = servicios.filter((s) => selectedSet.has(s.id));

    const regularPrice = selectedServices.reduce(
      (acc, s) => acc + (parseFloat(s.precio) || 0),
      0
    );
    const totalDuration = selectedServices.reduce(
      (acc, s) => acc + (s.duracionMin ?? 30),
      0
    );
    const totalRecipeCost = selectedServices.reduce(
      (acc, s) => acc + (s.costoReceta || 0),
      0
    );

    const comboPrice = parseFloat(form.precio) || 0;
    const savings = comboPrice > 0 && regularPrice > comboPrice ? regularPrice - comboPrice : 0;
    const savingsPct =
      regularPrice > 0 && savings > 0
        ? Math.round((savings / regularPrice) * 100)
        : 0;

    const grossMargin = comboPrice - totalRecipeCost;
    const grossMarginPct =
      comboPrice > 0 ? Math.round((grossMargin / comboPrice) * 100) : 0;

    return {
      regularPrice,
      totalDuration,
      totalRecipeCost,
      comboPrice,
      savings,
      savingsPct,
      grossMargin,
      grossMarginPct,
    };
  }, [form.servicioIds, form.precio, servicios]);

  const toggleServicio = (id: string) => {
    setForm((prev) => ({
      ...prev,
      servicioIds: prev.servicioIds.includes(id)
        ? prev.servicioIds.filter((sId) => sId !== id)
        : [...prev.servicioIds, id],
    }));
  };

  const applySuggestedDiscount = (discountPct: number) => {
    if (comboMetrics.regularPrice <= 0) return;
    const suggested = Math.round(comboMetrics.regularPrice * (1 - discountPct / 100));
    setForm((prev) => ({ ...prev, precio: suggested.toFixed(2) }));
  };

  const handleSave = async () => {
    if (!form.nombre.trim() || !form.precio.trim()) {
      toast.error("Completa el nombre y el precio del paquete");
      return;
    }
    if (form.servicioIds.length === 0) {
      toast.error("Selecciona al menos un servicio para el paquete");
      return;
    }
    setSaving(true);
    try {
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
    } catch {
      toast.error("Ocurrió un error inesperado al guardar el paquete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto flex flex-col h-full p-0">
        <div className="px-6 pt-6 pb-4 border-b border-border">
          <SheetHeader>
            <SheetTitle>{editingId ? "Editar Paquete" : "Nuevo Paquete"}</SheetTitle>
            <SheetDescription>
              {editingId
                ? "Modifica los servicios incluidos y el precio preferencial del combo."
                : "Selecciona servicios para armar un combo y define su tarifa promocional."}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="nombre">Nombre del Paquete *</Label>
            <Input
              id="nombre"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              placeholder="Ej. Combo Full Detailing + Encerado"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="descripcion">Descripción Comercial</Label>
            <textarea
              id="descripcion"
              value={form.descripcion}
              onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              rows={2}
              className="w-full bg-card border border-border rounded-lg text-sm p-3 outline-none focus:border-secondary resize-none"
              placeholder="Describe brevemente el beneficio del combo para el cliente..."
            />
          </div>

          <div className="space-y-2">
            <Label>1. Servicios Incluidos *</Label>
            <ServicioSelector
              servicios={servicios}
              selectedIds={form.servicioIds}
              onToggle={toggleServicio}
            />
          </div>

          {/* Calculadora / Sugeridor de Precio */}
          <div className="space-y-2.5 pt-1">
            <div className="flex items-center justify-between gap-2">
              <Label htmlFor="precio">2. Precio Promocional del Combo (S/) *</Label>
              {comboMetrics.regularPrice > 0 && (
                <span className="text-[11px] font-medium text-muted-foreground">
                  Suma individual:{" "}
                  <strong className="font-mono text-foreground">
                    {formatCurrency(comboMetrics.regularPrice)}
                  </strong>
                </span>
              )}
            </div>

            {comboMetrics.regularPrice > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
                  Sugerir dcto:
                </span>
                {[10, 15, 20, 25].map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => applySuggestedDiscount(pct)}
                    className="text-[11px] font-bold px-2.5 py-1 rounded-md border border-secondary/30 bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    -{pct}% ({formatCurrency(Math.round(comboMetrics.regularPrice * (1 - pct / 100)))})
                  </button>
                ))}
              </div>
            )}

            <Input
              id="precio"
              type="number"
              step="0.01"
              value={form.precio}
              onChange={(e) => setForm({ ...form, precio: e.target.value })}
              placeholder="99.90"
              className="font-mono font-bold text-base"
            />
          </div>

          {/* Resumen Financiero del Combo */}
          {form.servicioIds.length > 0 && (
            <div className="rounded-xl border border-border/80 bg-muted/20 p-3.5 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-muted-foreground uppercase tracking-wider text-[10px]">
                  Resumen Operativo y Financiero
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Clock className="size-3.5 text-secondary" />
                  ~{comboMetrics.totalDuration} min total
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-border/50 text-center">
                <div className="p-2 rounded-lg bg-card/70 border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">Valor Regular</span>
                  <span className="text-xs font-bold font-mono text-foreground">
                    {formatCurrency(comboMetrics.regularPrice)}
                  </span>
                </div>

                <div className="p-2 rounded-lg bg-card/70 border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">Ahorro Cliente</span>
                  {comboMetrics.savings > 0 ? (
                    <span className="text-xs font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(comboMetrics.savings)} ({comboMetrics.savingsPct}%)
                    </span>
                  ) : (
                    <span className="text-xs font-bold font-mono text-muted-foreground">
                      S/ 0.00
                    </span>
                  )}
                </div>

                <div className="p-2 rounded-lg bg-card/70 border border-border/40">
                  <span className="text-[10px] text-muted-foreground block">Costo Insumos</span>
                  <span className="text-xs font-bold font-mono text-foreground inline-flex items-center gap-1 justify-center">
                    <FlaskConical className="size-3 text-violet-500" />
                    {formatCurrency(comboMetrics.totalRecipeCost)}
                  </span>
                </div>
              </div>

              {comboMetrics.comboPrice > 0 && comboMetrics.comboPrice >= comboMetrics.regularPrice && (
                <div className="flex items-center gap-2 text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-lg px-2.5 py-1.5">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>
                    El precio del combo no ofrece descuento frente a la suma individual (
                    {formatCurrency(comboMetrics.regularPrice)}).
                  </span>
                </div>
              )}

              {comboMetrics.comboPrice > 0 && comboMetrics.savings > 0 && (
                <div className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2.5 py-1.5 font-semibold">
                  <span className="inline-flex items-center gap-1">
                    <Sparkles className="size-3.5" />
                    Cliente ahorra {formatCurrency(comboMetrics.savings)} ({comboMetrics.savingsPct}% OFF)
                  </span>
                  <span className="font-mono">
                    Margen: {formatCurrency(comboMetrics.grossMargin)} ({comboMetrics.grossMarginPct}%)
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3 bg-card mt-auto">
          <Button variant="outline" type="button" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={saving} className="bg-secondary hover:bg-secondary/90 text-white font-bold">
            {saving ? "Guardando..." : editingId ? "Actualizar Paquete" : "Crear Paquete"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
