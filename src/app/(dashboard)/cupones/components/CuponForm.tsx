"use client";

import { useReducer, useTransition, useMemo } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  RefreshCw,
  Calendar as CalendarIcon,
  Save,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import type { CuponData } from "@/lib/actions/cupones";
import { createCupon, updateCupon } from "@/lib/actions/cupones";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
  onSuccess?: () => void;
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

export function CuponForm({ servicios, editingCupon, onCancelEdit, onSuccess }: CuponFormProps) {
  return (
    <CuponFormContent
      key={editingCupon?.id || "nuevo"}
      servicios={servicios}
      editingCupon={editingCupon}
      onCancelEdit={onCancelEdit}
      onSuccess={onSuccess}
    />
  );
}

function CuponFormContent({ servicios, editingCupon, onCancelEdit, onSuccess }: CuponFormProps) {
  const [isPending, startTransition] = useTransition();
  const initialForm = editingCupon ? editingToState(editingCupon) : { ...INITIAL_FORM };
  const [form, dispatch] = useReducer(formReducer, initialForm);

  const {
    codigo,
    tipoDescuento,
    valorDescuento,
    compraMinima,
    fechaInicio,
    fechaFin,
    limiteTotal,
    limitePorCliente,
    serviciosSeleccionados,
  } = form;
  const selectedServiciosSet = useMemo(
    () => new Set(serviciosSeleccionados),
    [serviciosSeleccionados]
  );

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
    if (!codigo.trim() || !valorDescuento) {
      toast.error("El código y el valor de descuento son obligatorios.");
      return;
    }

    const data: CuponData = {
      codigo: codigo.trim(),
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
        onSuccess?.();
        onCancelEdit?.();
      } else {
        toast.error(res.error || "Error al guardar cupón");
      }
    });
  };

  const resetForm = () => dispatch({ type: "RESET" });
  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
  };
  const handleToggleServicio = (id: string) => dispatch({ type: "TOGGLE_SERVICIO", id });
  const isEditing = !!editingCupon;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Columna Izquierda: Datos y Restricciones */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Código Promocional *
              </Label>
              <div className="flex gap-2">
                <Input
                  className="uppercase font-mono font-bold tracking-wider"
                  placeholder="EJ: VERANO20"
                  value={codigo}
                  onChange={(e) => sf("codigo", e.target.value.toUpperCase())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={generateRandomCode}
                  title="Generar código aleatorio"
                  className="px-3 shrink-0 cursor-pointer"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Compra Mínima (S/)
              </Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Ej. 50.00 (opcional)"
                value={compraMinima}
                onChange={(e) => sf("compraMinima", e.target.value)}
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Tipo de Descuento
              </Label>
              <div className="flex p-1 bg-muted/50 rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => sf("tipoDescuento", "porcentaje")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    tipoDescuento === "porcentaje"
                      ? "bg-secondary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Porcentaje (%)
                </button>
                <button
                  type="button"
                  onClick={() => sf("tipoDescuento", "fijo")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                    tipoDescuento === "fijo"
                      ? "bg-secondary text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monto Fijo (S/)
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Valor del Descuento ({tipoDescuento === "porcentaje" ? "%" : "S/"}) *
              </Label>
              <Input
                type="number"
                step="0.01"
                className="font-mono font-bold"
                placeholder={tipoDescuento === "porcentaje" ? "15" : "20.00"}
                value={valorDescuento}
                onChange={(e) => sf("valorDescuento", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Vigente Desde
              </Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-xs font-normal shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    !fechaInicio && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {fechaInicio ? (
                    format(fechaInicio, "PPP", { locale: es })
                  ) : (
                    <span>Inmediato (sin inicio)</span>
                  )}
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

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Fecha de Expiración
              </Label>
              <Popover>
                <PopoverTrigger
                  className={cn(
                    "flex h-9 w-full items-center justify-start rounded-md border border-input bg-background px-3 py-2 text-xs font-normal shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer",
                    !fechaFin && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                  {fechaFin ? (
                    format(fechaFin, "PPP", { locale: es })
                  ) : (
                    <span>Sin caducidad</span>
                  )}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Cupo Total de Canjes
              </Label>
              <Input
                type="number"
                placeholder="Ilimitado si se deja vacío"
                value={limiteTotal}
                onChange={(e) => sf("limiteTotal", e.target.value)}
                className="font-mono"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase text-muted-foreground">
                Usos Máx. por Cliente
              </Label>
              <Input
                type="number"
                value={limitePorCliente}
                onChange={(e) => sf("limitePorCliente", e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
        </div>

        {/* Columna Derecha: Servicios Aplicables */}
        <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl border border-border/80 bg-muted/20 p-4">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-secondary" />
                Servicios Aplicables
              </Label>
              <Badge variant="outline" className="text-[10px] font-bold">
                {serviciosSeleccionados.length === 0
                  ? "Todos los servicios"
                  : `${serviciosSeleccionados.length} seleccionados`}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Si no marcas ninguno, el cupón será válido para cualquier servicio del catálogo.
            </p>

            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1 pt-1">
              {servicios.map((s) => (
                <label
                  key={s.id}
                  className="flex items-center gap-2.5 p-2 rounded-lg border border-transparent hover:border-border hover:bg-card/60 cursor-pointer transition-colors"
                >
                  <Checkbox
                    checked={selectedServiciosSet.has(s.id)}
                    onCheckedChange={() => handleToggleServicio(s.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate">{s.nombre}</p>
                  </div>
                  {s.categoriaNombre && (
                    <Badge variant="secondary" className="text-[10px] font-normal shrink-0">
                      {s.categoriaNombre}
                    </Badge>
                  )}
                </label>
              ))}
              {servicios.length === 0 && (
                <p className="text-xs text-muted-foreground p-4 text-center">
                  No hay servicios registrados.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2.5 pt-2 border-t border-border/60">
        <Button variant="outline" type="button" onClick={handleCancel} className="cursor-pointer">
          Cancelar
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isPending}
          className="gap-2 bg-secondary hover:bg-secondary/90 text-white font-bold cursor-pointer"
        >
          <Save className="h-4 w-4" />
          {isPending ? "Guardando..." : isEditing ? "Actualizar Cupón" : "Guardar y Activar Cupón"}
        </Button>
      </div>
    </div>
  );
}
