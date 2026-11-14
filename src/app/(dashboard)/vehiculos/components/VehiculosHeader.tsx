"use client";

import { useState } from "react";
import Link from "next/link";
import { Car, FileSpreadsheet, Plus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportarVehiculosExcelAction } from "@/lib/actions/vehiculos";

export function VehiculosHeader() {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    try {
      setIsExporting(true);
      const res = await exportarVehiculosExcelAction();

      if (!res.success || !res.base64) {
        toast.error(res.error || "No se pudo exportar la flota de vehículos.");
        return;
      }

      // Descargar archivo Excel en el cliente
      const binaryString = atob(res.base64);
      const bytes = Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || "Reporte_Vehiculos_WashMaster.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Flota de vehículos exportada correctamente a Excel.");
    } catch (err) {
      console.error("Error al exportar vehículos a Excel:", err);
      toast.error("Ocurrió un error inesperado al generar el archivo Excel.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground flex items-center gap-2.5">
          <Car className="size-7 text-secondary" />
          Vehículos Registrados
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Directorio de unidades vehiculares, placas peruanas, historial de servicios y clientes asociados.
        </p>
      </div>

      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Exportar Excel */}
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

        {/* Ver Clientes */}
        <Link href="/clientes">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-10 text-xs font-bold gap-1.5 rounded-xl border-border bg-card/80 hover:bg-muted text-foreground cursor-pointer shadow-xs"
          >
            <Users className="size-4 text-secondary" />
            <span className="hidden sm:inline">Ver Clientes</span>
          </Button>
        </Link>

        {/* Nueva Orden */}
        <Link href="/ordenes/nueva">
          <Button
            type="button"
            className="h-10 px-4 text-xs sm:text-sm font-bold gap-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm cursor-pointer"
          >
            <Plus className="size-4" />
            Nueva Orden
          </Button>
        </Link>
      </div>
    </div>
  );
}
