"use client";

import { useState, useEffect } from "react";
import { useQueryState } from "nuqs";
import { BarChart3, Sparkles, Download } from "lucide-react";
import { ReportData } from "./components/types";
import { exportarVentasCSV, exportarServiciosCSV, exportarPagosCSV } from "@/lib/actions/exportar-reportes";
import { toast } from "sonner";
import { ReportesSummaryCards } from "./components/ReportesSummaryCards";
import { VentasChart } from "./components/VentasChart";
import { MetodosPagoChart } from "./components/MetodosPagoChart";
import { ServiciosTopChart } from "./components/ServiciosTopChart";
import { HorasPicoChart } from "./components/HorasPicoChart";
import { PredictiveInsights } from "./components/PredictiveInsights";

interface ReportesClientProps {
  initialData: ReportData;
}

// Datos Demo detallados en caso de base de datos vacía
const DEMO_VENTAS_DIARIAS = [
  { fecha: "Mon", ventas: 840 },
  { fecha: "Tue", ventas: 950 },
  { fecha: "Wed", ventas: 1100 },
  { fecha: "Thu", ventas: 1245 },
  { fecha: "Fri", ventas: 1680 },
  { fecha: "Sat", ventas: 2100 },
  { fecha: "Sun", ventas: 1950 },
];

const DEMO_PAGOS_METODO = [
  { name: "EFECTIVO", value: 3450 },
  { name: "TARJETA", value: 2800 },
  { name: "YAPE/PLIN", value: 2500 },
  { name: "TRANSFERENCIA", value: 1100 },
];

const DEMO_SERVICIOS_TOP = [
  { name: "Lavado Completo", cantidad: 120, total: 3600 },
  { name: "Lavado Premium", cantidad: 85, total: 4250 },
  { name: "Encerado Orbital", cantidad: 35, total: 4200 },
  { name: "Lavado de Motor", cantidad: 28, total: 1260 },
  { name: "Lavado de Salón", cantidad: 15, total: 4200 },
];

const DEMO_HORAS_PICO = [
  { hora: "08:00", cantidad: 2, prediccion: 3 },
  { hora: "09:00", cantidad: 5, prediccion: 6 },
  { hora: "10:00", cantidad: 11, prediccion: 13 },
  { hora: "11:00", cantidad: 18, prediccion: 20 },
  { hora: "12:00", cantidad: 14, prediccion: 17 },
  { hora: "13:00", cantidad: 8, prediccion: 10 },
  { hora: "14:00", cantidad: 6, prediccion: 8 },
  { hora: "15:00", cantidad: 10, prediccion: 12 },
  { hora: "16:00", cantidad: 13, prediccion: 15 },
  { hora: "17:00", cantidad: 15, prediccion: 18 },
  { hora: "18:00", cantidad: 9, prediccion: 11 },
  { hora: "19:00", cantidad: 4, prediccion: 6 },
  { hora: "20:00", cantidad: 1, prediccion: 2 },
];

export function ReportesClient({ initialData }: ReportesClientProps) {
  const [mounted, setMounted] = useState(false);
  const [useDemo, setUseDemo] = useQueryState("demo", {
    defaultValue: false,
    parse: (v) => v === "true" || v === "1",
    serialize: (v) => (v ? "true" : "false"),
    shallow: true,
    history: "replace",
  });
  const [exporting, setExporting] = useState(false);

  const handleExport = async (type: "ventas" | "servicios" | "pagos") => {
    setExporting(true);
    const fn = type === "ventas" ? exportarVentasCSV : type === "servicios" ? exportarServiciosCSV : exportarPagosCSV;
    const res = await fn();
    if (res.success && res.csv) {
      const blob = new Blob([res.csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = res.filename || `${type}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Reporte de ${type} exportado`);
    } else {
      toast.error(res.error || "Error al exportar");
    }
    setExporting(false);
  };

  // Evitar desajustes de hidratación de Recharts
  useEffect(() => {
    setMounted(true);
    // Si no hay ventas registradas en absoluto en los KPIs generales, activar demo automáticamente
    if (initialData.kpis.totalVentas === 0 && initialData.kpis.ordenesCompletadas === 0) {
      setUseDemo(true);
    }
  }, [initialData]);

  if (!mounted) {
    return (
      <div className="h-96 flex items-center justify-center text-zinc-500 text-xs">
        Cargando visualizaciones estadísticas...
      </div>
    );
  }

  // Decidir qué datos usar
  const kpis = useDemo
    ? { totalVentas: 9850, ticketPromedio: 34.8, ordenesCompletadas: 283 }
    : initialData.kpis;
  const ventasDiarias = useDemo ? DEMO_VENTAS_DIARIAS : initialData.ventasDiarias;
  const pagosMetodo = useDemo ? DEMO_PAGOS_METODO : initialData.pagosMetodo;
  const serviciosTop = useDemo ? DEMO_SERVICIOS_TOP : initialData.serviciosTop;
  const horasPico = useDemo ? DEMO_HORAS_PICO : (initialData.horasPico || []);

  return (
    <div className="space-y-8 text-foreground">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 flex items-center gap-2.5">
            <BarChart3 className="h-7 w-7 text-secondary" />
            Reportes e Indicadores
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Análisis de ingresos, servicios estrella y flujos financieros de tu autolavado.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="relative group">
              <button
                disabled={exporting}
                className="text-[10px] font-bold bg-card border border-zinc-350 hover:bg-zinc-50 text-zinc-700 h-9 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5 text-secondary" />
                {exporting ? "Exportando..." : "Exportar"}
              </button>
              <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 overflow-hidden">
                <button
                  onClick={() => handleExport("ventas")}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  Ventas CSV
                </button>
                <button
                  onClick={() => handleExport("servicios")}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  Servicios CSV
                </button>
                <button
                  onClick={() => handleExport("pagos")}
                  className="w-full text-left px-3 py-2 text-xs font-medium text-foreground hover:bg-muted cursor-pointer"
                >
                  Pagos CSV
                </button>
              </div>
            </div>

            <button
              onClick={() => setUseDemo(!useDemo)}
              className="text-[10px] font-bold bg-card border border-zinc-350 hover:bg-zinc-50 text-zinc-700 h-9 px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-secondary" />
              {useDemo ? "Ver Datos Reales" : "Ver Simulación Demo"}
            </button>
          </div>
        </div>
      </div>

      {/* KPI stats */}
      <ReportesSummaryCards kpis={kpis} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <VentasChart ventasDiarias={ventasDiarias} />
        <MetodosPagoChart pagosMetodo={pagosMetodo} />
        <ServiciosTopChart serviciosTop={serviciosTop} />
      </div>

      {/* Analítica Predictiva y Horas Pico */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <HorasPicoChart horasPico={horasPico} />
        </div>
        <div className="xl:col-span-1">
          <PredictiveInsights 
            kpis={kpis} 
            serviciosTop={serviciosTop} 
            horasPico={horasPico} 
          />
        </div>
      </div>
    </div>
  );
}
