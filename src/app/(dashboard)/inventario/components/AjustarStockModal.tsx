"use client";

import { useState } from "react";
import { X, Package, ArrowUpCircle, ArrowDownCircle, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/formats";

interface Insumo {
  id: string;
  nombre: string;
  descripcion: string | null;
  unidad: string | null;
  stock: string | null;
  stockMinimo: string | null;
  precioCompra: string | null;
  proveedor: string | null;
  activo: boolean | null;
}

interface AjustarStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: Insumo | null;
  isPending: boolean;
  onSave: (
    tipo: "entrada" | "salida" | "ajuste",
    cantidad: string,
    motivo: string
  ) => Promise<boolean>;
}

const MOV_CONFIG = {
  entrada: {
    label: "Entrada",
    desc: "Compra o reposición",
    icon: ArrowUpCircle,
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    activeBg: "bg-emerald-500/20",
    activeText: "text-emerald-700 dark:text-emerald-300",
  },
  salida: {
    label: "Salida",
    desc: "Descarte o uso",
    icon: ArrowDownCircle,
    color: "text-rose-600 dark:text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    activeBg: "bg-rose-500/20",
    activeText: "text-rose-700 dark:text-rose-300",
  },
  ajuste: {
    label: "Ajuste",
    desc: "Corrección manual",
    icon: Settings2,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    activeBg: "bg-amber-500/20",
    activeText: "text-amber-700 dark:text-amber-300",
  },
};

export function AjustarStockModal({
  isOpen,
  onClose,
  selectedItem,
  isPending,
  onSave,
}: AjustarStockModalProps) {
  const [movTipo, setMovTipo] = useState<"entrada" | "salida" | "ajuste">("entrada");
  const [movCantidad, setMovCantidad] = useState("");
  const [movMotivo, setMovMotivo] = useState("");

  if (!isOpen || !selectedItem) return null;

  const currentConfig = MOV_CONFIG[movTipo];
  const CurrentIcon = currentConfig.icon;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movCantidad.trim() || !movMotivo.trim()) return;

    const success = await onSave(movTipo, movCantidad, movMotivo);
    if (success) {
      setMovTipo("entrada");
      setMovCantidad("");
      setMovMotivo("");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        {/* Header */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">Ajustar Stock</h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">{selectedItem.nombre}</p>
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

        {/* Current stock indicator */}
        <div className="px-5 pt-4 pb-1 flex items-center gap-4 text-xs">
          <div className="flex-1 p-3 rounded-lg bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Stock Actual
            </span>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {parseFloat(selectedItem.stock || "0").toFixed(2)}{" "}
              <span className="text-xs font-medium text-muted-foreground">{selectedItem.unidad}</span>
            </p>
          </div>
          <div className="flex-1 p-3 rounded-lg bg-muted/40 border border-border">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              Stock Mínimo
            </span>
            <p className="text-lg font-extrabold text-foreground mt-0.5">
              {parseFloat(selectedItem.stockMinimo || "0").toFixed(2)}{" "}
              <span className="text-xs font-medium text-muted-foreground">{selectedItem.unidad}</span>
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Movement type selector */}
          <div>
            <Label className="text-[10px] font-bold text-foreground block mb-2">
              Tipo de Movimiento
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.entries(MOV_CONFIG) as [keyof typeof MOV_CONFIG, typeof MOV_CONFIG[keyof typeof MOV_CONFIG]][]).map(([key, cfg]) => {
                const Icon = cfg.icon;
                const isActive = movTipo === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMovTipo(key as typeof movTipo)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-[10px] font-bold cursor-pointer transition-all ${
                      isActive
                        ? `${cfg.activeBg} ${cfg.activeText} ${cfg.border}`
                        : "bg-background text-muted-foreground border-border hover:border-zinc-400 hover:text-foreground"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? cfg.color : ""}`} />
                    <span>{cfg.label}</span>
                    <span className="text-[8px] font-medium opacity-70">{cfg.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity */}
          <div className="space-y-2">
            <Label htmlFor="movQty" className="text-[10px] font-bold text-foreground">
              Cantidad ({selectedItem.unidad})
            </Label>
            <Input
              id="movQty"
              type="number"
              step="0.001"
              placeholder="10.000"
              value={movCantidad}
              onChange={(e) => setMovCantidad(e.target.value)}
              required
              className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
            />
          </div>

          {/* Motive */}
          <div className="space-y-2">
            <Label htmlFor="movRsn" className="text-[10px] font-bold text-foreground">
              Concepto / Motivo *
            </Label>
            <Input
              id="movRsn"
              placeholder="Ej. Ingreso de factura, descarte por vencimiento..."
              value={movMotivo}
              onChange={(e) => setMovMotivo(e.target.value)}
              required
              className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-lg"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-3 border-t border-border">
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
              {isPending
                ? "Procesando..."
                : `Registrar ${MOV_CONFIG[movTipo].label}`}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
