"use client";

import { useState, useEffect, useMemo } from "react";
import { FlaskConical, Plus, Trash2, Send, Package, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getRecetaServicio, asignarRecetaServicio } from "@/lib/actions/servicios";
import { formatCurrency } from "@/lib/formats";

export interface InsumoDisponible {
  id: string;
  nombre: string;
  unidad: string | null;
  precioCompra?: string | null;
  stock?: string | null;
}

interface RecetaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  servicioId: string;
  servicioNombre: string;
  servicioPrecio?: string | number;
  insumosDisponibles: InsumoDisponible[];
  onSuccess?: (totalItems: number, costoTotal: number) => void;
}

export function RecetaModal(props: RecetaModalProps) {
  if (!props.open) return null;
  return <RecetaModalContent key={props.servicioId} {...props} />;
}

function RecetaModalContent({
  open,
  onOpenChange,
  servicioId,
  servicioNombre,
  servicioPrecio = 0,
  insumosDisponibles,
  onSuccess,
}: RecetaModalProps) {
  const [items, setItems] = useState<
    { id: string; itemId: string; cantidadConsumo: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    if (servicioId) {
      getRecetaServicio(servicioId)
        .then((receta) => {
          if (!active) return;
          setItems(
            receta.map((r, idx) => ({
              id: `rec_${idx}_${r.itemId}`,
              itemId: r.itemId,
              cantidadConsumo: r.cantidadConsumo,
            }))
          );
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }
    return () => {
      active = false;
    };
  }, [servicioId]);

  const insumoSelectItems = useMemo(
    () => insumosDisponibles.map((i) => ({ value: i.id, label: i.nombre })),
    [insumosDisponibles]
  );

  // Cálculo en vivo del costo químico de la receta y margen bruto
  const costoTotal = useMemo(() => {
    return items.reduce((acc, it) => {
      const ins = insumosDisponibles.find((i) => i.id === it.itemId);
      const precioUnit = parseFloat(ins?.precioCompra || "0") || 0;
      const qty = parseFloat(it.cantidadConsumo || "0") || 0;
      return acc + precioUnit * qty;
    }, 0);
  }, [items, insumosDisponibles]);

  const tarifaServicio = typeof servicioPrecio === "string"
    ? parseFloat(servicioPrecio || "0") || 0
    : servicioPrecio || 0;
  const margenSoles = tarifaServicio - costoTotal;
  const margenPct = tarifaServicio > 0 ? Math.round((margenSoles / tarifaServicio) * 100) : 0;

  const handleAddItem = () => {
    if (insumosDisponibles.length === 0) {
      toast.error("No hay insumos creados en el inventario");
      return;
    }
    const selectedIds = new Set(items.map((i) => i.itemId));
    const nextInsumo = insumosDisponibles.find((i) => !selectedIds.has(i.id)) || insumosDisponibles[0];

    setItems((prev) => [
      ...prev,
      { id: `rec_${Date.now()}_${Math.random()}`, itemId: nextInsumo.id, cantidadConsumo: "0.050" },
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
      const itemsPayload = items.map(({ itemId, cantidadConsumo }) => ({ itemId, cantidadConsumo }));
      const res = await asignarRecetaServicio(servicioId, itemsPayload);
      if (res.success) {
        toast.success("Receta de consumo guardada correctamente");
        onOpenChange(false);
        if (onSuccess) onSuccess(items.length, costoTotal);
      } else {
        toast.error(res.error || "Error al guardar receta");
      }
    } catch {
      toast.error("Ocurrió un error inesperado");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border p-5 sm:p-6 shadow-2xl rounded-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-1.5 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2.5 text-lg sm:text-xl font-black tracking-tight">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
              <FlaskConical className="h-5 w-5" />
            </div>
            <span>Receta de Insumos — {servicioNombre}</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Configura los productos del inventario y las cantidades exactas que se descontarán automáticamente al completar este servicio.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-12 text-center text-sm font-medium text-muted-foreground flex flex-col items-center gap-2">
            <FlaskConical className="h-8 w-8 text-purple-500 animate-pulse" />
            Cargando receta del servicio...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            {/* Resumen de Rentabilidad en Vivo */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-muted/30 border border-border/60 text-xs">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Tarifa Servicio
                </span>
                <span className="text-sm font-black font-mono text-foreground">
                  {formatCurrency(tarifaServicio)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Costo Insumos
                </span>
                <span className="text-sm font-black font-mono text-amber-500">
                  {formatCurrency(costoTotal)}
                </span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Margen Bruto
                </span>
                <span className="text-sm font-black font-mono text-emerald-500 inline-flex items-center gap-1">
                  <TrendingUp className="size-3.5" />
                  {formatCurrency(margenSoles)} ({margenPct}%)
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                  <Package className="h-4 w-4 text-purple-500" />
                  Insumos Requeridos ({items.length})
                </span>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddItem}
                  className="h-8 text-xs font-bold gap-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl shadow-sm cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar Insumo
                </Button>
              </div>

              {items.length === 0 ? (
                <div className="py-8 px-6 border-2 border-dashed border-border rounded-xl text-center space-y-2 bg-muted/10">
                  <FlaskConical className="h-9 w-9 text-muted-foreground/40 mx-auto" />
                  <p className="text-sm font-bold text-muted-foreground">
                    Este servicio aún no tiene receta asignada.
                  </p>
                  <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
                    Haz clic en &quot;Agregar Insumo&quot; para vincular productos del inventario (ej. Shampoo, Cera, Desengrasante).
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                  <div className="flex items-center gap-2 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                    <div className="flex-1 min-w-0">Producto / Insumo</div>
                    <div className="w-28 shrink-0 text-center">Consumo</div>
                    <div className="w-20 shrink-0 text-center">Subtotal</div>
                    <div className="w-8 shrink-0"></div>
                  </div>

                  {items.map((item, index) => {
                    const insumoActual = insumosDisponibles.find((i) => i.id === item.itemId);
                    const subCosto =
                      (parseFloat(insumoActual?.precioCompra || "0") || 0) *
                      (parseFloat(item.cantidadConsumo || "0") || 0);

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-2 p-2.5 border border-border rounded-xl bg-card hover:bg-muted/20 transition-colors"
                      >
                        {/* Selector de Insumo */}
                        <div className="flex-1 min-w-0">
                          <Select
                            items={insumoSelectItems}
                            value={item.itemId}
                            onValueChange={(val) => {
                              if (val) handleItemChange(index, "itemId", val);
                            }}
                          >
                            <SelectTrigger className="h-9 rounded-lg border-border bg-background text-xs font-medium">
                              <SelectValue placeholder="Seleccionar insumo...">
                                {(val) => {
                                  const found = insumosDisponibles.find((i) => i.id === val);
                                  return found?.nombre || insumoActual?.nombre || "Seleccionar insumo...";
                                }}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-card max-h-56">
                              {insumosDisponibles.map((ins) => (
                                <SelectItem key={ins.id} value={ins.id} label={ins.nombre}>
                                  <div className="flex items-center justify-between gap-3 w-full">
                                    <span className="font-medium text-foreground">{ins.nombre}</span>
                                    <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                      {ins.unidad || "unid"}
                                    </span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Input Cantidad + Unidad */}
                        <div className="w-28 shrink-0 relative">
                          <Input
                            type="number"
                            step="0.001"
                            min="0.001"
                            placeholder="0.050"
                            aria-label="Cantidad de consumo"
                            value={item.cantidadConsumo}
                            onChange={(e) =>
                              handleItemChange(index, "cantidadConsumo", e.target.value)
                            }
                            className="h-9 text-xs font-mono font-bold text-center pr-9 rounded-lg"
                            required
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground uppercase pointer-events-none">
                            {(insumoActual?.unidad || "und").slice(0, 3)}
                          </span>
                        </div>

                        {/* Subtotal Costo */}
                        <div className="w-20 shrink-0 text-right font-mono font-bold text-xs text-foreground">
                          {formatCurrency(subCosto)}
                        </div>

                        {/* Botón Eliminar */}
                        <div className="w-8 shrink-0 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="Eliminar insumo"
                            onClick={() => handleRemoveItem(index)}
                            className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-lg cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border flex justify-end gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="text-xs font-bold h-9 px-4 rounded-xl cursor-pointer"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs h-9 gap-1.5 px-5 rounded-xl shadow-sm cursor-pointer"
              >
                <Send className="h-3.5 w-3.5" />
                {isSubmitting ? "Guardando..." : "Guardar Receta"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
