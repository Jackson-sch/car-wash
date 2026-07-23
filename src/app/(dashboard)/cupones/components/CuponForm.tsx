"use client";

import { useReducer, useTransition, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  RefreshCw,
  Calendar as CalendarIcon,
  Save,
  Scissors,
  CheckCircle2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { CuponData } from "@/lib/actions/cupones";
import { createCupon, updateCupon } from "@/lib/actions/cupones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface ServicioType {
  id: string;
  nombre: string;
  descripcion: string | null;
  categoriaNombre: string | null;
}

interface CuponFormProps {
  servicios: ServicioType[];
  editingCupon?: EditingCupon | null;
  onCancelEdit?: () => void;
}

interface EditingCupon extends Omit<CuponData, "servicios"> {
  id: string;
  codigo: string;
  servicios?: { servicioId?: string | null; servicio?: { id: string } | null }[];
}

interface CuponFormState {
  codigo: string;
  tipoDescuento: "porcentaje" | "fijo";
  valorDescuento: string;
  compraMinima: string;
  fechaInicio: Date | undefined;
  fechaFin: Date | undefined;
  limiteTotal: string;
  limitePorCliente: string;
  serviciosSeleccionados: string[];
}

type Action =
  | { type: "SET_FIELD"; field: keyof CuponFormState; value: unknown }
  | { type: "TOGGLE_SERVICIO"; id: string }
  | { type: "RESET" };

const INITIAL_FORM: CuponFormState = {
  codigo: "",
  tipoDescuento: "porcentaje",
  valorDescuento: "",
  compraMinima: "",
  fechaInicio: undefined,
  fechaFin: undefined,
  limiteTotal: "",
  limitePorCliente: "1",
  serviciosSeleccionados: [],
};

function formReducer(state: CuponFormState, action: Action): CuponFormState {
  switch (action.type) {
    case "SET_FIELD":
      return { ...state, [action.field]: action.value };
    case "TOGGLE_SERVICIO":
      return {
        ...state,
        serviciosSeleccionados: state.serviciosSeleccionados.includes(action.id)
          ? state.serviciosSeleccionados.filter((sId) => sId !== action.id)
          : [...state.serviciosSeleccionados, action.id],
      };
    case "RESET":
      return { ...INITIAL_FORM };
    default:
      return state;
  }
}

function editingToState(cupon: EditingCupon): CuponFormState {
  return {
    codigo: cupon.codigo || "",
    tipoDescuento: cupon.tipoDescuento || "porcentaje",
    valorDescuento: cupon.valorDescuento?.toString() || "",
    compraMinima: cupon.compraMinima?.toString() || "",
    fechaInicio: cupon.fechaInicio ? new Date(cupon.fechaInicio) : undefined,
    fechaFin: cupon.fechaFin ? new Date(cupon.fechaFin) : undefined,
    limiteTotal: cupon.limiteTotal?.toString() || "",
    limitePorCliente: cupon.limitePorCliente?.toString() || "1",
    serviciosSeleccionados:
      cupon.servicios
        ?.map((s) => s.servicioId || s.servicio?.id)
        .filter((id): id is string => Boolean(id)) || [],
  };
}

export function CuponForm({ servicios, editingCupon, onCancelEdit }: CuponFormProps) {
  // key={editingCupon?.id || 'nuevo'} fuerza remonte con estado fresco
  return <CuponFormContent key={editingCupon?.id || "nuevo"} servicios={servicios} editingCupon={editingCupon} onCancelEdit={onCancelEdit} />;
}

function CuponFormContent({ servicios, editingCupon, onCancelEdit }: CuponFormProps) {
  const [isPending, startTransition] = useTransition();
  const initialForm = editingCupon ? editingToState(editingCupon) : { ...INITIAL_FORM };
  const [form, dispatch] = useReducer(formReducer, initialForm);

  const { codigo, tipoDescuento, valorDescuento, compraMinima, fechaInicio, fechaFin, limiteTotal, limitePorCliente, serviciosSeleccionados } = form;
  const selectedServiciosSet = useMemo(() => new Set(serviciosSeleccionados), [serviciosSeleccionados]);

  const sf = (field: keyof CuponFormState, value: unknown) =>
    dispatch({ type: "SET_FIELD", field, value });

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const values = new Uint8Array(8);
    let code = "";
    let index = 0;
    while (index < values.length) {
      crypto.getRandomValues(values);
      for (const value of values) {
        if (value >= 252) continue;
        code += chars[value % chars.length];
        index++;
        if (index === values.length) break;
      }
    }
    sf("codigo", code);
  };

  const handleSubmit = async () => {
    if (!codigo || !valorDescuento) {
      toast.error("El código y el valor de descuento son obligatorios.");
      return;
    }

    const data: CuponData = {
      codigo,
      tipoDescuento,
      valorDescuento: parseFloat(valorDescuento),
      compraMinima: compraMinima ? parseFloat(compraMinima) : null,
      fechaInicio: fechaInicio ?? null,
      fechaFin: fechaFin ?? null,
      limiteTotal: limiteTotal ? parseInt(limiteTotal, 10) : null,
      limitePorCliente: limitePorCliente ? parseInt(limitePorCliente, 10) : 1,
      servicios: serviciosSeleccionados,
    };

    startTransition(async () => {
      const res = editingCupon
        ? await updateCupon(editingCupon.id, data)
        : await createCupon(data);

      if (res.success) {
        toast.success(editingCupon ? "Cupón actualizado exitosamente" : "Cupón creado exitosamente");
        dispatch({ type: "RESET" });
        onCancelEdit?.();
      } else {
        toast.error(res.error || "Error al guardar cupón");
      }
    });
  };

  const resetForm = () => dispatch({ type: "RESET" });
  const handleCancel = () => { resetForm(); onCancelEdit?.(); };
  const handleToggleServicio = (id: string) => dispatch({ type: "TOGGLE_SERVICIO", id });
  const isEditing = !!editingCupon;

  return (
    <div className="space-y-6">
      {isEditing && (
        <div className="flex items-center justify-between bg-primary/5 border border-primary/10 rounded-lg px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">Editando cupón:</span>
            <Badge variant="outline" className="font-mono">{editingCupon.codigo}</Badge>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scissors className="h-5 w-5 text-muted-foreground" />
            Detalles del Cupón
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Código de Cupón</Label>
              <div className="flex gap-2">
                <Input
                  className="uppercase font-mono"
                  placeholder="EJ: VERANO20"
                  value={codigo}
                  onChange={(e) => sf("codigo", e.target.value.toUpperCase())}
                />
                <Button variant="outline" onClick={generateRandomCode} title="Generar Aleatorio" className="px-3">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Compra Mínima ($)</Label>
              <Input
                type="number"
                placeholder="Ej. 50"
                value={compraMinima}
                onChange={(e) => sf("compraMinima", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Tipo de Descuento</Label>
              <div className="flex p-1 bg-muted/50 rounded-lg border border-border">
                <button type="button" onClick={() => sf("tipoDescuento", "porcentaje")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    tipoDescuento === "porcentaje"
                      ? "bg-background shadow-sm border border-border text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Porcentaje (%)
                </button>
                <button type="button" onClick={() => sf("tipoDescuento", "fijo")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${
                    tipoDescuento === "fijo"
                      ? "bg-background shadow-sm border border-border text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monto Fijo ($)
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Valor del Descuento</Label>
              <Input
                type="number"
                className="h-11!"
                placeholder={tipoDescuento === "porcentaje" ? "15" : "10.00"}
                value={valorDescuento}
                onChange={(e) => sf("valorDescuento", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
            Restricciones de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    !fechaInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaInicio ? format(fechaInicio, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaInicio}
                    onSelect={(d) => sf("fechaInicio", d)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-sm font-normal shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                    !fechaFin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {fechaFin ? format(fechaFin, "PPP", { locale: es }) : <span>Seleccionar fecha</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fechaFin}
                    onSelect={(d) => sf("fechaFin", d)}
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Límite Total de Usos</Label>
              <Input
                type="number"
                placeholder="Ilimitado si está en blanco"
                value={limiteTotal}
                onChange={(e) => sf("limiteTotal", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Veces que puede ser usado globalmente.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Límite por Cliente</Label>
              <Input
                type="number"
                value={limitePorCliente}
                onChange={(e) => sf("limitePorCliente", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
            Aplicabilidad de Servicio
          </CardTitle>
          <CardDescription>
            Selecciona a qué servicios aplica. Si no seleccionas ninguno, aplicará a todos.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {servicios.map((s) => (
              <label
                key={s.id}
                className="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-border hover:bg-muted/30 cursor-pointer transition-colors"
              >
                <Checkbox
                  checked={selectedServiciosSet.has(s.id)}
                  onCheckedChange={() => handleToggleServicio(s.id)}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.nombre}</p>
                </div>
                {s.categoriaNombre && (
                  <Badge variant="secondary" className="text-xs font-normal">
                    {s.categoriaNombre}
                  </Badge>
                )}
              </label>
            ))}
            {servicios.length === 0 && (
              <p className="text-sm text-muted-foreground p-4 text-center">No hay servicios registrados.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3 pt-2">
        {isEditing && (
          <Button variant="outline" type="button" onClick={handleCancel}>
            Cancelar
          </Button>
        )}
        <Button onClick={handleSubmit} disabled={isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {isPending ? "Guardando..." : isEditing ? "Actualizar Cupón" : "Guardar y Activar"}
        </Button>
      </div>
    </div>
  );
}
