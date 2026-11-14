"use client";

import { Package, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formats";
import type { CompraDetalleItem } from "../../types";

interface InsumosTableProps {
  detalles: CompraDetalleItem[];
}

export function InsumosTable({ detalles }: InsumosTableProps) {
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border/60">
        <div className="flex items-center gap-2">
          <Package className="size-4 text-secondary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Insumos & Mercadería Ingresada ({detalles.length})
          </h2>
        </div>
        <span className="text-xs text-muted-foreground">
          Movimiento registrado en Kardex
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/60 bg-muted/30 text-[10px] uppercase font-bold text-muted-foreground">
              <th className="py-3 px-4">Insumo</th>
              <th className="py-3 px-4 text-center">Cantidad Ingresada</th>
              <th className="py-3 px-4 text-right">Costo Unitario (S/)</th>
              <th className="py-3 px-4 text-right">Subtotal</th>
              <th className="py-3 px-4 text-center">Stock Actual</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {detalles.map((det) => {
              const cantNum = parseFloat(det.cantidad || "0");
              const costoNum = parseFloat(det.costoUnitario || "0");
              const subNum = parseFloat(det.subtotal || "0");
              const stockActual = parseFloat(det.insumo?.stock || "0");

              return (
                <tr key={det.id} className="hover:bg-muted/20 transition-colors">
                  {/* Nombre Insumo */}
                  <td className="py-3 px-4">
                    <span className="font-bold text-foreground text-sm block">
                      {det.descripcion}
                    </span>
                    {det.insumo?.unidad && (
                      <span className="text-[10px] text-muted-foreground">
                        Presentación: {det.insumo.unidad}
                      </span>
                    )}
                  </td>

                  {/* Cantidad */}
                  <td className="py-3 px-4 text-center font-mono font-black text-sm text-foreground">
                    +{cantNum.toFixed(2)}{" "}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      {det.insumo?.unidad || "und"}
                    </span>
                  </td>

                  {/* Costo Unitario */}
                  <td className="py-3 px-4 text-right font-mono text-sm text-muted-foreground">
                    {formatCurrency(costoNum)}
                  </td>

                  {/* Subtotal */}
                  <td className="py-3 px-4 text-right font-mono font-black text-sm text-foreground">
                    {formatCurrency(subNum)}
                  </td>

                  {/* Stock Actual en Almacén */}
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-muted/60 text-foreground border border-border/60">
                      <CheckCircle2 className="size-3 text-emerald-500" />
                      {stockActual.toFixed(1)} {det.insumo?.unidad || ""}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
