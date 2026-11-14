"use client";

import { X, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/formats";
import type { CrearReservaInput } from "@/lib/actions/reservas";

interface ServicioOpcion {
  id: string;
  nombre: string;
  precio: string;
  duracionMin: number | null;
}

interface NuevaCitaModalProps {
  open: boolean;
  onClose: () => void;
  formData: CrearReservaInput;
  setFormData: React.Dispatch<React.SetStateAction<CrearReservaInput>>;
  onSubmit: (e: React.FormEvent) => void;
  isPending: boolean;
  serviciosDisponibles: ServicioOpcion[];
}

const VEHICULOS_TYPES = [
  { id: "sedan", label: "Sedán" },
  { id: "suv", label: "SUV" },
  { id: "pickup", label: "Pick-up / Camioneta" },
  { id: "moto", label: "Moto" },
  { id: "camion", label: "Camión" },
  { id: "furgon", label: "Furgón / Van" },
  { id: "otro", label: "Otro" },
];

export function NuevaCitaModal({
  open,
  onClose,
  formData,
  setFormData,
  onSubmit,
  isPending,
  serviciosDisponibles,
}: NuevaCitaModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in-0 zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-secondary/15 border border-secondary/30 flex items-center justify-center text-secondary">
              <CalendarIcon className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-foreground leading-tight">
                Agendar Nueva Cita
              </h3>
              <p className="text-xs text-muted-foreground">
                Programa el ingreso de un vehículo a la bahía de lavado.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg text-muted-foreground hover:text-foreground flex items-center justify-center cursor-pointer"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Cliente: Nombre y Teléfono */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Nombre del Cliente *
              </Label>
              <Input
                placeholder="Ej. Juan Pérez"
                value={formData.clienteNombre}
                onChange={(e) =>
                  setFormData({ ...formData, clienteNombre: e.target.value })
                }
                required
                className="text-xs h-9 rounded-xl bg-card border-border text-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Teléfono Celular
              </Label>
              <Input
                type="tel"
                placeholder="987654321"
                value={formData.clienteTelefono || ""}
                onChange={(e) =>
                  setFormData({ ...formData, clienteTelefono: e.target.value })
                }
                className="text-xs h-9 rounded-xl font-mono bg-card border-border text-foreground"
              />
            </div>
          </div>

          {/* Vehículo: Placa y Tipo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Número de Placa *
              </Label>
              <Input
                placeholder="ABC-123"
                value={formData.placa}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    placa: e.target.value.toUpperCase(),
                  })
                }
                required
                className="text-xs h-9 uppercase font-mono tracking-widest font-extrabold rounded-xl bg-card border-border text-foreground"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Tipo de Vehículo
              </Label>
              <Select
                value={formData.vehiculoTipo || "sedan"}
                onValueChange={(val) =>
                  setFormData({ ...formData, vehiculoTipo: val || "sedan" })
                }
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-card border-border text-foreground">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  {VEHICULOS_TYPES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Servicio y Horario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Servicio a Realizar
              </Label>
              <Select
                value={formData.servicioId || "none"}
                onValueChange={(val) =>
                  setFormData({
                    ...formData,
                    servicioId: val === "none" ? "" : val || "",
                  })
                }
              >
                <SelectTrigger className="w-full text-xs h-9 rounded-xl bg-card border-border text-foreground">
                  <SelectValue placeholder="Elegir servicio..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-border text-foreground">
                  <SelectItem value="none">Por definir en bahía</SelectItem>
                  {serviciosDisponibles.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.nombre} ({formatCurrency(parseFloat(s.precio) || 0)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-foreground">
                Hora Programada *
              </Label>
              <Input
                type="time"
                value={formData.hora}
                onChange={(e) =>
                  setFormData({ ...formData, hora: e.target.value })
                }
                required
                className="text-xs h-9 rounded-xl bg-card border-border text-foreground font-mono"
              />
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1">
            <Label className="text-xs font-bold text-foreground">
              Notas u Observaciones del Auto
            </Label>
            <Input
              placeholder="Ej. Cuidado con abolladura previa en puerta derecha..."
              value={formData.notas || ""}
              onChange={(e) =>
                setFormData({ ...formData, notas: e.target.value })
              }
              className="text-xs h-9 rounded-xl bg-card border-border text-foreground"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="text-xs font-bold h-9 rounded-xl cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="text-xs font-extrabold h-9 px-5 rounded-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xs cursor-pointer"
            >
              {isPending ? "Agendando..." : "Confirmar y Guardar Cita"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
