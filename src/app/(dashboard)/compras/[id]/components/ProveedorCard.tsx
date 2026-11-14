"use client";

import { Building2, CreditCard, Calendar, FileText, Info, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/formats";
import type { CompraItem } from "../../types";

interface ProveedorCardProps {
  compra: CompraItem;
}

export function ProveedorCard({ compra }: ProveedorCardProps) {
  return (
    <Card className="border border-border bg-card/60 backdrop-blur-md rounded-2xl p-5 shadow-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Proveedor */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Proveedor
          </span>
          <div className="flex items-center gap-1.5">
            <Building2 className="size-4 text-secondary shrink-0" />
            {compra.proveedorId ? (
              <Link
                href={`/compras/proveedores/${compra.proveedorId}`}
                className="inline-flex items-center gap-1 text-sm font-bold text-foreground hover:text-secondary transition-colors truncate"
              >
                <span className="truncate">{compra.proveedorNombre}</span>
                <ExternalLink className="size-3 shrink-0 text-secondary" />
              </Link>
            ) : (
              <span className="text-sm font-bold text-foreground truncate">
                {compra.proveedorNombre}
              </span>
            )}
          </div>
          {compra.proveedorRuc && (
            <span className="text-[11px] font-mono text-muted-foreground block">
              RUC: {compra.proveedorRuc}
            </span>
          )}
        </div>

        {/* Documento */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Documento
          </span>
          <div className="flex items-center gap-1.5">
            <FileText className="size-4 text-secondary shrink-0" />
            <span className="text-sm font-mono font-bold text-foreground">
              {compra.numeroComprobante}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground uppercase font-semibold block">
            {compra.tipoComprobante}
          </span>
        </div>

        {/* Forma de Pago */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Forma de Pago
          </span>
          <div className="flex items-center gap-1.5">
            <CreditCard className="size-4 text-secondary shrink-0" />
            <span className="text-sm font-semibold text-foreground capitalize">
              {compra.metodoPago}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Liquidación comercial
          </span>
        </div>

        {/* Fecha de Emisión */}
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
            Fecha Emisión
          </span>
          <div className="flex items-center gap-1.5">
            <Calendar className="size-4 text-secondary shrink-0" />
            <span className="text-sm font-semibold text-foreground">
              {formatDate(compra.fechaEmision)}
            </span>
          </div>
          <span className="text-[11px] text-muted-foreground block">
            Comprobante fiscal
          </span>
        </div>
      </div>

      {compra.observaciones && (
        <div className="mt-4 pt-3 border-t border-border/60 flex items-start gap-2 text-xs text-muted-foreground">
          <Info className="size-4 text-secondary shrink-0 mt-0.5" />
          <div>
            <strong className="text-foreground">Observaciones:</strong> {compra.observaciones}
          </div>
        </div>
      )}
    </Card>
  );
}
