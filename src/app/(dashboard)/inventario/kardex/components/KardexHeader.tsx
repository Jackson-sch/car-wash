"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, FileSpreadsheet, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { exportarKardexMovimientosExcelAction, type KardexFiltros } from "@/lib/actions/inventario";

interface KardexHeaderProps {
  filtros: KardexFiltros;
  totalMovimientos: number;
}

export function KardexHeader({ filtros, totalMovimientos }: KardexHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    if (totalMovimientos === 0) {
      toast.info("No hay movimientos registrados para exportar con los filtros actuales.");
      return;
    }

    setIsExporting(true);
    toast.info("Generando reporte de Kardex en Excel...", { duration: 2500 });

    try {
      const res = await exportarKardexMovimientosExcelAction(filtros);
      if (res.success && res.base64) {
        const byteNumbers = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
        const blob = new Blob([byteNumbers], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || "Libro_Kardex_WashMaster.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Libro Kardex exportado exitosamente (.xlsx)");
      } else {
        toast.error(res.error || "No se pudo generar el archivo");
      }
    } catch (err) {
      console.error("Error al exportar Kardex:", err);
      toast.error("Ocurrió un error al descargar el archivo");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link href="/inventario">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="size-9 rounded-xl p-0 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer shrink-0"
            title="Volver a Inventario"
          >
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
              <BookOpen className="h-6 w-6" />
            </div>
            Libro Kardex de Movimientos
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Auditoría cronológica de compras, consumos en órdenes de servicio, mermas y ajustes físicos.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <Link href="/inventario">
          <Button
            type="button"
            variant="outline"
            className="h-10 text-xs font-bold gap-2 rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs"
          >
            <Package className="h-4 w-4 text-secondary" />
            <span>Inventario de Stock</span>
          </Button>
        </Link>

        <Button
          type="button"
          variant="outline"
          onClick={handleExportExcel}
          disabled={isExporting}
          className="h-10 text-xs font-bold gap-2 rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs"
        >
          {isExporting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
              <span>Exportando...</span>
            </>
          ) : (
            <>
              <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Exportar Kardex (.xlsx)</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
