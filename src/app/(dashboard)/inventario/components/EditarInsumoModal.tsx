"use client";

import { useState } from "react";
import { X, Pencil, Trash2, AlertCircle, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Insumo } from "./InventarioTable";

interface EditarInsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumo: Insumo | null;
  isPending: boolean;
  onSave: (data: {
    id: string;
    nombre: string;
    descripcion: string;
    unidad: string;
    stockMinimo: string;
    precioCompra: string;
    proveedor: string;
  }) => Promise<boolean>;
  onToggleActivo: (id: string, activo: boolean) => Promise<boolean>;
}

const UNIDAD_LABELS: Record<string, string> = {
  litros: "Litros (L)",
  galones: "Galones (Gal)",
  unidades: "Unidades (Und)",
  paquetes: "Paquetes (Paq)",
  botellas: "Botellas",
  frascos: "Frascos",
  kilogramos: "Kilogramos (Kg)",
};

export function EditarInsumoModal(props: EditarInsumoModalProps) {
  if (!props.isOpen || !props.insumo) return null;
  return <EditarInsumoModalContent key={props.insumo.id} {...props} insumo={props.insumo} />;
}

function EditarInsumoModalContent({
  onClose,
  insumo,
  isPending,
  onSave,
  onToggleActivo,
}: Omit<EditarInsumoModalProps, "insumo"> & { insumo: Insumo }) {
  const [nombre, setNombre] = useState(insumo.nombre || "");
  const [descripcion, setDescripcion] = useState(insumo.descripcion || "");
  const [unidad, setUnidad] = useState(insumo.unidad || "litros");
  const [stockMinimo, setStockMinimo] = useState(
    insumo.stockMinimo ? parseFloat(insumo.stockMinimo).toFixed(3) : "5.000"
  );
  const [precioCompra, setPrecioCompra] = useState(
    insumo.precioCompra ? parseFloat(insumo.precioCompra).toFixed(2) : ""
  );
  const [proveedor, setProveedor] = useState(insumo.proveedor || "");
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const success = await onSave({
      id: insumo.id,
      nombre,
      descripcion,
      unidad,
      stockMinimo,
      precioCompra,
      proveedor,
    });

    if (success) {
      onClose();
    }
  };

  const handleDeactivate = async () => {
    const success = await onToggleActivo(insumo.id, false);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <Pencil className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">Editar Insumo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Modifica especificaciones técnicas, alertas de stock mínimo o costos.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="editNom" className="text-xs font-bold text-muted-foreground">
                Nombre del Insumo *
              </Label>
              <Input
                id="editNom"
                placeholder="Ej. Shampoo Activador Espuma Activa"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editUnit" className="text-xs font-bold text-muted-foreground">
                  Unidad de Medida
                </Label>
                <Select
                  value={unidad}
                  onValueChange={(val: string | null) => val && setUnidad(val)}
                >
                  <SelectTrigger
                    id="editUnit"
                    className="w-full bg-background border-border text-foreground rounded-xl text-xs h-10 px-3.5"
                  >
                    <SelectValue placeholder="Seleccionar unidad">
                      {UNIDAD_LABELS[unidad] || unidad}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-popover text-popover-foreground border border-border">
                    <SelectItem value="litros">Litros (L)</SelectItem>
                    <SelectItem value="galones">Galones (Gal)</SelectItem>
                    <SelectItem value="unidades">Unidades (Und)</SelectItem>
                    <SelectItem value="paquetes">Paquetes (Paq)</SelectItem>
                    <SelectItem value="botellas">Botellas</SelectItem>
                    <SelectItem value="frascos">Frascos</SelectItem>
                    <SelectItem value="kilogramos">Kilogramos (Kg)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editMin" className="text-xs font-bold text-muted-foreground">
                  Stock Mínimo (Alerta de reposición)
                </Label>
                <Input
                  id="editMin"
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="5.000"
                  value={stockMinimo}
                  onChange={(e) => setStockMinimo(e.target.value)}
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl font-mono font-bold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="editPrecio" className="text-xs font-bold text-muted-foreground">
                  Costo de Reposición Referencial (S/)
                </Label>
                <Input
                  id="editPrecio"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={precioCompra}
                  onChange={(e) => setPrecioCompra(e.target.value)}
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl font-mono font-bold"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="editProv" className="text-xs font-bold text-muted-foreground">
                  Proveedor Habitual
                </Label>
                <Input
                  id="editProv"
                  placeholder="Ej. Meguiar's Perú, Wurth..."
                  value={proveedor}
                  onChange={(e) => setProveedor(e.target.value)}
                  className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-10 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="editDesc" className="text-xs font-bold text-muted-foreground">
                Descripción o Notas Técnicas
              </Label>
              <textarea
                id="editDesc"
                rows={3}
                placeholder="Detalle sobre aplicación, dilución recomendada o código interno..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full bg-background border border-border hover:border-zinc-400 focus:border-secondary text-xs p-3 rounded-xl resize-none outline-hidden"
              />
            </div>

            {/* Zona de Peligro / Desactivación */}
            <div className="pt-3 border-t border-border/60">
              {!showDeactivateConfirm ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/60">
                  <div className="flex items-center gap-2.5">
                    <AlertCircle className="size-4 text-muted-foreground" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Desactivar del Catálogo</p>
                      <p className="text-[10px] text-muted-foreground">
                        Oculta el insumo de compras y recetas sin borrar el historial de órdenes pasadas.
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDeactivateConfirm(true)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 text-xs font-bold h-8"
                  >
                    <Trash2 className="size-3.5 mr-1" />
                    Dar de baja
                  </Button>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    ¿Confirmas dar de baja este insumo?
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    El insumo quedará inactivo. Sus compras previas y movimientos de Kardex seguirán intactos.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={handleDeactivate}
                      disabled={isPending}
                      className="h-8 text-xs font-bold rounded-lg"
                    >
                      Sí, dar de baja
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDeactivateConfirm(false)}
                      className="h-8 text-xs font-bold"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-end gap-2.5 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isPending}
              className="rounded-xl text-xs font-bold h-10 px-4 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !nombre.trim()}
              className="rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold h-10 px-5 gap-2 cursor-pointer shadow-xs"
            >
              <Save className="size-4" />
              <span>{isPending ? "Guardando..." : "Guardar Cambios"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
