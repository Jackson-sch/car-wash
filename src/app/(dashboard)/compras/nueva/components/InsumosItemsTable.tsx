"use client";

import { Plus, Trash2, Package, Boxes } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formats";
import type { InsumoOption } from "../../types";

export interface ItemRow {
  insumoId: string;
  descripcion: string;
  cantidad: number;
  costoUnitario: number;
}

interface InsumosItemsTableProps {
  items: ItemRow[];
  insumos: InsumoOption[];
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  onItemChange: (index: number, field: keyof ItemRow, value: string | number) => void;
}

export function InsumosItemsTable({
  items,
  insumos,
  onAddItem,
  onRemoveItem,
  onItemChange,
}: InsumosItemsTableProps) {
  const insumoSelectItems = insumos.map((ins) => ({
    value: ins.id,
    label: ins.nombre,
  }));

  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-secondary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            2. Insumos & Mercadería ({items.length})
          </h2>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="rounded-xl border-border hover:bg-muted text-xs font-bold gap-1.5 h-8"
        >
          <Plus className="size-3.5 text-secondary" />
          <span>Agregar Ítem</span>
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground">
              <th className="py-2.5 px-3 min-w-[220px]">Insumo</th>
              <th className="py-2.5 px-3 w-28 text-center">Cantidad</th>
              <th className="py-2.5 px-3 w-32 text-right">Costo Unit. (S/)</th>
              <th className="py-2.5 px-3 w-32 text-right">Subtotal</th>
              <th className="py-2.5 px-2 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {items.map((item, idx) => {
              const selectedInsumo = insumos.find((ins) => ins.id === item.insumoId);
              const subtotal = item.cantidad * item.costoUnitario;

              return (
                <tr key={idx} className="hover:bg-muted/20 transition-colors">
                  {/* Selector Insumo */}
                  <td className="py-2.5 px-3">
                    <Select
                      items={insumoSelectItems}
                      value={item.insumoId}
                      onValueChange={(val) => {
                        if (val) onItemChange(idx, "insumoId", val);
                      }}
                    >
                      <SelectTrigger className="h-9 rounded-xl border-border bg-card text-xs font-medium">
                        <SelectValue placeholder="Seleccionar insumo...">
                          {(val) => {
                            const found = insumos.find((ins) => ins.id === val);
                            return found?.nombre || selectedInsumo?.nombre || item.descripcion || "Seleccionar insumo...";
                          }}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-card max-h-60">
                        {insumos.map((ins) => (
                          <SelectItem key={ins.id} value={ins.id} label={ins.nombre}>
                            <div className="flex items-center justify-between gap-3 w-full">
                              <span className="font-medium text-foreground">{ins.nombre}</span>
                              <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                                Stock: {parseFloat(ins.stock || "0").toFixed(0)} {ins.unidad || ""}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>

                  {/* Cantidad */}
                  <td className="py-2.5 px-3">
                    <div className="relative">
                      <Input
                        type="number"
                        step="any"
                        min="0.1"
                        value={item.cantidad}
                        onChange={(e) => onItemChange(idx, "cantidad", e.target.value)}
                        className="h-9 rounded-xl border-border bg-card text-xs font-mono font-bold text-center pr-8"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground font-medium pointer-events-none">
                        {selectedInsumo?.unidad ? selectedInsumo.unidad.slice(0, 3) : "und"}
                      </span>
                    </div>
                  </td>

                  {/* Costo Unitario */}
                  <td className="py-2.5 px-3">
                    <div className="relative">
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-muted-foreground font-mono">
                        S/
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        value={item.costoUnitario}
                        onChange={(e) => onItemChange(idx, "costoUnitario", e.target.value)}
                        className="pl-7 h-9 rounded-xl border-border bg-card text-xs font-mono font-bold text-right"
                      />
                    </div>
                  </td>

                  {/* Subtotal */}
                  <td className="py-2.5 px-3 text-right font-mono font-black text-sm text-foreground">
                    {formatCurrency(subtotal)}
                  </td>

                  {/* Eliminar */}
                  <td className="py-2.5 px-2 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="size-8 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2 flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddItem}
          className="rounded-xl border-border hover:bg-muted text-xs font-bold gap-1.5"
        >
          <Plus className="size-3.5 text-secondary" />
          <span>Agregar Otra Fila de Insumo</span>
        </Button>
      </div>
    </Card>
  );
}
