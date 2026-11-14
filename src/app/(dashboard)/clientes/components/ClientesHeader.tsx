"use client";

import { useState } from "react";
import { Users, UserPlus, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportarClientesExcelAction } from "@/lib/actions/clientes";

interface ClientesHeaderProps {
  onOpenCreate: () => void;
  totalClientes: number;
}

export function ClientesHeader({ onOpenCreate, totalClientes }: ClientesHeaderProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportExcel = async () => {
    if (totalClientes === 0) {
      toast.info("No hay clientes en el directorio para exportar.");
      return;
    }

    setIsExporting(true);
    toast.info("Generando directorio corporativo en Excel...", { duration: 2500 });

    try {
      const res = await exportarClientesExcelAction();
      if (res.success && res.base64) {
        const byteNumbers = Uint8Array.from(atob(res.base64), (c) => c.charCodeAt(0));
        const blob = new Blob([byteNumbers], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || "Directorio_Clientes_WashMaster.xlsx";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        toast.success("Directorio de Clientes exportado exitosamente (.xlsx)");
      } else {
        toast.error(res.error || "No se pudo exportar el directorio");
      }
    } catch (err) {
      console.error("Error al exportar clientes:", err);
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
            <Users className="h-6 w-6" />
          </div>
          Directorio de Clientes
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1">
          Gestión integral de clientes, historial de servicios, vehículos asociados y fidelización por puntos.
        </p>
      </div>

      <div className="flex items-center gap-2.5">
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
              <span>Exportar Excel (.xlsx)</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          onClick={onOpenCreate}
          className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs gap-2 cursor-pointer h-10 rounded-xl shadow-xs"
        >
          <UserPlus className="h-4 w-4" />
          <span>Registrar Cliente</span>
        </Button>
      </div>
    </div>
  );
}
