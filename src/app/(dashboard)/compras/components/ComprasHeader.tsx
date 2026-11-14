"use client";

import { useState } from "react";
import { ReceiptText, FileSpreadsheet, Plus, Boxes, Loader2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { exportarComprasExcelAction } from "@/lib/actions/compras";

export function ComprasHeader() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await exportarComprasExcelAction();
      if (!res.success || !res.data) {
        toast.error(res.error || "No se pudo generar el reporte de compras");
        return;
      }

      const byteCharacters = atob(res.data.base64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      toast.success("Reporte de compras descargado exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al exportar compras");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <ReceiptText className="size-5" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
                Registro de Compras
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Ingresa facturas y boletas de proveedores. El stock y costos de insumos se ajustan automáticamente.
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
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            disabled={isExporting}
            className="rounded-xl border-border bg-card/60 hover:bg-muted/30 text-xs font-semibold gap-2"
          >
            {isExporting ? (
              <Loader2 className="size-3.5 animate-spin text-emerald-500" />
            ) : (
              <FileSpreadsheet className="size-3.5 text-emerald-500" />
            )}
            <span>{isExporting ? "Generando..." : "Exportar Excel (.xlsx)"}</span>
          </Button>

          <Link href="/compras/nueva">
            <Button
              size="sm"
              className="rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 font-bold text-xs gap-1.5 shadow-sm"
            >
              <Plus className="size-4" />
              <span>Nueva Compra</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Sub-navegación Comprobantes / Directorio de Proveedores */}
      <div className="flex items-center gap-1.5 border-b border-border/60 pb-2">
        <Link
          href="/compras"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-secondary/15 text-secondary border border-secondary/30 text-xs font-bold transition-all"
        >
          <ReceiptText className="size-3.5" />
          <span>Comprobantes de Compra</span>
        </Link>
        <Link
          href="/compras/proveedores"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/40 border border-transparent text-xs font-semibold transition-all"
        >
          <Building2 className="size-3.5" />
          <span>Directorio de Proveedores</span>
        </Link>
      </div>
    </div>
  );
}
