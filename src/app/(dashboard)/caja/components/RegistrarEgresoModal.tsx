"use client";

import { useState } from "react";
import { DollarSign, Tag, FileText, Hash, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { registrarEgresoCaja } from "@/lib/actions/caja";

interface RegistrarEgresoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const CATEGORIAS = [
  { id: "insumos", label: "Insumos de Limpieza" },
  { id: "alimentos", label: "Alimentos / Refrigerio Staff" },
  { id: "adelanto_lavador", label: "Adelanto a Lavador" },
  { id: "mantenimiento", label: "Mantenimiento / Reparación" },
  { id: "servicio_basico", label: "Servicios Básicos (Agua/Luz)" },
  { id: "otro", label: "Otro Gasto General" },
];

export function RegistrarEgresoModal({
  open,
  onOpenChange,
  onSuccess,
}: RegistrarEgresoModalProps) {
  const [monto, setMonto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [categoria, setCategoria] = useState("insumos");
  const [comprobanteNum, setComprobanteNum] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      toast.error("Ingrese un monto válido mayor a S/ 0.00");
      return;
    }
    if (!motivo.trim()) {
      toast.error("Ingrese la justificación / motivo del gasto");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await registrarEgresoCaja({
        monto: montoNum.toFixed(2),
        motivo: motivo.trim(),
        categoria,
        comprobanteNum: comprobanteNum.trim() || undefined,
      });

      if (res.success) {
        toast.success("Salida de caja chica registrada correctamente");
        setMonto("");
        setMotivo("");
        setCategoria("insumos");
        setComprobanteNum("");
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Ocurrió un error al registrar el egreso");
      }
    } catch {
      toast.error("Error inesperado al procesar el egreso de caja");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <DollarSign className="h-5 w-5 text-red-500" />
            Registrar Egreso de Caja Chica
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Registra una salida de dinero en efectivo durante el turno actual para mantener el arqueo conciliado.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <Label htmlFor="monto" className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-red-500" />
              Monto a Retirar (S/) *
            </Label>
            <Input
              id="monto"
              type="number"
              step="0.10"
              placeholder="0.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              required
              className="bg-card border-border font-bold text-base h-10 text-foreground"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="categoria" className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-muted-foreground" />
              Categoría del Gasto *
            </Label>
            <select
              id="categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border bg-card text-foreground text-sm font-medium focus:ring-1 focus:ring-secondary"
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="motivo" className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Motivo / Justificación *
            </Label>
            <Input
              id="motivo"
              placeholder="Ej. Compra de 2 desengrasantes y 1 bolsa de hielo"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              required
              className="bg-card border-border text-sm h-10"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="comprobanteNum" className="text-xs font-bold text-muted-foreground flex items-center gap-1">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
              Nº Boleta / Recibo (Opcional)
            </Label>
            <Input
              id="comprobanteNum"
              placeholder="Ej. B001-00123"
              value={comprobanteNum}
              onChange={(e) => setComprobanteNum(e.target.value)}
              className="bg-card border-border text-sm h-10"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="text-xs font-bold h-9"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-9 gap-1.5 px-4 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {isSubmitting ? "Registrando..." : "Confirmar Egreso"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
