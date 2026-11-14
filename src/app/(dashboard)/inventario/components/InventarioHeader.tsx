"use client";

import { useState } from "react";
import { Package, Plus, FileSpreadsheet, ReceiptText, FlaskConical, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import { exportarInventarioExcelAction } from "@/lib/actions/inventario";

interface InventarioHeaderProps {
  onOpenCreate: () => void;
  onOpenRecetas: () => void;
  totalItems: number;
}

export function InventarioHeader({
  onOpenCreate,
  onOpenRecetas,
  totalItems,
}: InventarioHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    if (totalItems === 0) {
      toast.info("No hay insumos registrados para exportar.");
      return;
    }

    setIsExporting(true);
    toast.info("Generando Kardex ejecutivo en Excel...", { duration: 2500 });

    try {
      const res = await exportarInventarioExcelAction();
      if (res.success && res.base64) {
        const byteNumbers = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
        const blob = new Blob([byteNumbers], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || "Kardex_Inventario_WashMaster.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Kardex de Inventario exportado exitosamente (.xlsx)");
      } else {
        toast.error(res.error || "No se pudo exportar el archivo");
      }
    } catch (err) {
      console.error("Error al exportar inventario:", err);
      toast.error("Ocurrió un error al descargar el archivo");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-secondary/10 text-secondary border border-secondary/20">
            <Package className="h-6 w-6" />
          </div>
          Control de Inventario & Kardex
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Supervisa el stock en tiempo real de químicos, ceras, siliconas y toallas con alertas de reposición.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        <Link href="/inventario/kardex">
          <Button
            type="button"
            variant="outline"
            className="h-10 text-xs font-bold gap-2 rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs"
          >
            <BookOpen className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>Libro Kardex</span>
          </Button>
        </Link>

        <Link href="/compras">
          <Button
            type="button"
            variant="outline"
            className="h-10 text-xs font-bold gap-2 rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs"
          >
            <ReceiptText className="h-4 w-4 text-secondary" />
            <span>Facturas de Compra</span>
          </Button>
        </Link>

        <Button
          type="button"
          variant="outline"
          onClick={onOpenRecetas}
          className="h-10 text-xs font-bold gap-2 rounded-xl border-border hover:bg-muted cursor-pointer shadow-xs"
        >
          <FlaskConical className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          <span>Recetas de Servicios</span>
        </Button>

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

        <Button
          type="button"
          onClick={onOpenCreate}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs gap-2 cursor-pointer h-10 rounded-xl shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span>Agregar Insumo</span>
        </Button>
      </div>
    </div>
  );
}
