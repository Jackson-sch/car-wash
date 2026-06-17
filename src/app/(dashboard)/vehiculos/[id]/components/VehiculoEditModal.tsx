"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateVehiculo } from "@/lib/actions/vehiculos";
import { TIPO_LABELS, VehiculoData } from "../types";
import { Loader2 } from "lucide-react";

interface VehiculoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehiculo: VehiculoData;
}

export function VehiculoEditModal({ isOpen, onClose, vehiculo }: VehiculoEditModalProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);

  const [marca, setMarca] = useState(vehiculo.marca || "");
  const [modelo, setModelo] = useState(vehiculo.modelo || "");
  const [anio, setAnio] = useState<number | "">(vehiculo.anio || "");
  const [color, setColor] = useState(vehiculo.color || "");
  const [tipo, setTipo] = useState<string>(vehiculo.tipo || "sedan");
  const [notas, setNotas] = useState(vehiculo.notas || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const res = await updateVehiculo(vehiculo.id, {
        marca: marca.trim(),
        modelo: modelo.trim(),
        anio: anio === "" ? null : Number(anio),
        color: color.trim(),
        tipo: tipo,
        notas: notas.trim(),
      });

      if (res.success) {
        toast.success("Vehículo actualizado correctamente");
        router.refresh();
        onClose();
      } else {
        toast.error(res.error || "Error al actualizar el vehículo");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al actualizar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border border-border shadow-2xl p-6 rounded-2xl animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader>
          <DialogTitle className="text-lg font-black tracking-tight text-foreground">
            Editar Vehículo
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="marca" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Marca
              </Label>
              <Input
                id="marca"
                value={marca}
                onChange={(e) => setMarca(e.target.value)}
                placeholder="Ej. Toyota"
                className="bg-muted/40 border-border text-foreground font-semibold h-9 rounded-xl focus-visible:ring-secondary/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="modelo" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Modelo
              </Label>
              <Input
                id="modelo"
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Ej. Corolla"
                className="bg-muted/40 border-border text-foreground font-semibold h-9 rounded-xl focus-visible:ring-secondary/20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="anio" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Año
              </Label>
              <Input
                id="anio"
                type="number"
                value={anio}
                onChange={(e) => setAnio(e.target.value === "" ? "" : Number(e.target.value))}
                placeholder="Ej. 2022"
                min={1900}
                max={new Date().getFullYear() + 2}
                className="bg-muted/40 border-border text-foreground font-semibold h-9 rounded-xl focus-visible:ring-secondary/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="color" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Color
              </Label>
              <Input
                id="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Ej. Gris Plata"
                className="bg-muted/40 border-border text-foreground font-semibold h-9 rounded-xl focus-visible:ring-secondary/20"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="tipo" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tipo de Carrocería
            </Label>
            <Select value={tipo} onValueChange={(val: string | null) => setTipo(val || "sedan")}>
              <SelectTrigger id="tipo" className="w-full bg-muted/40 border border-border text-foreground font-semibold rounded-xl text-xs h-9 px-3 focus-visible:ring-secondary/20">
                <SelectValue placeholder="Selecciona el tipo">
                  {(val) => TIPO_LABELS[val as string] || val}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="bg-card text-card-foreground border border-border rounded-xl">
                {Object.entries(TIPO_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="rounded-lg">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notas" className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Notas u Observaciones
            </Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Detalles adicionales sobre el estado del vehículo..."
              rows={3}
              className="bg-muted/40 border-border text-foreground font-semibold rounded-xl resize-none focus-visible:ring-secondary/20"
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={isSaving}
              className="font-bold rounded-xl cursor-pointer hover:bg-muted/80 text-muted-foreground"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="bg-secondary hover:bg-secondary/90 text-white font-bold rounded-xl shadow-md shadow-secondary/15 transition-all min-w-[100px] cursor-pointer"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                  Guardando
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
