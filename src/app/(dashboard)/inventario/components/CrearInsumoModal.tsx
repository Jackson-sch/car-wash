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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Agregar Insumo</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registra químicos, ceras, toallas o shampoo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="itNom" className="text-xs font-bold text-foreground">
              Nombre del Insumo *
            </Label>
            <Input
              id="itNom"
              placeholder="Ej. Shampoo Activador Espuma Activa"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              required
              className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itUnit" className="text-xs font-bold text-foreground">
                Unidad de Medida
              </Label>
              <Select
                value={unidad}
                onValueChange={(val: string | null) => val && setUnidad(val)}
              >
                <SelectTrigger
                  id="itUnit"
                  className="w-full bg-background border-border text-foreground rounded-lg text-xs h-9 px-3"
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
            <div className="space-y-2">
              <Label htmlFor="itMin" className="text-xs font-bold text-foreground">
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
                className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="itPrice" className="text-xs font-bold text-foreground">
                Precio Compra Base (S/)
              </Label>
              <Input
                id="itPrice"
                type="number"
                step="0.01"
                placeholder="12.50"
                value={precioCompra}
                onChange={(e) => setPrecioCompra(e.target.value)}
                className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itProv" className="text-xs font-bold text-foreground">
                Proveedor
              </Label>
              <Input
                id="itProv"
                placeholder="Ej. Químicos Lima S.A.C."
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="itDesc" className="text-xs font-bold text-foreground">
              Descripción
            </Label>
            <textarea
              id="itDesc"
              placeholder="Detalles sobre uso o dosificación..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              rows={2}
              className="w-full bg-background border border-border hover:border-zinc-400 focus:border-secondary rounded-lg text-xs p-3 outline-none resize-none transition-colors"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 border-t border-border pt-4 mt-6">
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
              className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 rounded-lg px-5 shadow-sm cursor-pointer"
            >
              {isPending ? "Registrando..." : "Registrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
