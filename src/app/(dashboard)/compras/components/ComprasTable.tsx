"use client";

import Link from "next/link";
import { Eye, CheckCircle2, XCircle, FileText, Building2, ShoppingBag, ArrowRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/formats";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { CompraItem } from "../types";

interface ComprasTableProps {
  compras: CompraItem[];
}

export function ComprasTable({ compras }: ComprasTableProps) {
  if (compras.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/40 p-12 text-center flex flex-col items-center justify-center">
        <div className="size-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary mb-3">
          <ShoppingBag className="size-6" />
        </div>
        <h3 className="text-base font-bold text-foreground">No se encontraron compras</h3>
        <p className="text-xs text-muted-foreground max-w-sm mt-1 mb-4">
          No hay facturas o boletas registradas que coincidan con los filtros actuales.
        </p>
        <Link href="/compras/nueva">
          <Button
            size="sm"
            className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-xs"
          >
            Registrar Primera Compra
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-md overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
              <th className="py-3 px-4">Comprobante</th>
              <th className="py-3 px-4">Proveedor</th>
              <th className="py-3 px-4">Insumos & Cantidad</th>
              <th className="py-3 px-4">Pago</th>
              <th className="py-3 px-4 text-right">Total (S/)</th>
              <th className="py-3 px-4 text-center">Estado</th>
              <th className="py-3 px-4 text-right">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {compras.map((compra) => {
              const isAnulada = compra.estado === "anulada";

              return (
                <tr
                  key={compra.id}
                  className={`hover:bg-muted/30 transition-colors group ${
                    isAnulada ? "opacity-60 bg-muted/10" : ""
                  }`}
                >
                  {/* 1. Comprobante */}
                  <td className="py-3 px-4">
                    <Link
                      href={`/compras/${compra.id}`}
                      className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                    >
                      <div className="size-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
                        <FileText className="size-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase font-mono px-1 py-0 h-4 border-secondary/30 text-secondary"
                          >
                            {compra.tipoComprobante}
                          </Badge>
                          <span className="font-mono font-bold text-foreground group-hover:text-secondary transition-colors">
                            {compra.numeroComprobante}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground block mt-0.5">
                          {formatDate(compra.fechaEmision)}
                        </span>
                      </div>
                    </Link>
                  </td>

                  {/* 2. Proveedor */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <Building2 className="size-3.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        {compra.proveedorId ? (
                          <Link
                            href={`/compras/proveedores/${compra.proveedorId}`}
                            className="font-bold text-foreground hover:text-secondary transition-colors block truncate max-w-[200px]"
                          >
                            {compra.proveedorNombre}
                          </Link>
                        ) : (
                          <span className="font-bold text-foreground block truncate max-w-[200px]">
                            {compra.proveedorNombre}
                          </span>
                        )}
                        {compra.proveedorRuc && (
                          <span className="text-[10px] text-muted-foreground font-mono block">
                            RUC: {compra.proveedorRuc}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* 3. Insumos */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {compra.detalles.slice(0, 2).map((det) => (
                        <span
                          key={det.id}
                          className="inline-flex items-center px-1.5 py-0.5 rounded bg-muted/60 border border-border/60 text-[10px] font-medium text-foreground truncate max-w-[140px]"
                        >
                          {det.descripcion} ({parseFloat(det.cantidad).toFixed(0)})
                        </span>
                      ))}
                      {compra.detalles.length > 2 && (
                        <span className="text-[10px] text-muted-foreground font-semibold px-1 py-0.5">
                          +{compra.detalles.length - 2} más
                        </span>
                      )}
                    </div>
                  </td>

                  {/* 4. Método de Pago */}
                  <td className="py-3 px-4">
                    <span className="capitalize text-muted-foreground font-medium">
                      {compra.metodoPago}
                    </span>
                  </td>

                  {/* 5. Total */}
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`font-mono font-black text-sm block ${
                        isAnulada ? "line-through text-muted-foreground" : "text-foreground"
                      }`}
                    >
                      {formatCurrency(parseFloat(compra.total || "0"))}
                    </span>
                    {compra.igv && parseFloat(compra.igv) > 0 && (
                      <span className="text-[9px] text-muted-foreground font-mono block">
                        incl. IGV {formatCurrency(parseFloat(compra.igv))}
                      </span>
                    )}
                  </td>

                  {/* 6. Estado */}
                  <td className="py-3 px-4 text-center">
                    {isAnulada ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <XCircle className="size-3" />
                        Anulada
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        Ingresada
                      </span>
                    )}
                  </td>

                  {/* 7. Acciones */}
                  <td className="py-3 px-4 text-right">
                    <Link href={`/compras/${compra.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2.5 rounded-lg text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/50 gap-1.5"
                      >
                        <span>Ver Ficha</span>
                        <ArrowRight className="size-3 text-secondary" />
                      </Button>
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
