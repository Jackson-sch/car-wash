"use client";

import { useState } from "react";
import { Copy, Check, Pencil, Trash2, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formats";
import { toast } from "sonner";
import type { CuponItem } from "../types";

interface CuponesTableProps {
  cupones: CuponItem[];
  onEdit: (cupon: CuponItem) => void;
  onDelete?: (id: string, codigo: string) => void;
  onToggleStatus: (id: string, activoActual: boolean) => void;
  isPending: boolean;
}

export function CuponesTable({
  cupones,
  onEdit,
  onDelete,
  onToggleStatus,
  isPending,
}: CuponesTableProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (id: string, codigo: string) => {
    navigator.clipboard.writeText(codigo);
    setCopiedId(id);
    toast.success(`Código ${codigo} copiado`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const now = new Date();

  return (
    <Card className="border border-border bg-card shadow-xs overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
              <th className="p-3.5 pl-4">Código</th>
              <th className="p-3.5">Beneficio</th>
              <th className="p-3.5 text-right">Compra Mínima</th>
              <th className="p-3.5 text-center">Canjes / Cupo</th>
              <th className="p-3.5">Servicios</th>
              <th className="p-3.5">Vigencia</th>
              <th className="p-3.5 text-center">Estado</th>
              <th className="p-3.5 text-right pr-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {cupones.map((c) => {
              const isPercentage = c.tipoDescuento === "porcentaje";
              const numUsos = c.usos?.length || 0;
              const limite = c.limiteTotal || 0;
              const porcentajeConsumido =
                limite > 0 ? Math.min(100, Math.round((numUsos / limite) * 100)) : null;

              const isExpired = c.fechaFin ? new Date(c.fechaFin) < now : false;
              const isExhausted = limite > 0 && numUsos >= limite;

              return (
                <tr
                  key={c.id}
                  className={`hover:bg-muted/20 transition-colors ${
                    !c.activo ? "opacity-60 bg-muted/10" : ""
                  }`}
                >
                  {/* Código + Copy */}
                  <td className="p-3.5 pl-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground text-xs sm:text-sm tracking-wider">
                        {c.codigo}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleCopy(c.id, c.codigo)}
                        className="size-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title="Copiar código"
                      >
                        {copiedId === c.id ? (
                          <Check className="size-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Beneficio */}
                  <td className="p-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-sm text-foreground">
                        {isPercentage
                          ? `${c.valorDescuento}%`
                          : formatCurrency(c.valorDescuento)}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isPercentage
                            ? "bg-secondary/10 text-secondary border border-secondary/20"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {isPercentage ? "Porcentaje" : "Fijo"}
                      </span>
                    </div>
                  </td>

                  {/* Compra Mínima */}
                  <td className="p-3.5 text-right font-mono font-medium">
                    {c.compraMinima && c.compraMinima > 0 ? (
                      <span className="text-foreground font-bold">
                        {formatCurrency(c.compraMinima)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground text-[11px]">Sin mínimo</span>
                    )}
                  </td>

                  {/* Canjes / Cupo */}
                  <td className="p-3.5 text-center">
                    <div className="inline-flex flex-col items-center">
                      <span className="font-mono font-bold text-xs text-foreground">
                        {numUsos} {limite > 0 ? `/ ${limite}` : "canjes"}
                      </span>
                      {limite > 0 && (
                        <div className="w-16 h-1 bg-muted rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full rounded-full ${
                              porcentajeConsumido! >= 100
                                ? "bg-rose-500"
                                : porcentajeConsumido! >= 80
                                ? "bg-amber-500"
                                : "bg-secondary"
                            }`}
                            style={{ width: `${porcentajeConsumido}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Servicios */}
                  <td className="p-3.5 max-w-[200px]">
                    {c.servicios && c.servicios.length > 0 ? (
                      <span className="truncate block text-muted-foreground text-[11px]" title={c.servicios.map(s => s.servicio?.nombre).join(", ")}>
                        {c.servicios.length === 1
                          ? c.servicios[0]?.servicio?.nombre
                          : `${c.servicios.length} servicios específicos`}
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">
                        Todos los servicios
                      </span>
                    )}
                  </td>

                  {/* Vigencia */}
                  <td className="p-3.5">
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Calendar className="size-3" />
                      {c.fechaFin ? formatDate(c.fechaFin, "dd/MM/yyyy") : "Permanente"}
                    </span>
                  </td>

                  {/* Estado Badge */}
                  <td className="p-3.5 text-center">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        !c.activo
                          ? "border-border text-muted-foreground bg-muted/40"
                          : isExpired
                          ? "border-rose-500/30 text-rose-500 bg-rose-500/10"
                          : isExhausted
                          ? "border-amber-500/30 text-amber-500 bg-amber-500/10"
                          : "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                      }`}
                    >
                      {!c.activo
                        ? "Pausado"
                        : isExpired
                        ? "Expirado"
                        : isExhausted
                        ? "Agotado"
                        : "Activo"}
                    </Badge>
                  </td>

                  {/* Acciones */}
                  <td className="p-3.5 pr-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Switch
                        checked={c.activo}
                        onCheckedChange={() => onToggleStatus(c.id, c.activo)}
                        disabled={isPending}
                        aria-label={`Toggle cupón ${c.codigo}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(c)}
                        className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-foreground"
                        title="Editar cupón"
                      >
                        <Pencil className="size-3.5" />
                      </Button>
                      {onDelete && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(c.id, c.codigo)}
                          className="size-8 rounded-lg cursor-pointer text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Eliminar cupón"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      )}
                    </div>
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
