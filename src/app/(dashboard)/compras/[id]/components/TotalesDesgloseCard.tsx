"use client";

import Link from "next/link";
import { DollarSign, ShieldCheck, Boxes, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/lib/formats";
import type { CompraItem } from "../../types";

interface TotalesDesgloseCardProps {
  compra: CompraItem;
}

export function TotalesDesgloseCard({ compra }: TotalesDesgloseCardProps) {
  const subtotalNum = parseFloat(compra.subtotal || "0");
  const igvNum = parseFloat(compra.igv || "0");
  const totalNum = parseFloat(compra.total || "0");

  return (
    <div className="space-y-4">
      {/* Resumen Financiero */}
      <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border/60">
          <DollarSign className="size-4 text-secondary" />
          <h2 className="text-sm font-bold text-foreground uppercase tracking-wide">
            Liquidación Financiera
          </h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span>Subtotal:</span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(subtotalNum)}
            </span>
          </div>

          <div className="flex items-center justify-between text-muted-foreground">
            <span>IGV (18%):</span>
            <span className="font-mono font-bold text-foreground">
              {formatCurrency(igvNum)}
            </span>
          </div>

          <div className="pt-3 border-t border-border/60 flex items-baseline justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted-foreground">
              Total Factura
            </span>
            <span className="text-2xl font-black font-mono text-secondary">
              {formatCurrency(totalNum)}
            </span>
          </div>
        </div>

        {/* Trazabilidad en Kardex */}
        <div className="p-3.5 rounded-xl bg-muted/30 border border-border/60 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-foreground">
            <ShieldCheck className="size-4 text-emerald-500" />
            <span>Trazabilidad de Auditoría</span>
          </div>
          <div className="space-y-1 text-[11px] text-muted-foreground">
            <p>
              <strong>Registro en BD:</strong>{" "}
              {formatDate(compra.createdAt || compra.fechaEmision)}
            </p>
            <p>
              <strong>Registrado por:</strong>{" "}
              {compra.usuario
                ? `${compra.usuario.nombre || ""} ${compra.usuario.apellido || ""}`.trim()
                : "Sistema"}
            </p>
            <p>
              <strong>Estado:</strong>{" "}
              <span className="uppercase font-bold text-foreground">
                {compra.estado}
              </span>
            </p>
          </div>
        </div>

        <Link href="/inventario" className="block pt-1">
          <Button
            variant="outline"
            className="w-full h-9 rounded-xl border-border hover:bg-muted text-xs font-semibold gap-1.5"
          >
            <Boxes className="size-3.5 text-secondary" />
            <span>Ver Movimientos en Kardex</span>
            <ArrowUpRight className="size-3 text-muted-foreground ml-auto" />
          </Button>
        </Link>
      </Card>
    </div>
  );
}
