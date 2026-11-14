"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Ban, Loader2 } from "lucide-react";
import { anularCompraAction } from "@/lib/actions/compras";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AnularModalProps {
  compraId: string;
  numeroComprobante: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AnularModal({
  compraId,
  numeroComprobante,
  open,
  onOpenChange,
}: AnularModalProps) {
  const router = useRouter();
  const [motivo, setMotivo] = useState("");
  const [isAnulando, setIsAnulando] = useState(false);

  const handleAnular = async () => {
    if (!motivo.trim()) {
      toast.error("Debes ingresar el motivo de la anulación.");
      return;
    }

    try {
      setIsAnulando(true);
      const res = await anularCompraAction(compraId, motivo.trim());
      if (!res.success) {
        toast.error(res.error || "No se pudo anular la compra.");
        return;
      }

      toast.success(
        `Compra ${numeroComprobante} anulada. El stock de inventario fue revertido exitosamente.`
      );
      onOpenChange(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Error al anular la compra.");
    } finally {
      setIsAnulando(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-2xl border-border bg-card p-6">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-2.5 text-rose-500">
            <div className="size-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-foreground">
                Anular Compra {numeroComprobante}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Esta acción descontará las cantidades ingresadas del inventario.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2 text-xs">
          <p className="text-muted-foreground leading-relaxed">
            Se registrará automáticamente una salida compensatoria en el Kardex por concepto de
            anulación de factura de proveedor.
          </p>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold text-foreground">
              Motivo de la anulación <span className="text-rose-500">*</span>
            </Label>
            <Input
              required
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              placeholder="Ej: Factura anulada por proveedor, error en cantidades..."
              className="h-10 rounded-xl border-border bg-muted/20 text-xs font-medium"
            />
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isAnulando}
            className="rounded-xl"
          >
            Volver
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleAnular}
            disabled={isAnulando}
            className="rounded-xl font-bold gap-1.5"
          >
            {isAnulando ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Ban className="size-3.5" />
            )}
            <span>Confirmar Anulación</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
