"use client";

import { useState } from "react";
import { X, FolderPlus, Edit3, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Categoria } from "./ServiciosGrid";

interface CategoriaModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPending: boolean;
  categorias: Categoria[];
  onSave: (nombre: string) => Promise<void>;
  onUpdate?: (id: string, nombre: string) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export function CategoriaModal({
  isOpen,
  onClose,
  isPending,
  categorias,
  onSave,
  onUpdate,
  onDelete,
}: CategoriaModalProps) {
  const [nuevaCatNombre, setNuevaCatNombre] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingNombre, setEditingNombre] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCatNombre.trim()) return;
    await onSave(nuevaCatNombre.trim());
    setNuevaCatNombre("");
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingNombre.trim() || !onUpdate) return;
    await onUpdate(id, editingNombre.trim());
    setEditingId(null);
    setEditingNombre("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 transition-opacity duration-200">
      <div className="bg-card border border-border w-full max-w-md rounded-2xl overflow-hidden shadow-2xl transition-transform duration-200 text-foreground">
        {/* Header */}
        <div className="p-5 border-b border-border bg-muted/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-secondary/15 text-secondary border border-secondary/20 flex items-center justify-center shrink-0">
              <FolderPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight text-foreground">
                Categorías de Servicio
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Crea, renombra o elimina las pestañas de tu catálogo.
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

        {/* Formulario Nueva Categoría */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3 border-b border-border/60">
          <Label htmlFor="catNombre" className="text-xs font-bold text-foreground flex items-center gap-1">
            Nueva Categoría <span className="text-rose-500 font-bold">*</span>
          </Label>
          <div className="flex gap-2">
            <Input
              id="catNombre"
              placeholder="Ej. Lavado de Motor, Detallado..."
              value={nuevaCatNombre}
              onChange={(e) => setNuevaCatNombre(e.target.value)}
              autoFocus
              className="bg-background border-border focus:border-secondary text-foreground placeholder:text-muted-foreground text-xs h-9 rounded-xl font-medium"
            />
            <Button
              type="submit"
              disabled={isPending || !nuevaCatNombre.trim()}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold text-xs h-9 rounded-xl px-4 shrink-0 cursor-pointer disabled:opacity-50"
            >
              Crear
            </Button>
          </div>
        </form>

        {/* Lista de Categorías Existentes */}
        <div className="p-5 space-y-2.5 max-h-64 overflow-y-auto">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            Categorías actuales ({categorias.length})
          </span>
          {categorias.length === 0 ? (
            <p className="text-xs text-muted-foreground py-3 text-center">
              Aún no hay categorías registradas.
            </p>
          ) : (
            <div className="space-y-1.5">
              {categorias.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-border/60 bg-muted/20"
                >
                  {editingId === cat.id ? (
                    <div className="flex items-center gap-1.5 flex-1">
                      <Input
                        value={editingNombre}
                        onChange={(e) => setEditingNombre(e.target.value)}
                        className="h-7 text-xs rounded-lg"
                        autoFocus
                      />
                      <Button
                        type="button"
                        size="icon-sm"
                        onClick={() => handleSaveEdit(cat.id)}
                        disabled={isPending}
                        className="h-7 w-7 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer"
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                        className="h-7 w-7 rounded-lg cursor-pointer"
                      >
                        <X className="size-3.5" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-foreground truncate">
                        {cat.nombre}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        {onUpdate && (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditingNombre(cat.nombre);
                            }}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground cursor-pointer"
                            title="Renombrar categoría"
                          >
                            <Edit3 className="size-3.5" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            disabled={isPending}
                            onClick={() => {
                              if (confirm(`¿Eliminar la categoría "${cat.nombre}"? Los servicios pasarán a "General".`)) {
                                onDelete(cat.id);
                              }
                            }}
                            className="h-7 w-7 rounded-lg text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 cursor-pointer"
                            title="Eliminar categoría"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-border bg-muted/20 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="text-xs font-bold h-8 rounded-xl px-4 cursor-pointer"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
