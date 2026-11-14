"use client";

import Link from "next/link";
import { ArrowLeft, PackagePlus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function NuevaCompraHeader() {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
      <div className="flex items-center gap-3">
        <Link href="/compras">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-9 rounded-xl border border-border bg-card/60 hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Registrar Compra
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary/15 text-secondary border border-secondary/25">
              <Sparkles className="size-3" />
              Stock Automático
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Ingreso formal de mercadería con factura o boleta de proveedor.
          </p>
        </div>
      </div>
    </div>
  );
}
