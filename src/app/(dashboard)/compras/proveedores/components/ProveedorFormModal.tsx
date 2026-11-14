"use client";

import { useState } from "react";
import { Building2, Loader2, Save, Landmark, User, Phone } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  upsertProveedorAction,
  toggleEstadoProveedorAction,
} from "@/lib/actions/proveedores";
import type { ProveedorDirectoryItem } from "../../types";

interface ProveedorFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proveedor?: ProveedorDirectoryItem | null;
  onSuccess: () => void;
}

export function ProveedorFormModal(props: ProveedorFormModalProps) {
  if (!props.open) return null;
  return (
    <ProveedorFormModalContent
      key={props.proveedor?.id || "new"}
      {...props}
    />
  );
}

function ProveedorFormModalContent({
  open,
  onOpenChange,
  proveedor,
  onSuccess,
}: ProveedorFormModalProps) {
  const isEditing = Boolean(proveedor);
  const [isSaving, setIsSaving] = useState(false);

  const [ruc, setRuc] = useState(proveedor?.ruc || "");
  const [razonSocial, setRazonSocial] = useState(proveedor?.razonSocial || "");
  const [nombreComercial, setNombreComercial] = useState(proveedor?.nombreComercial || "");
  const [direccion, setDireccion] = useState(proveedor?.direccion || "");
  const [telefono, setTelefono] = useState(proveedor?.telefono || "");
  const [email, setEmail] = useState(proveedor?.email || "");
  const [contactoNombre, setContactoNombre] = useState(proveedor?.contactoNombre || "");
  const [banco, setBanco] = useState(proveedor?.banco || "");
  const [cuentaBancaria, setCuentaBancaria] = useState(proveedor?.cuentaBancaria || "");
  const [cci, setCci] = useState(proveedor?.cci || "");
  const [notas, setNotas] = useState(proveedor?.notas || "");
  const [activo, setActivo] = useState(proveedor?.activo ?? true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!razonSocial.trim()) {
      toast.error("La Razón Social es obligatoria.");
      return;
    }

    try {
      setIsSaving(true);
      const res = await upsertProveedorAction({
        id: proveedor?.id,
        ruc: ruc.trim() || null,
        razonSocial: razonSocial.trim(),
        nombreComercial: nombreComercial.trim() || null,
        direccion: direccion.trim() || null,
        telefono: telefono.trim() || null,
        email: email.trim() || null,
        contactoNombre: contactoNombre.trim() || null,
        banco: banco.trim() || null,
        cuentaBancaria: cuentaBancaria.trim() || null,
        cci: cci.trim() || null,
        notas: notas.trim() || null,
      });

      if (!res.success) {
        toast.error(res.error || "No se pudo guardar el proveedor.");
        return;
      }

      if (isEditing && proveedor && proveedor.activo !== activo) {
        await toggleEstadoProveedorAction(proveedor.id, activo);
      }

      toast.success(
        isEditing ? "Proveedor actualizado correctamente." : "Proveedor registrado en el directorio."
      );
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      console.error(error);
      toast.error("Error inesperado al guardar el proveedor.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-2xl border-border bg-card max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-black">
            <Building2 className="size-5 text-secondary" />
            <span>{isEditing ? "Editar Proveedor" : "Nuevo Proveedor"}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Completa los datos fiscales, de contacto y cuentas bancarias para agilizar tus compras.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identificación Fiscal */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">RUC / DNI</Label>
              <Input
                value={ruc}
                onChange={(e) => setRuc(e.target.value.replace(/[^0-9]/g, ""))}
                maxLength={11}
                placeholder="20512894102"
                className="h-9 rounded-xl font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-bold">
                Razón Social / Nombre <span className="text-rose-500">*</span>
              </Label>
              <Input
                required
                value={razonSocial}
                onChange={(e) => setRazonSocial(e.target.value)}
                placeholder="Ej: Wurth Perú S.A.C."
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nombre Comercial (Opcional)</Label>
              <Input
                value={nombreComercial}
                onChange={(e) => setNombreComercial(e.target.value)}
                placeholder="Ej: Wurth Detailing"
                className="h-9 rounded-xl text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Dirección Fiscal / Local</Label>
              <Input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Av. Nicolás Ayllón 1240..."
                className="h-9 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Contacto Comercial */}
          <div className="pt-2 border-t border-border/50 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <User className="size-3.5 text-secondary" />
              <span>Contacto & Vendedor</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium">Asesor / Contacto</Label>
                <Input
                  value={contactoNombre}
                  onChange={(e) => setContactoNombre(e.target.value)}
                  placeholder="Nombre del vendedor"
                  className="h-9 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium flex items-center gap-1">
                  <Phone className="size-3" /> Teléfono / WhatsApp
                </Label>
                <Input
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="987654321"
                  className="h-9 rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium">Correo Electrónico</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ventas@proveedor.pe"
                  className="h-9 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Datos Bancarios */}
          <div className="pt-2 border-t border-border/50 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Landmark className="size-3.5 text-emerald-500" />
              <span>Cuentas Bancarias (Para Transferencias)</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-medium">Banco</Label>
                <Input
                  value={banco}
                  onChange={(e) => setBanco(e.target.value)}
                  placeholder="BCP, BBVA, Interbank..."
                  className="h-9 rounded-xl text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium">N° Cuenta</Label>
                <Input
                  value={cuentaBancaria}
                  onChange={(e) => setCuentaBancaria(e.target.value)}
                  placeholder="193-12345678-0-01"
                  className="h-9 rounded-xl font-mono text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px] font-medium">CCI Interbancario</Label>
                <Input
                  value={cci}
                  onChange={(e) => setCci(e.target.value)}
                  placeholder="002193..."
                  className="h-9 rounded-xl font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Notas / Condiciones Comerciales</Label>
            <Textarea
              rows={2}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ej: Crédito a 15 días, entrega gratuita en compras mayores a S/ 500..."
              className="rounded-xl text-xs resize-none"
            />
          </div>

          {isEditing && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/50">
              <div>
                <p className="text-xs font-bold text-foreground">Proveedor Activo</p>
                <p className="text-[11px] text-muted-foreground">
                  Si se desactiva, no aparecerá en sugerencias de nuevas compras.
                </p>
              </div>
              <Switch checked={activo} onCheckedChange={setActivo} />
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-xl text-xs"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-xl bg-secondary text-secondary-foreground font-bold text-xs gap-1.5"
            >
              {isSaving ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <Save className="size-3.5" />
                  <span>{isEditing ? "Actualizar Proveedor" : "Registrar Proveedor"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
