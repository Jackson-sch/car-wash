"use client";

import { useState } from "react";
import { Tag, FileSpreadsheet, Plus, X, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportarCuponesExcelAction } from "@/lib/actions/cupones";

interface CuponesHeaderProps {
  isCreating: boolean;
  onToggleCreating: () => void;
  showGuide: boolean;
  onToggleGuide: () => void;
}

export function CuponesHeader({
  isCreating,
  onToggleCreating,
  showGuide,
  onToggleGuide,
}: CuponesHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await exportarCuponesExcelAction();

      if (!res.success || !res.base64) {
        toast.error(res.error || "No se pudo exportar el catálogo de cupones.");
        return;
      }

      // Convertir Base64 a Blob y disparar descarga
      const binaryString = atob(res.base64);
      const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || "Reporte_Cupones_Promociones.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Catálogo de cupones exportado correctamente a Excel.");
    } catch (err) {
      console.error("Error exportando a Excel:", err);
      toast.error("Ocurrió un error inesperado al generar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Tag className="size-7 text-secondary" />
          Cupones & Promociones
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Crea códigos promocionales de descuento porcentual o monto fijo y fideliza a tus clientes.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Botón Exportar Excel */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isExporting}
          onClick={handleExportExcel}
          className="h-10 text-xs font-bold gap-2 rounded-xl border-border bg-card/80 hover:bg-muted text-foreground cursor-pointer shadow-xs disabled:opacity-60"
        >
          {isExporting ? (
            <span className="size-4 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
          ) : (
            <FileSpreadsheet className="size-4 text-emerald-500" />
          )}
          <span className="hidden sm:inline">
            {isExporting ? "Generando..." : "Exportar Excel (.xlsx)"}
          </span>
          <span className="sm:hidden">Excel</span>
        </Button>

        {/* Guía Desplegable */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onToggleGuide}
          className="h-10 text-xs font-bold gap-1.5 rounded-xl border-border bg-card/80 hover:bg-muted text-foreground cursor-pointer shadow-xs"
        >
          <Lightbulb className="size-4 text-amber-500" />
          <span className="hidden sm:inline">Guía</span>
          {showGuide ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </Button>

        {/* Crear / Cerrar Formulario */}
        <Button
          type="button"
          onClick={onToggleCreating}
          className="h-10 px-4 text-xs sm:text-sm font-bold gap-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm cursor-pointer"
        >
          {isCreating ? (
            <>
              <X className="size-4" />
              Cerrar Formulario
            </>
          ) : (
            <>
              <Plus className="size-4" />
              Nuevo Cupón
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
