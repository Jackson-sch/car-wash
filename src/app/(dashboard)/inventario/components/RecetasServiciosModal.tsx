"use client";

import { useEffect, useState, useMemo } from "react";
import {
  X,
  FlaskConical,
  Plus,
  Trash2,
  Save,
  DollarSign,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getServiciosConRecetasAction,
  guardarRecetaServicioAction,
} from "@/lib/actions/inventario";
import { formatCurrency } from "@/lib/formats";
import { toast } from "sonner";
import type { Insumo } from "./InventarioTable";

interface RecetaItem {
  id?: string;
  itemId: string;
  itemNombre?: string;
  unidad?: string | null;
  costoUnitario?: string | null;
  cantidadConsumo: string;
}

interface ServicioConReceta {
  id: string;
  nombre: string;
  precio: string;
  duracionMin: number | null;
  recetas: RecetaItem[];
  costoInsumosTotal: number;
}

interface RecetasServiciosModalProps {
  isOpen: boolean;
  onClose: () => void;
  insumos: Insumo[];
}

export function RecetasServiciosModal(props: RecetasServiciosModalProps) {
  if (!props.isOpen) return null;
  return <RecetasServiciosContent key="open" {...props} />;
}

function RecetasServiciosContent({
  onClose,
  insumos,
}: RecetasServiciosModalProps) {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [servicios, setServicios] = useState<ServicioConReceta[]>([]);
  const [selectedServicioId, setSelectedServicioId] = useState<string>("");
  const [currentReceta, setCurrentReceta] = useState<RecetaItem[]>([]);
  const [searchServicio, setSearchServicio] = useState("");

  const loadServicios = () => {
    setLoading(true);
    getServiciosConRecetasAction()
      .then((res) => {
        if (res.success && res.data) {
          const list = res.data as ServicioConReceta[];
          setServicios(list);
          if (list.length > 0 && !selectedServicioId) {
            setSelectedServicioId(list[0].id);
            setCurrentReceta(list[0].recetas || []);
          }
        }
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error al cargar servicios con recetas");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    let active = true;
    getServiciosConRecetasAction()
      .then((res) => {
        if (!active) return;
        if (res.success && res.data) {
          const list = res.data as ServicioConReceta[];
          setServicios(list);
          if (list.length > 0) {
            setSelectedServicioId(list[0].id);
            setCurrentReceta(list[0].recetas || []);
          }
        }
      })
      .catch((err) => {
        if (!active) return;
        console.error(err);
        toast.error("Error al cargar servicios con recetas");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeServicio = useMemo(() => {
    return servicios.find((s) => s.id === selectedServicioId) || null;
  }, [servicios, selectedServicioId]);

  const handleSelectServicio = (srv: ServicioConReceta) => {
    setSelectedServicioId(srv.id);
    setCurrentReceta(srv.recetas || []);
  };

  const handleAddItem = () => {
    if (insumos.length === 0) {
      toast.warning("No hay insumos registrados en el catálogo.");
      return;
    }
    const defaultInsumo = insumos[0];
    setCurrentReceta((prev) => [
      ...prev,
      {
        itemId: defaultInsumo.id,
        itemNombre: defaultInsumo.nombre,
        unidad: defaultInsumo.unidad,
        costoUnitario: defaultInsumo.precioCompra,
        cantidadConsumo: "0.050",
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setCurrentReceta((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleInsumoChange = (index: number, itemId: string) => {
    const selected = insumos.find((i) => i.id === itemId);
    if (!selected) return;

    setCurrentReceta((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return {
          ...item,
          itemId: selected.id,
          itemNombre: selected.nombre,
          unidad: selected.unidad,
          costoUnitario: selected.precioCompra,
        };
      })
    );
  };

  const handleCantidadChange = (index: number, val: string) => {
    setCurrentReceta((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, cantidadConsumo: val } : item))
    );
  };

  // Cálculo de costo químico total de la receta
  const costoTotalReceta = useMemo(() => {
    return currentReceta.reduce((acc, curr) => {
      const insumo = insumos.find((i) => i.id === curr.itemId);
      const cant = parseFloat(curr.cantidadConsumo || "0");
      const costo = parseFloat(insumo?.precioCompra || curr.costoUnitario || "0");
      return acc + cant * costo;
    }, 0);
  }, [currentReceta, insumos]);

  const precioServicio = activeServicio ? parseFloat(activeServicio.precio || "0") : 0;
  const margenBruto = Math.max(0, precioServicio - costoTotalReceta);
  const porcentajeInsumos = precioServicio > 0 ? (costoTotalReceta / precioServicio) * 100 : 0;

  const handleSave = async () => {
    if (!selectedServicioId) return;

    setIsSaving(true);
    try {
      const payload = currentReceta.map((r) => ({
        itemId: r.itemId,
        cantidadConsumo: r.cantidadConsumo,
      }));

      const res = await guardarRecetaServicioAction(selectedServicioId, payload);
      if (res.success) {
        toast.success("Receta de consumo guardada correctamente");
        // Actualizar en el estado local
        setServicios((prev) =>
          prev.map((s) =>
            s.id === selectedServicioId
              ? { ...s, recetas: currentReceta, costoInsumosTotal: costoTotalReceta }
              : s
          )
        );
      } else {
        toast.error(res.error || "No se pudo guardar la receta");
      }
    } catch {
      toast.error("Ocurrió un error al guardar la receta");
    } finally {
      setIsSaving(false);
    }
  };

  const filteredServicios = servicios.filter((s) =>
    s.nombre.toLowerCase().includes(searchServicio.toLowerCase().trim())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4 md:p-6 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-4xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary shrink-0">
              <FlaskConical className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-foreground">
                  Recetas de Consumo de Insumos
                </h3>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold border-secondary/30 bg-secondary/10 text-secondary"
                >
                  Descuento Automático
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define la cantidad de insumos que consume cada servicio al completarse una orden.
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

        {/* Body Layout: 2 Columnas (Servicios a la izquierda, Editor a la derecha) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 divide-y md:divide-y-0 md:divide-x divide-border">
          {/* Columna Izquierda: Lista de Servicios */}
          <div className="w-full md:w-72 flex flex-col shrink-0 bg-card/60">
            <div className="p-3 border-b border-border/60">
              <Input
                placeholder="Buscar servicio..."
                value={searchServicio}
                onChange={(e) => setSearchServicio(e.target.value)}
                className="h-8.5 text-xs bg-background rounded-lg border-border"
              />
            </div>

            <div className="overflow-y-auto flex-1 divide-y divide-border/40 p-2 space-y-1">
              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <RefreshCw className="size-5 animate-spin text-secondary" />
                  <span className="text-xs">Cargando catálogo...</span>
                </div>
              ) : filteredServicios.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No se encontraron servicios.
                </div>
              ) : (
                filteredServicios.map((srv) => {
                  const isSelected = srv.id === selectedServicioId;
                  const cantItems = srv.recetas?.length || 0;

                  return (
                    <button
                      key={srv.id}
                      type="button"
                      onClick={() => handleSelectServicio(srv)}
                      className={`w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? "bg-secondary text-secondary-foreground shadow-xs font-bold"
                          : "hover:bg-muted/50 text-foreground"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="text-xs truncate font-bold">{srv.nombre}</p>
                        <p
                          className={`text-[10px] mt-0.5 ${
                            isSelected ? "text-secondary-foreground/80" : "text-muted-foreground"
                          }`}
                        >
                          {formatCurrency(parseFloat(srv.precio || "0"))} • {cantItems} insumo(s)
                        </p>
                      </div>

                      {cantItems > 0 && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full shrink-0 font-mono ${
                            isSelected
                              ? "bg-black/20 text-white font-bold"
                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          }`}
                        >
                          {formatCurrency(srv.costoInsumosTotal)}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Columna Derecha: Editor de Receta del Servicio Seleccionado */}
          <div className="flex-1 flex flex-col overflow-hidden bg-background">
            {activeServicio ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Cabecera del Servicio Activo */}
                <div className="p-4 sm:p-5 border-b border-border/60 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block">
                      Servicio Seleccionado
                    </span>
                    <h4 className="text-base font-extrabold text-foreground">
                      {activeServicio.nombre}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Tarifa de Venta:{" "}
                      <span className="font-mono font-bold text-foreground">
                        {formatCurrency(precioServicio)}
                      </span>
                    </p>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddItem}
                    className="h-8.5 rounded-xl border border-secondary/30 bg-secondary/10 hover:bg-secondary/20 text-secondary text-xs font-bold gap-1.5 self-start sm:self-auto cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                    <span>Agregar Insumo</span>
                  </Button>
                </div>

                {/* Lista / Tabla de Insumos de la Receta */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
                  {currentReceta.length === 0 ? (
                    <div className="py-14 text-center text-muted-foreground flex flex-col items-center justify-center gap-2 border border-dashed border-border rounded-2xl">
                      <Layers className="size-8 opacity-40 text-secondary" />
                      <p className="text-xs font-bold text-foreground">
                        Sin receta de insumos configurada
                      </p>
                      <p className="text-[11px] max-w-sm text-muted-foreground">
                        Haz clic en &ldquo;Agregar Insumo&rdquo; para indicar qué químicos (shampoo, cera, silicona, etc.) se consumen en este servicio.
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleAddItem}
                        className="mt-2 text-xs font-bold rounded-xl"
                      >
                        <Plus className="size-3.5 mr-1" />
                        Configurar Primer Insumo
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-2">
                        <div className="col-span-6">Insumo Químico</div>
                        <div className="col-span-3 text-center">Consumo por Orden</div>
                        <div className="col-span-2 text-right">Costo Est.</div>
                        <div className="col-span-1"></div>
                      </div>

                      {currentReceta.map((item, idx) => {
                        const insumoRef = insumos.find((i) => i.id === item.itemId);
                        const costoUnit = parseFloat(
                          insumoRef?.precioCompra || item.costoUnitario || "0"
                        );
                        const cant = parseFloat(item.cantidadConsumo || "0");
                        const itemSubtotal = cant * costoUnit;

                        return (
                          <div
                            key={idx}
                            className="grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl bg-card border border-border/70 hover:border-border transition-colors shadow-2xs"
                          >
                            {/* Selector de Insumo */}
                            <div className="col-span-6">
                              <Select
                                items={insumos.map((i) => ({ value: i.id, label: i.nombre }))}
                                value={item.itemId}
                                onValueChange={(val: string | null) => {
                                  if (val) handleInsumoChange(idx, val);
                                }}
                              >
                                <SelectTrigger className="w-full h-9 rounded-lg border-border text-xs bg-background">
                                  <SelectValue placeholder="Seleccionar insumo...">
                                    {(val) => {
                                      const found = insumos.find((i) => i.id === val);
                                      return found?.nombre || insumoRef?.nombre || item.itemNombre || "Seleccionar...";
                                    }}
                                  </SelectValue>
                                </SelectTrigger>
                                <SelectContent className="max-h-56 bg-card border-border">
                                  {insumos.map((ins) => (
                                    <SelectItem key={ins.id} value={ins.id} label={ins.nombre}>
                                      <div className="flex items-center justify-between gap-3 w-full">
                                        <span className="font-medium">{ins.nombre}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono shrink-0">
                                          Stock: {parseFloat(ins.stock || "0").toFixed(1)} {ins.unidad}
                                        </span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            {/* Input de Cantidad */}
                            <div className="col-span-3 flex items-center gap-1.5">
                              <Input
                                type="number"
                                step="0.001"
                                min="0.001"
                                value={item.cantidadConsumo}
                                onChange={(e) => handleCantidadChange(idx, e.target.value)}
                                className="h-9 text-xs font-mono font-bold text-center bg-background rounded-lg border-border"
                              />
                              <span className="text-[11px] text-muted-foreground font-medium shrink-0">
                                {insumoRef?.unidad || item.unidad || ""}
                              </span>
                            </div>

                            {/* Costo Calculado */}
                            <div className="col-span-2 text-right font-mono font-bold text-xs text-foreground">
                              {formatCurrency(itemSubtotal)}
                            </div>

                            {/* Quitar Ítem */}
                            <div className="col-span-1 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(idx)}
                                className="size-7 rounded-lg text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 flex items-center justify-center transition-colors cursor-pointer"
                                title="Eliminar insumo de la receta"
                              >
                                <Trash2 className="size-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Resumen de Margen & Costo Químico */}
                  {currentReceta.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-secondary/5 border border-secondary/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-secondary/15 text-secondary flex items-center justify-center shrink-0">
                          <DollarSign className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            Costo de Insumos:{" "}
                            <span className="font-mono text-secondary font-black">
                              {formatCurrency(costoTotalReceta)}
                            </span>
                            <span className="text-[11px] text-muted-foreground ml-1.5 font-normal">
                              ({porcentajeInsumos.toFixed(1)}% del precio del servicio)
                            </span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Margen bruto estimado por servicio:{" "}
                            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(margenBruto)}
                            </span>
                          </p>
                        </div>
                      </div>

                      <div className="text-[11px] text-muted-foreground flex items-center gap-1.5 bg-card/60 px-2.5 py-1 rounded-lg border border-border/50 shrink-0">
                        <Info className="size-3.5 text-secondary shrink-0" />
                        <span>Descuento automático en Kardex al completar</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer del Editor */}
                <div className="p-4 border-t border-border bg-muted/20 flex items-center justify-between gap-3 shrink-0">
                  <span className="text-xs text-muted-foreground font-medium">
                    {currentReceta.length} insumo(s) en esta receta
                  </span>

                  <Button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-xl bg-secondary hover:bg-secondary/90 text-secondary-foreground text-xs font-bold h-9 px-5 gap-2 cursor-pointer shadow-xs"
                  >
                    <Save className="size-4" />
                    <span>{isSaving ? "Guardando..." : "Guardar Receta"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <Sparkles className="size-8 opacity-40 mb-2" />
                <p className="text-sm font-bold text-foreground">Selecciona un servicio</p>
                <p className="text-xs text-muted-foreground">
                  Elige un servicio de la columna izquierda para configurar su receta de consumo.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
