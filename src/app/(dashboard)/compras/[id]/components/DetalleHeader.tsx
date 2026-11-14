"use client";

import Link from "next/link";
import { ArrowLeft, Ban, CheckCircle2, XCircle, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/formats";
import type { CompraItem } from "../../types";

interface DetalleHeaderProps {
  compra: CompraItem;
  onOpenAnular: () => void;
}

export function DetalleHeader({ compra, onOpenAnular }: DetalleHeaderProps) {
  const isAnulada = compra.estado === "anulada";

  const handlePrint = () => {
    window.print();
  };

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
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground font-mono">
              {compra.numeroComprobante}
            </h1>
            <Badge
              variant="outline"
              className="text-xs uppercase font-mono px-2 py-0.5 border-secondary/30 text-secondary bg-secondary/10"
            >
              {compra.tipoComprobante}
            </Badge>
            {isAnulada ? (
              <Badge variant="destructive" className="text-xs gap-1">
                <XCircle className="size-3" />
                Anulada
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-xs gap-1 text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
              >
                <CheckCircle2 className="size-3" />
                Ingresada en Almacén
              </Badge>
            )}
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Emitida el {formatDate(compra.fechaEmision)} • Registrada por{" "}
            {compra.usuario
              ? `${compra.usuario.nombre || ""} ${compra.usuario.apellido || ""}`.trim()
              : "Administrador"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrint}
          className="rounded-xl border-border hover:bg-muted text-xs font-semibold gap-1.5"
        >
          <Printer className="size-3.5 text-muted-foreground" />
          <span>Imprimir Comprobante</span>
        </Button>

        {!isAnulada && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenAnular}
            className="rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-bold gap-1.5"
          >
            <Ban className="size-3.5" />
            <span>Anular Compra</span>
          </Button>
        )}
      </div>
    </div>
  );
}
