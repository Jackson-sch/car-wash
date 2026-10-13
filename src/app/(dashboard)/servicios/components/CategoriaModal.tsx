"use client";

import { useState } from "react";
import { X, FolderPlus } from "lucide-react";
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
    await onSave(nuevaCatNombre.trim());
    setNuevaCatNombre("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 text-foreground">
        {/* Header con alto contraste */}
        <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/15 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-foreground">
                Nueva Categoría
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Organiza tus servicios por grupos o tipos de atención.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="catNombre" className="text-xs font-bold text-foreground flex items-center gap-1">
              Nombre de la Categoría <span className="text-rose-500 font-bold">*</span>
            </Label>
            <Input
              id="catNombre"
              placeholder="Ej. Lavado de Motor, Detallado, Encerado..."
              value={nuevaCatNombre}
              onChange={(e) => setNuevaCatNombre(e.target.value)}
              required
              autoFocus
              className="bg-background border-border hover:border-zinc-400 dark:hover:border-zinc-500 focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-foreground placeholder:text-muted-foreground text-sm h-10 rounded-xl font-medium transition-all"
            />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              Esta categoría aparecerá como pestaña y filtro en el catálogo de servicios y en el POS.
            </p>
          </div>

          {/* Footer de Acciones con botones de alto contraste */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold text-foreground border-border hover:bg-muted h-9 rounded-xl px-4 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || !nuevaCatNombre.trim()}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 rounded-xl px-5 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isPending ? "Creando..." : "Crear Categoría"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
