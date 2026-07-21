"use client";

import { useState } from "react";
import { AlertTriangle, Check, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-card border border-border w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <h3 className="text-sm font-bold text-foreground">Inspección de Daños & Recepción</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Selector de Tipo de Hallazgo */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Tipo de Marca a Añadir (Haz clic sobre el gráfico):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { id: "rayon", label: "⚡ Rayón / Guadaña", color: "border-amber-500 text-amber-500" },
                { id: "abolladura", label: "💥 Abolladura / Choque", color: "border-red-500 text-red-500" },
                { id: "rotura", label: "🔍 Vidrio / Espejo", color: "border-blue-500 text-blue-500" },
                { id: "pertenencia", label: "🎒 Pertenencia Dejada", color: "border-emerald-500 text-emerald-500" },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTipoSeleccionado(t.id as InspeccionPoint["tipo"])}
                  className={`py-1.5 px-2 text-[10px] font-bold rounded-lg border text-center transition-all cursor-pointer ${
                    tipoSeleccionado === t.id
                      ? `${t.color} bg-card shadow-sm font-black`
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gráfico Interactivo de Vehículo */}
          <div
            onClick={handleImageClick}
            className="relative w-full h-52 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-xl flex items-center justify-center cursor-crosshair overflow-hidden group select-none"
          >
            {/* Silueta vectorial esquemática del vehículo */}
            <div className="absolute inset-0 opacity-40 flex items-center justify-center p-6 pointer-events-none">
              <svg viewBox="0 0 400 160" className="w-full h-full stroke-zinc-400 fill-none stroke-[2]">
                <rect x="50" y="40" width="300" height="80" rx="20" />
                <path d="M 90 40 L 130 10 L 270 10 L 310 40 Z" />
                <circle cx="100" cy="120" r="18" className="fill-zinc-900 stroke-zinc-400" />
                <circle cx="300" cy="120" r="18" className="fill-zinc-900 stroke-zinc-400" />
              </svg>
            </div>

            <span className="text-[10px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors pointer-events-none">
              HAZ CLIC EN LA ZONA DEL VEHÍCULO PARA MARCAR UN DAÑO
            </span>

            {/* Puntos Marcados */}
            {puntos.map((p) => (
              <div
                key={p.id}
                style={{ left: `${p.x}%`, top: `${p.y}%` }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemovePoint(p.id);
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg cursor-pointer hover:scale-125 transition-transform ${
                  p.tipo === "rayon"
                    ? "bg-amber-500"
                    : p.tipo === "abolladura"
                    ? "bg-red-500"
                    : p.tipo === "rotura"
                    ? "bg-blue-500"
                    : "bg-emerald-500"
                }`}
                title={`Haz clic para eliminar (${p.zona})`}
              >
                !
              </div>
            ))}
          </div>

          {/* Resumen de Marcas */}
          {puntos.length > 0 && (
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase text-muted-foreground">
                Marcas Registradas ({puntos.length}):
              </span>
              <div className="flex flex-wrap gap-1.5">
                {puntos.map((p) => (
                  <span
                    key={p.id}
                    className="inline-flex items-center gap-1.5 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-[10px] font-bold"
                  >
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                    {p.zona} ({p.tipo})
                    <button onClick={() => handleRemovePoint(p.id)} className="text-zinc-400 hover:text-red-400">
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Observaciones Adicionales */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Observaciones del Estado del Vehículo
            </label>
            <Textarea
              placeholder="Ej. Tapa de combustible suelta, raspones preexistentes en aro delantero derecho, mochila en asiento posterior."
              value={notasGeneral}
              onChange={(e) => setNotasGeneral(e.target.value)}
              className="text-xs min-h-[70px] bg-background border-border"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-zinc-900/40 flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
            Cancelar
          </Button>
          <Button size="sm" onClick={handleConfirm} className="text-xs font-bold gap-1.5 bg-secondary text-secondary-foreground">
            <Check className="h-4 w-4" />
            Guardar Inspección
          </Button>
        </div>
      </div>
    </div>
  );
}
