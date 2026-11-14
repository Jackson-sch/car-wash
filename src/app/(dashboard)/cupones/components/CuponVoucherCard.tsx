"use client";

import { useState } from "react";
import {
  Copy,
  Check,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  ShoppingBag,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formats";
import { toast } from "sonner";
import type { CuponItem } from "../types";

interface CuponVoucherCardProps {
  cupon: CuponItem;
  onEdit: (cupon: CuponItem) => void;
  onDelete?: (id: string, codigo: string) => void;
  onToggleStatus: (id: string, activoActual: boolean) => void;
  isPending: boolean;
}

export function CuponVoucherCard({
  cupon: c,
  onEdit,
  onDelete,
  onToggleStatus,
  isPending,
}: CuponVoucherCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(c.codigo);
    setCopied(true);
    toast.success(`Código ${c.codigo} copiado al portapapeles`);
    setTimeout(() => setCopied(false), 2000);
  };

  const isPercentage = c.tipoDescuento === "porcentaje";
  const numUsos = c.usos?.length || 0;
  const limite = c.limiteTotal || 0;
  const porcentajeConsumido = limite > 0 ? Math.min(100, Math.round((numUsos / limite) * 100)) : null;

  const now = new Date();
  const isExpired = c.fechaFin ? new Date(c.fechaFin) < now : false;
  const isExhausted = limite > 0 && numUsos >= limite;

  return (
    <Card
      className={`relative overflow-hidden rounded-3xl border transition-all duration-300 p-5 flex flex-col justify-between shadow-xs ${
        !c.activo
          ? "bg-muted/30 border-dashed border-border/80 opacity-75"
          : isExpired || isExhausted
          ? "bg-rose-500/5 border-rose-500/20 shadow-xs"
          : "bg-card hover:border-secondary/50 hover:shadow-md"
      }`}
    >
      {/* Header del Voucher: Código y Switch */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between gap-2">
          {/* Badge del Código con Botón Copiar */}
          <div className="flex items-center gap-1.5 bg-muted/60 border border-border rounded-xl px-2.5 py-1.5 shadow-xs">
            <span className="font-mono font-black text-xs sm:text-sm tracking-widest text-foreground">
              {c.codigo}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="size-6 rounded-md hover:bg-background flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
              title="Copiar código al portapapeles"
            >
              {copied ? (
                <Check className="size-3.5 text-emerald-500" />
              ) : (
                <Copy className="size-3.5" />
              )}
            </button>
          </div>

          {/* Switch Activo / Inactivo */}
          <div className="flex items-center gap-2">
            <Switch
              checked={c.activo}
              onCheckedChange={() => onToggleStatus(c.id, c.activo)}
              disabled={isPending}
              aria-label={`Estado cupón ${c.codigo}`}
            />
          </div>
        </div>

        {/* Descuento Destacado */}
        <div className="flex items-baseline justify-between pt-1">
          <div>
            <div className="flex items-center gap-2 text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono">
              {isPercentage ? (
                <>
                  <span>{c.valorDescuento}%</span>
                  <span className="text-[11px] uppercase font-black text-secondary px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
                    OFF
                  </span>
                </>
              ) : (
                <>
                  <span>{formatCurrency(c.valorDescuento)}</span>
                  <span className="text-[11px] uppercase font-black text-secondary px-2 py-0.5 rounded-full bg-secondary/10 border border-secondary/20">
                    DSCTO FIJO
                  </span>
                </>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground mt-1 font-medium flex items-center gap-1">
              <ShoppingBag className="size-3 text-muted-foreground/70" />
              {c.compraMinima && c.compraMinima > 0
                ? `Compra mínima: ${formatCurrency(c.compraMinima)}`
                : "Sin compra mínima requerida"}
            </p>
          </div>
        </div>

        {/* Servicios Aplicables */}
        <div className="pt-0.5">
          {c.servicios && c.servicios.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {c.servicios.slice(0, 3).map((s, idx) => (
                <span
                  key={s.servicioId || idx}
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/60 truncate max-w-[140px]"
                >
                  {s.servicio?.nombre || "Servicio"}
                </span>
              ))}
              {c.servicios.length > 3 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">
                  +{c.servicios.length - 3} más
                </span>
              )}
            </div>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-secondary/10 text-secondary border border-secondary/20">
              Válido en todos los servicios de lavado
            </span>
          )}
        </div>

        {/* Barra de Progreso de Cupo */}
        {limite > 0 && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between items-center text-[10px] font-semibold text-muted-foreground">
              <span>Cupo consumido</span>
              <span className="font-mono font-bold text-foreground">
                {numUsos} / {limite} ({porcentajeConsumido}%)
              </span>
            </div>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  porcentajeConsumido! >= 100
                    ? "bg-rose-500"
                    : porcentajeConsumido! >= 80
                    ? "bg-amber-500"
                    : "bg-secondary"
                }`}
                style={{ width: `${Math.min(100, porcentajeConsumido || 0)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Línea divisoria estilo ticket con muescas perforadas */}
      <div className="relative my-4">
        <div className="border-t border-dashed border-border/80" />
        <div className="absolute -left-7 -top-2 size-4 rounded-full bg-background border-r border-border" />
        <div className="absolute -right-7 -top-2 size-4 rounded-full bg-background border-l border-border" />
      </div>

      {/* Métricas y Acciones del Footer */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-muted-foreground font-semibold">
            <TrendingUp className="size-3.5 text-secondary" />
            <span className="font-mono">{numUsos}</span>
            <span>{numUsos === 1 ? "canje" : "canjes"}</span>
          </div>

          <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
            <Calendar className="size-3" />
            <span>
              {c.fechaFin ? `Hasta ${formatDate(c.fechaFin, "dd/MM/yyyy")}` : "Sin caducidad"}
            </span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-border/50">
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

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onEdit(c)}
              className="h-8 px-2.5 text-xs font-bold gap-1 text-muted-foreground hover:text-foreground cursor-pointer rounded-xl hover:bg-muted"
            >
              <Pencil className="size-3.5" />
              Editar
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onDelete(c.id, c.codigo)}
                className="size-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-xl"
                title="Eliminar cupón"
              >
                <Trash2 className="size-3.5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
