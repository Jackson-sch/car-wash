"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import {
  BarChart3,
  Sparkles,
  Download,
  Calendar,
  CalendarDays,
  CalendarRange,
  Clock,
  History,
  FileSpreadsheet,
  Printer,
  ChevronDown,
} from "lucide-react";
import type { ReportData } from "./components/types";
import {
  exportarReporteExcel,
  exportarVentasCSV,
  exportarServiciosCSV,
  exportarPagosCSV,
} from "@/lib/actions/exportar-reportes";
import { toast } from "sonner";
import { ReportesSummaryCards } from "./components/ReportesSummaryCards";
import dynamic from "next/dynamic";

const VentasChart = dynamic(
  () => import("./components/VentasChart").then((m) => ({ default: m.VentasChart })),
  { ssr: false }
);
const MetodosPagoChart = dynamic(
  () => import("./components/MetodosPagoChart").then((m) => ({ default: m.MetodosPagoChart })),
  { ssr: false }
);
const ServiciosTopChart = dynamic(
  () => import("./components/ServiciosTopChart").then((m) => ({ default: m.ServiciosTopChart })),
  { ssr: false }
);
const HorasPicoChart = dynamic(
  () => import("./components/HorasPicoChart").then((m) => ({ default: m.HorasPicoChart })),
  { ssr: false }
);
import { PredictiveInsights } from "./components/PredictiveInsights";

interface ReportesClientProps {
  initialData: ReportData;
  currentRango?: string;
}

// Datos Demo detallados en caso de base de datos vacía o simulación
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

const RANGOS = [
  { id: "hoy", label: "Hoy", icon: Clock },
  { id: "7d", label: "7 Días", icon: Calendar },
  { id: "30d", label: "30 Días", icon: CalendarDays },
  { id: "mes", label: "Este Mes", icon: CalendarRange },
  { id: "todo", label: "Histórico", icon: History },
] as const;

export function ReportesClient({ initialData, currentRango = "7d" }: ReportesClientProps) {
  // Sincronización de rango temporal mediante nuqs (shallow: false para revalidación server-side)
  const [rango, setRango] = useQueryState("rango", {
    defaultValue: currentRango,
    shallow: false,
    history: "push",
  });

  // Auto-activar demo si no hay datos reales
  const demoAuto = initialData.kpis.totalVentas === 0 && initialData.kpis.ordenesCompletadas === 0;
  const [useDemo, setUseDemo] = useQueryState("demo", {
    defaultValue: demoAuto,
    parse: (v) => v === "true" || v === "1",
    serialize: (v) => (v ? "true" : "false"),
    shallow: true,
    history: "replace",
  });

  const [exporting, setExporting] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const activeRangoId = rango || currentRango;

  // Exportador oficial de Excel con ExcelJS v4.4.0
  const handleExportExcel = async (tipo: "completo" | "ventas" | "servicios" | "pagos" = "completo") => {
    setShowExportMenu(false);
    setExporting(true);
    try {
      const res = await exportarReporteExcel(tipo, activeRangoId);
      if (res.success && res.base64) {
        const byteCharacters = atob(res.base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          // eslint-disable-next-line security/detect-object-injection
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = res.filename || `reporte-${activeRangoId}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Libro Excel (.xlsx) generado y descargado con éxito");
      } else {
        toast.error(res.error || "Error al exportar archivo Excel");
      }
    } catch (err) {
      console.error(err);
      toast.error("Ocurrió un error inesperado al generar el archivo Excel");
    } finally {
      setExporting(false);
    }
  };

  const handleExport = async (type: "ventas" | "servicios" | "pagos") => {
    setShowExportMenu(false);
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
      toast.success(`Reporte de ${type} descargado correctamente`);
    } else {
      toast.error(res.error || "Error al exportar reporte");
    }
    setExporting(false);
  };

  const handlePrint = () => {
    window.print();
  };

  // Datos finales: Demo o Reales
  const kpis = useDemo
    ? { totalVentas: 9850, ticketPromedio: 34.8, ordenesCompletadas: 283 }
    : initialData.kpis;
  const ventasDiarias = useDemo ? DEMO_VENTAS_DIARIAS : initialData.ventasDiarias;
  const pagosMetodo = useDemo ? DEMO_PAGOS_METODO : initialData.pagosMetodo;
  const serviciosTop = useDemo ? DEMO_SERVICIOS_TOP : initialData.serviciosTop;
  const horasPico = useDemo ? DEMO_HORAS_PICO : (initialData.horasPico || []);

  return (
    <div className="space-y-6 sm:space-y-8 text-foreground">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-2 border-b border-border/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-secondary/10 text-secondary">
              <BarChart3 className="h-6 w-6" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              Reportes e Indicadores
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Análisis de ingresos, servicios estrella y flujos financieros de tu autolavado.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Selector de Rango Temporal */}
          <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border shadow-xs">
            {RANGOS.map((item) => {
              const Icon = item.icon;
              const isActive = activeRangoId === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRango(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? "bg-secondary text-secondary-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Menú de Exportación y PDF */}
          <div className="relative">
            <button
              type="button"
              disabled={exporting}
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="text-xs font-bold bg-card border border-border hover:bg-muted text-foreground h-9 px-3 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5 text-secondary" />
              <span>{exporting ? "Generando..." : "Exportar"}</span>
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-64 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden py-1">
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 flex items-center justify-between">
                    <span>Libros Excel (ExcelJS)</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      v4.4.0
                    </span>
                  </div>

                  {/* Excel Completo Multi-Hoja */}
                  <button
                    type="button"
                    onClick={() => handleExportExcel("completo")}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-foreground hover:bg-muted flex items-center justify-between cursor-pointer transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <div className="text-foreground">Reporte Ejecutivo Completo</div>
                        <div className="text-[10px] font-medium text-muted-foreground">KPIs + Ventas + Servicios + Pagos</div>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-secondary/10 text-secondary font-mono">
                      .XLSX
                    </span>
                  </button>

                  <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border-t border-border/30 mt-1">
                    Hojas Específicas
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExportExcel("ventas")}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                    <span>Detalle de Ventas (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportExcel("servicios")}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span>Ranking de Servicios (.xlsx)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportExcel("pagos")}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    <span>Flujo de Pagos (.xlsx)</span>
                  </button>

                  <div className="border-t border-border/40 my-1" />

                  <div className="px-3 py-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Otros Formatos
                  </div>

                  <button
                    type="button"
                    onClick={() => handleExport("ventas")}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>Ventas en CSV Plano</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowExportMenu(false);
                      handlePrint();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Printer className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>Imprimir Resumen / Guardar PDF</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Toggle Datos Demo */}
          <button
            type="button"
            onClick={() => setUseDemo(!useDemo)}
            className={`text-xs font-bold border h-9 px-3 rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors ${
              useDemo
                ? "bg-amber-500/10 border-amber-500/30 text-amber-500 hover:bg-amber-500/20"
                : "bg-card border-border hover:bg-muted text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>{useDemo ? "Modo Demo Activo" : "Simulación Demo"}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats con redondeo de 2 decimales y etiquetas de período */}
      <ReportesSummaryCards
        kpis={kpis}
        currentRango={activeRangoId}
        serviciosTop={serviciosTop}
      />

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
