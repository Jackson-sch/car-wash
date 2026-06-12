"use client";

import { useState, useTransition, useEffect } from "react";
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
import { createCupon, updateCupon, CuponData } from "@/lib/actions/cupones";
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
  editingCupon?: any | null;
  onCancelEdit?: () => void;
}

export function CuponForm({ servicios, editingCupon, onCancelEdit }: CuponFormProps) {
  const [isPending, startTransition] = useTransition();

  const [codigo, setCodigo] = useState("");
  const [tipoDescuento, setTipoDescuento] = useState<"porcentaje" | "fijo">("porcentaje");
  const [valorDescuento, setValorDescuento] = useState("");
  const [compraMinima, setCompraMinima] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | undefined>(undefined);
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
  const [limiteTotal, setLimiteTotal] = useState("");
  const [limitePorCliente, setLimitePorCliente] = useState("1");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState<string[]>([]);

  useEffect(() => {
    if (editingCupon) {
      setCodigo(editingCupon.codigo || "");
      setTipoDescuento(editingCupon.tipoDescuento || "porcentaje");
      setValorDescuento(editingCupon.valorDescuento?.toString() || "");
      setCompraMinima(editingCupon.compraMinima?.toString() || "");
      setFechaInicio(editingCupon.fechaInicio ? new Date(editingCupon.fechaInicio) : undefined);
      setFechaFin(editingCupon.fechaFin ? new Date(editingCupon.fechaFin) : undefined);
      setLimiteTotal(editingCupon.limiteTotal?.toString() || "");
      setLimitePorCliente(editingCupon.limitePorCliente?.toString() || "1");
      setServiciosSeleccionados(
        editingCupon.servicios?.map((s: any) => s.servicioId || s.servicio?.id).filter(Boolean) || []
      );
    }
  }, [editingCupon]);

  const resetForm = () => {
    setCodigo("");
    setTipoDescuento("porcentaje");
    setValorDescuento("");
    setCompraMinima("");
    setFechaInicio(undefined);
    setFechaFin(undefined);
    setLimiteTotal("");
    setLimitePorCliente("1");
    setServiciosSeleccionados([]);
  };

  const generateRandomCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCodigo(code);
  };

  const handleToggleServicio = (id: string) => {
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((sId) => sId !== id) : [...prev, id]
    );
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit?.();
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
        resetForm();
        onCancelEdit?.();
      } else {
        toast.error(res.error || "Error al guardar cupón");
      }
    });
  };

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
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
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
                onChange={(e) => setCompraMinima(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Tipo de Descuento</Label>
              <div className="flex p-1 bg-muted/50 rounded-lg border border-border">
                <button
                  onClick={() => setTipoDescuento("porcentaje")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                    tipoDescuento === "porcentaje"
                      ? "bg-background shadow-sm border border-border text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Porcentaje (%)
                </button>
                <button
                  onClick={() => setTipoDescuento("fijo")}
                  className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
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
                placeholder={tipoDescuento === "porcentaje" ? "15" : "10.00"}
                value={valorDescuento}
                onChange={(e) => setValorDescuento(e.target.value)}
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
                    onSelect={setFechaInicio}
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
                    onSelect={setFechaFin}
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
                onChange={(e) => setLimiteTotal(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">Veces que puede ser usado globalmente.</p>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase text-muted-foreground">Límite por Cliente</Label>
              <Input
                type="number"
                value={limitePorCliente}
                onChange={(e) => setLimitePorCliente(e.target.value)}
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
                  checked={serviciosSeleccionados.includes(s.id)}
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
