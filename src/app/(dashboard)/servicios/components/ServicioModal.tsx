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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 p-3 sm:p-4 md:p-6">
      <div className="bg-card border border-border w-full max-w-3xl rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] text-foreground">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between bg-muted/30 shrink-0">
          <div>
            <h3 className="text-base font-bold text-foreground">
              {servicio ? "Editar Servicio" : "Agregar Nuevo Servicio"}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Configura los detalles del servicio y los tipos de vehículos admitidos.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          <div className="overflow-y-auto p-5 sm:p-6 flex-1 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Columna 1: Información básica del servicio */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="nombre" className="text-xs font-bold text-muted-foreground">
                    Nombre del Servicio *
                  </Label>
                  <Input
                    id="nombre"
                    placeholder="Ej. Lavado Premium, Detallado de Motor..."
                    value={nombre}
                    onChange={(e) => sf("nombre", e.target.value)}
                    required
                    className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="categoria" className="text-xs font-bold text-muted-foreground">
                      Categoría
                    </Label>
                    <button
                      type="button"
                      onClick={onOpenNewCategoria}
                      className="text-[11px] text-secondary hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="h-3 w-3" />
                      Nueva Categoría
                    </button>
                  </div>
                  <Select
                    value={categoriaId || "unassigned"}
                    onValueChange={(val: string | null) => sf("categoriaId", !val || val === "unassigned" ? "" : val)}
                  >
                    <SelectTrigger id="categoria" className="w-full bg-background border-border text-foreground rounded-lg text-xs h-9.5 px-3">
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

                <div className="grid grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <Label htmlFor="precio" className="text-xs font-bold text-muted-foreground">
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
                      className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground font-semibold"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="duracion" className="text-xs font-bold text-muted-foreground">
                      Duración (min)
                    </Label>
                    <Input
                      id="duracion"
                      type="number"
                      placeholder="30"
                      value={duracionMin}
                      onChange={(e) => sf("duracionMin", e.target.value)}
                      className="bg-background border-border focus:border-secondary text-xs h-9.5 rounded-lg text-foreground font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="descripcion" className="text-xs font-bold text-muted-foreground">
                    Descripción / Detalles
                  </Label>
                  <textarea
                    id="descripcion"
                    placeholder="Describe las tareas incluidas en el servicio..."
                    value={descripcion}
                    onChange={(e) => sf("descripcion", e.target.value)}
                    rows={3}
                    className="w-full bg-background border border-border focus:border-secondary rounded-lg text-xs p-3 text-foreground outline-none resize-none"
                  />
                </div>
              </div>

              {/* Columna 2: Vehículos Compatibles */}
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-muted-foreground">
                    Tipos de Vehículos Compatibles
                  </Label>
                  <span className="text-[11px] font-semibold text-secondary">
                    {aplicaA.length} seleccionado{aplicaA.length === 1 ? "" : "s"}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Indica qué tipos de carrocería pueden recibir este servicio en el punto de venta.
                </p>

                <div className="grid grid-cols-2 gap-2.5 bg-muted/20 p-3.5 rounded-xl border border-border flex-1 content-start">
                  {VEHICULO_OPCIONES.map((v) => {
                    const isSelected = aplicaA.includes(v.id);
                    return (
                      <label
                        key={v.id}
                        className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer select-none transition-colors ${
                          isSelected
                            ? "bg-secondary/10 border-secondary/40 text-foreground font-semibold"
                            : "bg-background border-border/70 text-muted-foreground hover:border-border hover:text-foreground"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleVehiculoToggle(v.id)}
                          className="rounded border-border text-secondary focus:ring-0 h-4 w-4 bg-background cursor-pointer"
                        />
                        <span>{v.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Actions Footer */}
          <div className="p-4 sm:px-6 border-t border-border bg-muted/30 flex items-center justify-end gap-3 shrink-0">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="font-bold text-xs h-9 rounded-lg px-6 shadow-sm cursor-pointer"
            >
              {isPending ? "Guardando..." : "Guardar Servicio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
