"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  onSave: (nombre: string) => Promise<void>;
}

export function CategoriaModal({
  isOpen,
  onClose,
  isPending,
  onSave,
}: CategoriaModalProps) {
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) return;
    await onSave(nuevaCatNombre);
    setNuevaCatNombre("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-card border border-border w-full max-w-sm rounded-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 text-foreground">
        <div className="p-5 border-b border-zinc-200 flex items-center justify-between">
          <h4 className="text-sm font-bold text-zinc-900">Nueva Categoría</h4>
          <button
            type="button"
            onClick={onClose}
            className="h-6 w-6 rounded-lg text-zinc-500 hover:text-zinc-800 flex items-center justify-center"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="catNombre" className="text-xs font-bold text-zinc-650">
              Nombre de Categoría *
            </Label>
            <Input
              id="catNombre"
              placeholder="Ej. Lavado de Motor, Detallado..."
              value={nuevaCatNombre}
              onChange={(e) => setNuevaCatNombre(e.target.value)}
              required
              className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
            />
          </div>
          <div className="flex justify-end gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-zinc-500 h-8 hover:text-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !nuevaCatNombre}
              className="bg-black hover:bg-zinc-800 text-white font-bold text-xs h-8 rounded-lg px-4 cursor-pointer"
            >
              {isPending ? "Creando..." : "Crear"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
