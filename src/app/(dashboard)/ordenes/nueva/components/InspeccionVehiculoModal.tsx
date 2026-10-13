"use client";

import { useState } from "react";
import { AlertTriangle, Check, ShieldAlert, X, Zap, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CarDiagramSVG } from "@/components/shared/CarDiagramSVG";

interface InspeccionPoint {
  id: number;
  x: number;
  y: number;
  zona: string;
  tipo: "rayon" | "abolladura" | "rotura" | "pertenencia";
  nota: string;
}

interface InspeccionVehiculoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (inspeccion: { puntos: InspeccionPoint[]; notasGeneral: string }) => void;
  initialNotas?: string;
}

export function InspeccionVehiculoModal({
  isOpen,
  onClose,
  onSave,
  initialNotas = "",
}: InspeccionVehiculoModalProps) {
  const [puntos, setPuntos] = useState<InspeccionPoint[]>([]);
  const [notasGeneral, setNotasGeneral] = useState(initialNotas);
  const [tipoSeleccionado, setTipoSeleccionado] = useState<InspeccionPoint["tipo"]>("rayon");

  if (!isOpen) return null;

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    const nuevoPunto: InspeccionPoint = {
      id: Date.now(),
      x,
      y,
      zona: x < 35 ? "Frente / Capó" : x > 65 ? "Maletera / Posterior" : "Lateral / Techo",
      tipo: tipoSeleccionado,
      nota: "",
    };

    setPuntos([...puntos, nuevoPunto]);
  };

  const handleRemovePoint = (id: number) => {
    setPuntos(puntos.filter((p) => p.id !== id));
  };

  const handleConfirm = () => {
    onSave({ puntos, notasGeneral });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground">
                Inspección de Daños & Recepción
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Marca raspones, abolladuras o pertenencias sobre el diagrama digital del vehículo.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body en 2 Columnas */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
            {/* Columna Izquierda (lg:col-span-7): Herramientas de marca y Diagrama CAD */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center justify-between">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  1. Selecciona el Tipo de Hallazgo:
                </span>
                <span className="text-[10px] text-muted-foreground font-medium">
                  Luego haz clic sobre el gráfico
                </span>
              </div>

              {/* Botones selectores de marca */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "rayon", label: "Rayón", icon: Zap, color: "border-amber-500 text-amber-500 bg-amber-500/10" },
                  { id: "abolladura", label: "Abolladura", icon: AlertTriangle, color: "border-red-500 text-red-500 bg-red-500/10" },
                  { id: "rotura", label: "Vidrio / Foco", icon: Search, color: "border-blue-500 text-blue-500 bg-blue-500/10" },
                  { id: "pertenencia", label: "Pertenencia", icon: Package, color: "border-emerald-500 text-emerald-500 bg-emerald-500/10" },
                ].map((t) => {
                  const IconComp = t.icon;
                  const isSelected = tipoSeleccionado === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setTipoSeleccionado(t.id as InspeccionPoint["tipo"])}
                      className={`h-9 px-2.5 text-xs font-bold rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected
                          ? `${t.color} font-black shadow-xs ring-1 ring-current`
                          : "border-border text-muted-foreground hover:text-foreground bg-card"
                      }`}
                    >
                      <IconComp className="h-3.5 w-3.5" />
                      {t.label}
                    </button>
                  );
                })}
              </div>

              {/* Gráfico Interactivo de Vehículo (Plano Vectorial Blueprint CAD) */}
              <div
                role="button"
                tabIndex={0}
                onClick={handleImageClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleImageClick(e as any);
                  }
                }}
                className="relative w-full h-[310px] sm:h-[330px] bg-slate-950 border-2 border-dashed border-sky-800/80 rounded-2xl flex items-center justify-center cursor-crosshair overflow-hidden group select-none shadow-xl"
              >
                {/* Componente SVG de Blueprint de Vehículo */}
                <div className="absolute inset-0 p-2 flex items-center justify-center pointer-events-none">
                  <CarDiagramSVG />
                </div>

                {/* Puntos marcados */}
                {puntos.map((p) => (
                  <div
                    key={p.id}
                    style={{ left: `${p.x}%`, top: `${p.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg animate-bounce ${
                      p.tipo === "rayon"
                        ? "bg-amber-500"
                        : p.tipo === "abolladura"
                        ? "bg-red-500"
                        : p.tipo === "rotura"
                        ? "bg-blue-500"
                        : "bg-emerald-500"
                    }`}
                  >
                    !
                  </div>
                ))}

                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-zinc-950/85 px-3 py-1 rounded-full border border-zinc-800 pointer-events-none">
                  Haz clic en el vehículo para registrar un daño
                </span>
              </div>
            </div>

            {/* Columna Derecha (lg:col-span-5): Lista de hallazgos y notas */}
            <div className="lg:col-span-5 space-y-4">
              {/* Marcas Registradas */}
              <div className="space-y-2 p-4 rounded-2xl bg-muted/20 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-foreground">
                    Marcas Registradas ({puntos.length})
                  </span>
                  {puntos.length > 0 && (
                    <span className="text-[10px] font-bold text-amber-500">
                      Preexistentes
                    </span>
                  )}
                </div>

                {puntos.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-3 italic text-center">
                    Sin marcas registradas. El vehículo se recibirá sin daños señalados.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                    {puntos.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-card border border-border shadow-xs"
                      >
                        <span className="capitalize">{p.zona}</span>
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">
                          ({p.tipo})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemovePoint(p.id)}
                          aria-label={`Eliminar marca en ${p.zona}`}
                          className="text-muted-foreground hover:text-red-500 ml-0.5 cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Observaciones Adicionales */}
              <div className="space-y-1.5">
                <label
                  htmlFor="observaciones-vehiculo"
                  className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block"
                >
                  Observaciones Detalladas
                </label>
                <Textarea
                  id="observaciones-vehiculo"
                  placeholder="Ej. Tapa de combustible suelta, raspones preexistentes en aro delantero derecho, mochila en asiento posterior."
                  value={notasGeneral}
                  onChange={(e) => setNotasGeneral(e.target.value)}
                  className="text-xs min-h-[110px] bg-card border-border rounded-xl resize-none"
                />
              </div>

              {/* Nota de garantía legal */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed font-medium">
                🛡️ Esta inspección respalda la entrega del vehículo ante reclamos por daños preexistentes o pérdidas de objetos.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:px-6 border-t border-border bg-muted/30 flex justify-end gap-2.5 shrink-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="h-10 px-5 rounded-xl text-xs font-bold border-border cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            className="h-10 px-6 rounded-xl text-xs font-extrabold gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-md cursor-pointer"
          >
            <Check className="h-4 w-4" />
            Guardar Inspección ({puntos.length} marcas)
          </Button>
        </div>
      </div>
    </div>
  );
}
