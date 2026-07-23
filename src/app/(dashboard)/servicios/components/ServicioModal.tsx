"use client";

import { useReducer } from "react";
import { X, Plus } from "lucide-react";
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
import type { Servicio, Categoria } from "./ServiciosGrid";

const VEHICULO_OPCIONES = [
  { id: "sedan", label: "Sedán" },
  { id: "suv", label: "SUV" },
  { id: "pickup", label: "Pick-up" },
  { id: "moto", label: "Moto" },
  { id: "camion", label: "Camión" },
  { id: "furgon", label: "Furgón" },
  { id: "otro", label: "Otro" },
];

interface ServicioModalProps {
  isOpen: boolean;
  onClose: () => void;
  servicio: Servicio | null;
  categorias: Categoria[];
  isPending: boolean;
  onSave: (data: {
    nombre: string;
    descripcion: string;
    precio: string;
    duracionMin: string;
    categoriaId: string;
    aplicaA: string[];
  }) => Promise<void>;
  onOpenNewCategoria: () => void;
}

interface ServicioFormState {
  nombre: string;
  descripcion: string;
  precio: string;
  duracionMin: string;
  categoriaId: string;
  aplicaA: string[];
}

type ServicioAction =
  | { type: "SET_FIELD"; field: keyof ServicioFormState; value: unknown }
  | { type: "TOGGLE_VEHICULO"; id: string }
  | { type: "RESET"; categoriaDefault?: string };

const INITIAL_SERVICIO: ServicioFormState = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracionMin: "30",
  categoriaId: "",
  aplicaA: ["sedan", "suv"],
};

function servReducer(state: ServicioFormState, action: ServicioAction): ServicioFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_VEHICULO":
      return {
        ...state,
        aplicaA: state.aplicaA.includes(action.id)
          ? state.aplicaA.filter((item) => item !== action.id)
          : [...state.aplicaA, action.id],
      };
    case "RESET":
      return { ...INITIAL_SERVICIO, categoriaId: action.categoriaDefault || "" };
    default:
      return state;
  }
}

export function ServicioModal(props: ServicioModalProps) {
  const { isOpen, servicio } = props;
  if (!isOpen) return null;

  // key={servicio?.id || 'nuevo'} fuerza remonte con estado fresco
  return (
    <ServicioFormContent
      key={servicio?.id || "nuevo"}
      isOpen={props.isOpen}
      onClose={props.onClose}
      servicio={servicio}
      categorias={props.categorias}
      isPending={props.isPending}
      onSave={props.onSave}
      onOpenNewCategoria={props.onOpenNewCategoria}
    />
  );
}

function ServicioFormContent({
  isOpen,
  onClose,
  servicio,
  categorias,
  isPending,
  onSave,
  onOpenNewCategoria,
}: ServicioModalProps) {
  const initial = servicio
    ? {
        nombre: servicio.nombre,
        descripcion: servicio.descripcion || "",
        precio: servicio.precio,
        duracionMin: servicio.duracionMin?.toString() || "30",
        categoriaId: servicio.categoriaId || categorias[0]?.id || "",
        aplicaA: servicio.aplicaA || ["sedan", "suv"],
      }
    : { ...INITIAL_SERVICIO, categoriaId: categorias[0]?.id || "" };

  const [form, dispatch] = useReducer(servReducer, initial);

  const { nombre, descripcion, precio, duracionMin, categoriaId, aplicaA } = form;
  const sf = (field: keyof ServicioFormState, value: unknown) => dispatch({ type: "SET_FIELD", field, value });
  const toggleVehiculo = (id: string) => dispatch({ type: "TOGGLE_VEHICULO", id });

  if (!isOpen) return null;

  const handleVehiculoToggle = (id: string) => {
    toggleVehiculo(id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !precio.trim()) return;
    await onSave({
      nombre,
      descripcion,
      precio,
      duracionMin,
      categoriaId,
      aplicaA,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity duration-200 p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-xl overflow-hidden shadow-2xl transition-transform duration-200 text-foreground">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              {servicio ? "Editar Servicio" : "Agregar Nuevo Servicio"}
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Completa los detalles del servicio a ofrecer.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 flex items-center justify-center transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre" className="text-xs font-bold text-zinc-650">
              Nombre del Servicio *
            </Label>
            <Input
              id="nombre"
              placeholder="Ej. Lavado Premium, Detallado de Motor..."
              value={nombre}
              onChange={(e) => sf("nombre", e.target.value)}
              required
              className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precio" className="text-xs font-bold text-zinc-650">
                Precio (S/) *
              </Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={precio}
                onChange={(e) => sf("precio", e.target.value)}
                required
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracion" className="text-xs font-bold text-zinc-650">
                Duración (minutos)
              </Label>
              <Input
                id="duracion"
                type="number"
                placeholder="30"
                value={duracionMin}
                onChange={(e) => sf("duracionMin", e.target.value)}
                className="bg-card border-zinc-300 focus:border-secondary text-xs h-9 rounded-lg text-zinc-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="categoria" className="text-xs font-bold text-zinc-650">
                Categoría
              </Label>
              <button
                type="button"
                onClick={onOpenNewCategoria}
                className="text-[10px] text-secondary hover:text-[#004c6e] font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" />
                Nueva Categoría
              </button>
            </div>
            <Select
              value={categoriaId || "unassigned"}
              onValueChange={(val: string | null) => sf("categoriaId", !val || val === "unassigned" ? "" : val)}
            >
              <SelectTrigger id="categoria" className="w-full bg-card border-border text-foreground rounded-lg text-xs h-9 px-3">
                <SelectValue placeholder="Selecciona una categoría">
                  {(val) => {
                    if (!val || val === "unassigned") return "Selecciona una categoría";
                    const cat = categorias.find((c) => c.id === val);
                    return cat ? cat.nombre : val;
                  }}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="w-full bg-card text-card-foreground border border-border">
                <SelectItem value="unassigned">Selecciona una categoría</SelectItem>
                {categorias.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion" className="text-xs font-bold text-zinc-650">
              Descripción / Detalles
            </Label>
            <textarea
              id="descripcion"
              placeholder="Describe las tareas incluidas en el servicio..."
              value={descripcion}
              onChange={(e) => sf("descripcion", e.target.value)}
              rows={3}
              className="w-full bg-card border border-zinc-300 focus:border-secondary rounded-lg text-xs p-3 text-zinc-800 outline-none resize-none"
            />
          </div>

          {/* Compatible Vehicles Checklist */}
          <div className="space-y-2">
            <Label className="text-xs font-bold text-zinc-650">
              Tipos de Vehículos Compatibles
            </Label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 bg-zinc-50 p-3 rounded-lg border border-zinc-200">
              {VEHICULO_OPCIONES.map((v) => (
                <label
                  key={v.id}
                  className="flex items-center gap-2 text-[10px] text-zinc-700 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={aplicaA.includes(v.id)}
                    onChange={() => handleVehiculoToggle(v.id)}
                    className="rounded border-zinc-300 text-secondary focus:ring-0 h-3.5 w-3.5 bg-card"
                  />
                  <span>{v.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-zinc-200 pt-4 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-zinc-550 hover:text-zinc-800"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="font-bold text-xs h-9 rounded-lg px-5 shadow-sm cursor-pointer"
            >
              {isPending ? "Guardando..." : "Guardar Servicio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
