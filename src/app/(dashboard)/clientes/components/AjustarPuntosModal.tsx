"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Cliente } from "./ClientesTable";

interface ClientePuntosTarget {
  id: string;
  nombre: string;
  apellido: string | null;
}

interface AjustarPuntosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: ClientePuntosTarget;
  isPending: boolean;
  onSave: (tipo: "ganado" | "canjeado" | "ajuste", puntos: number, descripcion: string) => Promise<void>;
}

export function AjustarPuntosModal({
  isOpen,
  onClose,
  cliente,
  isPending,
  onSave,
}: AjustarPuntosModalProps) {
  const [ajustePuntos, setAjustePuntos] = useState("");
  const [ajusteTipo, setAjusteTipo] = useState<"ganado" | "canjeado" | "ajuste">("ajuste");
  const [ajusteDesc, setAjusteDesc] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const valPuntos = parseInt(ajustePuntos) || 0;
    if (valPuntos <= 0) return;
    await onSave(ajusteTipo, valPuntos, ajusteDesc);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 text-foreground">
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30">
          <h4 className="text-sm font-extrabold text-foreground">Ajustar Puntos de Lealtad</h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs font-bold text-muted-foreground">
            Cliente: <span className="text-foreground font-extrabold">{cliente.nombre} {cliente.apellido || ""}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="ajTipo" className="text-[11px] font-bold text-muted-foreground">
                Tipo de Operación
              </Label>
              <Select
                value={ajusteTipo}
                onValueChange={(val: string | null) => val && setAjusteTipo(val as "ganado" | "canjeado" | "ajuste")}
              >
                <SelectTrigger id="ajTipo" className="w-full bg-background border-border text-foreground rounded-xl text-xs h-9 px-3">
                  <SelectValue placeholder="Tipo">
                    {ajusteTipo === "ganado" ? "Sumar (+)" : ajusteTipo === "canjeado" ? "Restar (-)" : "Ajuste"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full bg-popover text-popover-foreground border border-border">
                  <SelectItem value="ganado">Sumar (+)</SelectItem>
                  <SelectItem value="canjeado">Restar / Canje (-)</SelectItem>
                  <SelectItem value="ajuste">Ajuste de Auditoría</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ajPts" className="text-[11px] font-bold text-muted-foreground">
                Cantidad Puntos
              </Label>
              <Input
                id="ajPts"
                type="number"
                min="1"
                placeholder="100"
                value={ajustePuntos}
                onChange={(e) => setAjustePuntos(e.target.value)}
                required
                className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-xl text-foreground font-mono font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ajDesc" className="text-[11px] font-bold text-muted-foreground">
              Motivo o Detalle del Ajuste
            </Label>
            <Input
              id="ajDesc"
              placeholder="Ej. Campaña especial, fidelización..."
              value={ajusteDesc}
              onChange={(e) => setAjusteDesc(e.target.value)}
              className="bg-background border-border hover:border-zinc-400 focus:border-secondary text-xs h-9 rounded-xl text-foreground"
            />
          </div>

          <div className="flex justify-end gap-2.5 border-t border-border pt-4 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-muted-foreground hover:text-foreground h-9 px-3 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !ajustePuntos}
              className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold text-xs h-9 rounded-xl px-4 shadow-xs flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="size-3.5" />
              <span>{isPending ? "Guardando..." : "Guardar Puntos"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
