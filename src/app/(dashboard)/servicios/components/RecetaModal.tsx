"use client";

import { useState, useEffect } from "react";
import { FlaskConical, Plus, Trash2, Send, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getRecetaServicio, asignarRecetaServicio } from "@/lib/actions/servicios";

interface InsumoDisponible {
  id: string;
  nombre: string;
  unidad: string | null;
}

interface RecetaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioId: string;
  servicioNombre: string;
  insumosDisponibles: InsumoDisponible[];
  onSuccess?: () => void;
}

export function RecetaModal({
  open,
  onOpenChange,
  servicioId,
  servicioNombre,
  insumosDisponibles,
  onSuccess,
}: RecetaModalProps) {
  const [items, setItems] = useState<
    { itemId: string; cantidadConsumo: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && servicioId) {
      setIsLoading(true);
      getRecetaServicio(servicioId)
        .then((receta) => {
          setItems(
            receta.map((r) => ({
              itemId: r.itemId,
              cantidadConsumo: r.cantidadConsumo,
            }))
          );
        })
        .finally(() => setIsLoading(false));
    }
  }, [open, servicioId]);

  const handleAddItem = () => {
    if (insumosDisponibles.length === 0) {
      toast.error("No hay insumos creados en el inventario");
      return;
    }
    // Seleccionar automáticamente el siguiente insumo del inventario no asignado
    const selectedIds = new Set(items.map((i) => i.itemId));
    const nextInsumo = insumosDisponibles.find((i) => !selectedIds.has(i.id)) || insumosDisponibles[0];

    setItems((prev) => [
      ...prev,
      { itemId: nextInsumo.id, cantidadConsumo: "0.050" },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: "itemId" | "cantidadConsumo", value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await asignarRecetaServicio(servicioId, items);
      if (res.success) {
        toast.success("Receta de consumo guardada correctamente");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Error al guardar receta");
      }
    } catch {
      toast.error("Error al procesar la receta");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border p-6 md:p-8 shadow-2xl">
        <DialogHeader className="space-y-1.5 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2.5 text-xl font-black tracking-tight">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <FlaskConical className="h-5 w-5" />
            </div>
            <span>Receta de Insumos — {servicioNombre}</span>
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Configura los productos del inventario y las cantidades exactas que se descontarán automáticamente al realizar este servicio.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-sm font-medium text-muted-foreground flex flex-col items-center gap-2">
            <FlaskConical className="h-8 w-8 text-purple-500 animate-pulse" />
            Cargando receta del servicio...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 pt-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Insumos Requeridos ({items.length})
                </span>

                <Button
                  type="button"
                  onClick={handleAddItem}
                  className="h-9 text-xs font-bold gap-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Agregar Insumo a la Receta
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="py-10 px-6 border-2 border-dashed border-border rounded-xl text-center space-y-2 bg-muted/10">
                  <FlaskConical className="h-10 w-10 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-bold text-muted-foreground">
                    Este servicio aún no tiene receta asignada.
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
                    Haz clic en "Agregar Insumo a la Receta" para vincular productos del inventario (ej. Shampoo, Cera, Desengrasante).
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[320px] overflow-y-auto pr-1">
                  {/* Encabezado de la tabla de receta */}
                  <div className="flex items-center gap-3 px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                    <div className="flex-1 min-w-0">Producto / Insumo</div>
                    <div className="w-32 shrink-0 text-center">Cantidad Consumo</div>
                    <div className="w-24 shrink-0 text-center">Unidad</div>
                    <div className="w-10 shrink-0 text-right">Quitar</div>
                  </div>

                  {items.map((item, index) => {
                    const insumoActual = insumosDisponibles.find((i) => i.id === item.itemId);
                    return (
                      <div
                        key={`receta-item-${index}-${item.itemId}`}
                        className="flex items-center gap-3 p-3 border border-border rounded-xl bg-card hover:bg-muted/20 transition-all shadow-sm"
                      >
                        {/* Selector de Insumo (Ocupa todo el espacio disponible sobrante) */}
                        <div className="flex-1 min-w-0">
                          <select
                            value={item.itemId}
                            aria-label="Seleccionar insumo"
                            onChange={(e) => handleItemChange(index, "itemId", e.target.value)}
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-xs md:text-sm font-bold truncate focus:ring-2 focus:ring-purple-500 focus:outline-none"
                          >
                            {insumosDisponibles.map((ins) => (
                              <option key={ins.id} value={ins.id}>
                                {ins.nombre} ({ins.unidad || "unidad"})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Input Cantidad (Ancho fijo 128px) */}
                        <div className="w-32 shrink-0">
                          <Input
                            type="number"
                            step="0.001"
                            placeholder="0.050"
                            aria-label="Cantidad de consumo"
                            value={item.cantidadConsumo}
                            onChange={(e) =>
                              handleItemChange(index, "cantidadConsumo", e.target.value)
                            }
                            className="h-10 text-xs md:text-sm font-black text-center"
                            required
                          />
                        </div>

                        {/* Badge Unidad (Ancho fijo 96px) */}
                        <div className="w-24 shrink-0 text-center">
                          <span className="inline-block w-full py-2 text-xs font-black bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-lg uppercase truncate">
                            {insumoActual?.unidad || "unid"}
                          </span>
                        </div>

                        {/* Botón Eliminar (Ancho fijo 40px) */}
                        <div className="w-10 shrink-0 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label="Eliminar insumo"
                            onClick={() => handleRemoveItem(index)}
                            className="h-10 w-10 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs font-bold h-10 px-5 cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-10 gap-2 px-6 shadow-md shadow-purple-950/40 cursor-pointer"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "Guardando Receta..." : "Guardar Receta"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
