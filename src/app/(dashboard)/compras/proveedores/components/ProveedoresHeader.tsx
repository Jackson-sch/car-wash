"use client";

import { Building2, Plus, ReceiptText, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface ProveedoresHeaderProps {
  onNewProveedor: () => void;
}

export function ProveedoresHeader({ onNewProveedor }: ProveedoresHeaderProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Directorio de Proveedores
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Se alimenta automáticamente al registrar compras. Consulta cuentas bancarias, contactos e historial de cada proveedor.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link href="/inventario">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-border bg-card/60 hover:bg-muted/30 text-xs font-semibold gap-2"
            >
              <Boxes className="size-3.5 text-secondary" />
              <span>Ver Inventario</span>
            </Button>
          </Link>

          <Button
            size="sm"
            onClick={onNewProveedor}
            variant="outline"
            className="rounded-xl border-border bg-card/60 hover:bg-muted/30 font-bold text-xs gap-1.5"
          >
            <Plus className="size-4 text-secondary" />
            <span>Nuevo Proveedor</span>
          </Button>

          <Link href="/compras/nueva">
            <Button
              size="sm"
              className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-xs gap-1.5 shadow-sm"
            >
              <ReceiptText className="size-3.5" />
              <span>Registrar Compra</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Sub-navegación Comprobantes / Directorio de Proveedores */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
        <Link
          href="/compras"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent text-xs font-semibold transition-all"
        >
          <ReceiptText className="size-3.5" />
          <span>Comprobantes de Compra</span>
        </Link>
        <Link
          href="/compras/proveedores"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 text-xs font-bold transition-all"
        >
          <Building2 className="size-3.5" />
          <span>Directorio de Proveedores</span>
        </Link>
      </div>
    </div>
  );
}
