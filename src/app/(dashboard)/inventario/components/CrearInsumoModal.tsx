"use client";

import { useState } from "react";
import { X, Package } from "lucide-react";
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

interface CrearInsumoModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  onSave: (data: {
    nombre: string;
    descripcion: string;
    unidad: string;
    stockMinimo: string;
    precioCompra: string;
    proveedor: string;
  }) => Promise<boolean>;
}

export function CrearInsumoModal({ isOpen, onClose, isPending, onSave }: CrearInsumoModalProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [unidad, setUnidad] = useState("litros");
  const [stockMinimo, setStockMinimo] = useState("5.000");
  const [precioCompra, setPrecioCompra] = useState("");
  const [proveedor, setProveedor] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    const success = await onSave({
      nombre,
      descripcion,
      unidad,
      stockMinimo,
      precioCompra,
      proveedor,
    });

    if (success) {
      setNombre("");
      setDescripcion("");
      setUnidad("litros");
      setStockMinimo("5.000");
      setPrecioCompra("");
      setProveedor("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Agregar Insumo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registra químicos, ceras, toallas o shampoo para el inventario.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Columna 1: Información Básica */}
              <div className="space-y-4">
                <div className="border-b border-border/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Detalles del Producto
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="itNom" className="text-xs font-bold text-muted-foreground">
                    Nombre del Insumo *
                  </Label>
                  <Input
                    id="itNom"
                    placeholder="Ej. Shampoo Activador Espuma Activa"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    required
                    className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9.5 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="itUnit" className="text-xs font-bold text-muted-foreground">
                    Unidad de Medida
                  </Label>
                  <Select
                    value={unidad}
                    onValueChange={(val: string | null) => val && setUnidad(val)}
                  >
                    <SelectTrigger
                      id="itUnit"
                      className="w-full bg-background border-border text-foreground rounded-lg text-xs h-9.5 px-3"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover text-popover-foreground border border-border">
                      <SelectItem value="litros">Litros (L)</SelectItem>
                      <SelectItem value="galones">Galones (Gal)</SelectItem>
                      <SelectItem value="unidades">Unidades (Und)</SelectItem>
                      <SelectItem value="paquetes">Paquetes (Paq)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="itDesc" className="text-xs font-bold text-muted-foreground">
                    Descripción / Uso
                  </Label>
                  <textarea
                    id="itDesc"
                    placeholder="Detalles sobre uso, dosificación o precauciones..."
                    value={descripcion}
                    onChange={(e) => setDescripcion(e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border hover:border-zinc-400 focus:border-secondary rounded-lg text-xs p-3 outline-none resize-none transition-colors"
                  />
                </div>
              </div>

              {/* Columna 2: Stock y Costos */}
              <div className="space-y-4">
                <div className="border-b border-border/60 pb-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Control de Stock y Costos
                  </h4>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="itMin" className="text-xs font-bold text-muted-foreground">
                    Stock Mínimo Alerta *
                  </Label>
                  <Input
                    id="itMin"
                    type="number"
                    step="0.001"
                    placeholder="5.000"
                    value={stockMinimo}
                    onChange={(e) => setStockMinimo(e.target.value)}
                    required
                    className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9.5 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="itPrice" className="text-xs font-bold text-muted-foreground">
                    Precio Compra Base (S/)
                  </Label>
                  <Input
                    id="itPrice"
                    type="number"
                    step="0.01"
                    placeholder="12.50"
                    value={precioCompra}
                    onChange={(e) => setPrecioCompra(e.target.value)}
                    className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9.5 rounded-lg"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="itProv" className="text-xs font-bold text-muted-foreground">
                    Proveedor
                  </Label>
                  <Input
                    id="itProv"
                    placeholder="Ej. Químicos Lima S.A.C."
                    value={proveedor}
                    onChange={(e) => setProveedor(e.target.value)}
                    className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9.5 rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-4 sm:px-6 border-t border-border bg-muted/30 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 rounded-lg px-6 shadow-sm cursor-pointer"
            >
              {isPending ? "Registrando..." : "Registrar Insumo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
