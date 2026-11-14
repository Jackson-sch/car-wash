"use client";

import { useEffect, useState, useMemo } from "react";
import {
  X,
  History,
  ArrowUpCircle,
  ArrowDownCircle,
  Settings2,
  Calendar,
  User,
  Package,
  Layers,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMovimientosInsumoAction } from "@/lib/actions/inventario";
import { formatCurrency } from "@/lib/formats";
import type { Insumo } from "./InventarioTable";

interface MovimientoItem {
  id: string;
  tipo: "entrada" | "salida" | "ajuste";
  cantidad: string;
  motivo: string | null;
  createdAt: Date | null;
  usuarioResponsable: string;
}

interface KardexMovimientosModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumo: Insumo | null;
}

export function KardexMovimientosModal(props: KardexMovimientosModalProps) {
  if (!props.isOpen || !props.insumo) return null;
  return (
    <KardexMovimientosContent
      key={props.insumo.id}
      onClose={props.onClose}
      insumo={props.insumo}
    />
  );
}

function KardexMovimientosContent({
  onClose,
  insumo,
}: {
  onClose: () => void;
  insumo: Insumo;
}) {
  const [loading, setLoading] = useState(true);
  const [movimientos, setMovimientos] = useState<MovimientoItem[]>([]);
  const [tipoFiltro, setTipoFiltro] = useState<"todos" | "entrada" | "salida" | "ajuste">("todos");

  useEffect(() => {
    let active = true;
    getMovimientosInsumoAction(insumo.id)
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) {
          setMovimientos(res.data as MovimientoItem[]);
        } else {
          setMovimientos([]);
        }
      })
      .catch(() => {
        if (active) setMovimientos([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [insumo.id]);

  const stats = useMemo(() => {
    let totalEntradas = 0;
    let totalSalidas = 0;
    let totalAjustes = 0;

    movimientos.forEach((m) => {
      const cant = parseFloat(m.cantidad || "0");
      if (m.tipo === "entrada") totalEntradas += cant;
      else if (m.tipo === "salida") totalSalidas += cant;
      else if (m.tipo === "ajuste") totalAjustes++;
    });

    return { totalEntradas, totalSalidas, totalAjustes };
  }, [movimientos]);

  const filtered = useMemo(() => {
    if (tipoFiltro === "todos") return movimientos;
    return movimientos.filter((m) => m.tipo === tipoFiltro);
  }, [movimientos, tipoFiltro]);

  const currentStock = parseFloat(insumo.stock || "0");
  const unitCost = parseFloat(insumo.precioCompra || "0");
  const totalVal = currentStock * unitCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 md:p-6 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <History className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-foreground">{insumo.nombre}</h3>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-secondary/30 bg-secondary/10 text-secondary"
                >
                  Stock: {currentStock.toFixed(2)} {insumo.unidad || ""}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Kardex oficial: registro cronológico de compras, consumos por orden y ajustes.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Mini Resumen de Totales */}
        <div className="grid grid-cols-3 divide-x divide-border/60 bg-muted/20 border-b border-border shrink-0 text-center py-2.5 px-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">
              Entradas Totales
            </span>
            <span className="text-sm sm:text-base font-mono font-black text-foreground">
              +{stats.totalEntradas.toFixed(2)} {insumo.unidad || ""}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block">
              Salidas / Consumo
            </span>
            <span className="text-sm sm:text-base font-mono font-black text-foreground">
              -{stats.totalSalidas.toFixed(2)} {insumo.unidad || ""}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-secondary block">
              Valorizado Almacén
            </span>
            <span className="text-sm sm:text-base font-mono font-black text-foreground">
              {formatCurrency(totalVal)}
            </span>
          </div>
        </div>

        {/* Filtros de Tipo */}
        <div className="p-3 border-b border-border/60 flex items-center justify-between gap-2 shrink-0 bg-card">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setTipoFiltro("todos")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipoFiltro === "todos"
                  ? "bg-secondary text-secondary-foreground shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Todos ({movimientos.length})
            </button>
            <button
              type="button"
              onClick={() => setTipoFiltro("entrada")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipoFiltro === "entrada"
                  ? "bg-emerald-600 text-white shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Entradas
            </button>
            <button
              type="button"
              onClick={() => setTipoFiltro("salida")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipoFiltro === "salida"
                  ? "bg-rose-600 text-white shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Salidas
            </button>
            <button
              type="button"
              onClick={() => setTipoFiltro("ajuste")}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                tipoFiltro === "ajuste"
                  ? "bg-amber-600 text-white shadow-2xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              Ajustes
            </button>
          </div>

          <span className="text-[11px] text-muted-foreground font-mono">
            {filtered.length} registro(s)
          </span>
        </div>

        {/* Timeline / Lista de Movimientos */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 min-h-[240px]">
          {loading ? (
            <div className="h-48 flex flex-col items-center justify-center gap-3 text-muted-foreground">
              <RefreshCw className="size-6 animate-spin text-secondary" />
              <span className="text-xs font-medium">Cargando movimientos de Kardex...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="h-48 flex flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Layers className="size-8 opacity-40" />
              <p className="text-xs font-bold text-foreground">Sin movimientos registrados</p>
              <p className="text-[11px] max-w-xs text-muted-foreground">
                Las compras, consumos en órdenes de servicio y correcciones de stock aparecerán aquí en orden cronológico.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((mov) => {
                const isEntrada = mov.tipo === "entrada";
                const isSalida = mov.tipo === "salida";
                const dateObj = mov.createdAt ? new Date(mov.createdAt) : null;
                const formattedDate = dateObj
                  ? dateObj.toLocaleString("es-PE", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "—";

                return (
                  <div
                    key={mov.id}
                    className="p-3.5 rounded-xl border border-border/70 bg-card hover:bg-muted/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                          isEntrada
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                            : isSalida
                            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {isEntrada ? (
                          <ArrowUpCircle className="size-4" />
                        ) : isSalida ? (
                          <ArrowDownCircle className="size-4" />
                        ) : (
                          <Settings2 className="size-4" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                              isEntrada
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : isSalida
                                ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                                : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                            }`}
                          >
                            {mov.tipo}
                          </span>
                          <span className="text-xs font-bold text-foreground">
                            {mov.motivo || "Sin motivo especificado"}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 text-[11px] text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="size-3" />
                            {formattedDate}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="size-3" />
                            {mov.usuarioResponsable}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0 font-mono">
                      <span
                        className={`text-sm sm:text-base font-black ${
                          isEntrada
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isSalida
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        {isEntrada ? "+" : isSalida ? "-" : ""}
                        {parseFloat(mov.cantidad || "0").toFixed(2)}{" "}
                        <span className="text-xs font-normal text-muted-foreground font-sans">
                          {insumo.unidad || ""}
                        </span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 border-t border-border bg-muted/20 flex justify-end shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="rounded-xl border-border hover:bg-muted text-xs font-bold cursor-pointer h-9 px-4"
          >
            Cerrar Kardex
          </Button>
        </div>
      </div>
    </div>
  );
}
