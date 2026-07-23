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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Inspección de Daños & Recepción</h3>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar modal" className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Selector de Tipo de Hallazgo */}
          <div className="space-y-1.5">
            <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tipo de Marca a Añadir (Haz clic sobre el gráfico):
            </span>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "rayon", label: "Rayón / Guadaña", icon: Zap, color: "border-amber-500 text-amber-500" },
                { id: "abolladura", label: "Abolladura", icon: AlertTriangle, color: "border-red-500 text-red-500" },
                { id: "rotura", label: "Vidrio / Espejo", icon: Search, color: "border-blue-500 text-blue-500" },
                { id: "pertenencia", label: "Pertenencia", icon: Package, color: "border-emerald-500 text-emerald-500" },
              ].map((t) => {
                const IconComp = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTipoSeleccionado(t.id as InspeccionPoint["tipo"])}
                    className={`h-10 px-3 text-xs font-bold rounded-lg border text-center transition-colors cursor-pointer flex items-center justify-center gap-2 ${
                      tipoSeleccionado === t.id
                        ? `${t.color} bg-card shadow-sm font-black`
                        : "border-border text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <IconComp className="h-4 w-4" />
                    {t.label}
                  </button>
                );
              })}
            </div>
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
            className="relative w-full h-80 min-h-[300px] bg-slate-950 border-2 border-dashed border-sky-800/80 rounded-2xl flex items-center justify-center cursor-crosshair overflow-hidden group select-none shadow-2xl"
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

            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-950/80 px-3 py-1 rounded-full border border-zinc-800 pointer-events-none">
              Haz clic en la zona del vehículo para marcar un daño
            </span>
          </div>

          {/* Lista de Puntos Registrados */}
          {puntos.length > 0 && (
            <div className="space-y-1.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Marcas Registradas ({puntos.length}):
              </span>
              <div className="flex flex-wrap gap-2">
                {puntos.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-muted border border-border"
                  >
                    <span>{p.zona}</span>
                    <span className="text-muted-foreground">({p.tipo})</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePoint(p.id)}
                      aria-label={`Eliminar marca en ${p.zona}`}
                      className="text-muted-foreground hover:text-red-400 ml-1"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones Adicionales */}
          <div className="space-y-1.5">
            <label htmlFor="observaciones-vehiculo" className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Observaciones del Estado del Vehículo
            </label>
            <Textarea
              id="observaciones-vehiculo"
              placeholder="Ej. Tapa de combustible suelta, raspones preexistentes en aro delantero derecho, mochila en asiento posterior."
              value={notasGeneral}
              onChange={(e) => setNotasGeneral(e.target.value)}
              className="text-xs min-h-[70px] bg-background border-border"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-zinc-900/40 flex justify-end gap-2.5">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 px-5 rounded-lg text-xs font-bold border-border cursor-pointer">
            Cancelar
          </Button>
          <Button type="button" onClick={handleConfirm} className="h-10 px-5 rounded-lg text-xs font-bold gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground shadow-sm cursor-pointer">
            <Check className="h-4 w-4" />
            Guardar Inspección
          </Button>
        </div>
      </div>
    </div>
  );
}
