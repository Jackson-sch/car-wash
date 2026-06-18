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
import { Cliente } from "./ClientesTable";

interface AjustarPuntosModalProps {
  isOpen: boolean;
  onClose: () => void;
  cliente: Cliente;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <h4 className="text-sm font-bold text-zinc-900">Ajustar Puntos Lealtad</h4>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 text-zinc-500 hover:text-zinc-900 flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="text-xs font-bold text-zinc-650">
            Cliente: <span className="text-zinc-900">{cliente.nombre} {cliente.apellido || ""}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ajTipo" className="text-[10px] font-bold text-zinc-650">
                Tipo de Operación
              </Label>
              <Select
                value={ajusteTipo}
                onValueChange={(val: string | null) => val && setAjusteTipo(val as any)}
              >
                <SelectTrigger id="ajTipo" className="w-full bg-card border-border text-foreground rounded-lg text-xs h-8 px-2">
                  <SelectValue>
                    {(val) => {
                      const map: Record<string, string> = {
                        ganado: "Sumar (+)",
                        canjeado: "Restar / Canje (-)",
                        ajuste: "Ajuste de Auditoría",
                      };
                      return map[val] || val;
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="w-full bg-card text-card-foreground border border-border">
                  <SelectItem value="ganado">Sumar (+)</SelectItem>
                  <SelectItem value="canjeado">Restar / Canje (-)</SelectItem>
                  <SelectItem value="ajuste">Ajuste de Auditoría</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ajPts" className="text-[10px] font-bold text-zinc-650">
                Cantidad de Puntos
              </Label>
              <Input
                id="ajPts"
                type="number"
                min="1"
                placeholder="100"
                value={ajustePuntos}
                onChange={(e) => setAjustePuntos(e.target.value)}
                required
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-8 rounded-lg text-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ajDesc" className="text-[10px] font-bold text-zinc-650">
              Motivo o Detalle de Ajuste
            </Label>
            <Input
              id="ajDesc"
              placeholder="Ej. Campaña especial, corrección..."
              value={ajusteDesc}
              onChange={(e) => setAjusteDesc(e.target.value)}
              className="bg-card border-zinc-300 focus:border-secondary text-xs h-8 rounded-lg text-zinc-900"
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-zinc-200 pt-3 mt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-[10px] font-bold text-zinc-500 hover:text-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !ajustePuntos}
              className="font-bold text-[10px] h-8 rounded-lg px-4 shadow-sm flex items-center gap-1 cursor-pointer"
            >
              <Save className="h-3 w-3" />
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
