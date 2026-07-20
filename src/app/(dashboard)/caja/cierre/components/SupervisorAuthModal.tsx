"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";

interface SupervisorAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supEmail: string;
  supPassword: string;
  verifyingSup: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

export function SupervisorAuthModal({
  open,
  onOpenChange,
  supEmail,
  supPassword,
  verifyingSup,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  onCancel,
}: SupervisorAuthModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border border-border rounded-2xl max-w-sm p-6 space-y-4">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
            <KeyRound className="h-5 w-5" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-md font-extrabold text-foreground text-center">
              Autorización de Supervisor Requerida
            </DialogTitle>
            <DialogDescription className="text-[11px] text-muted-foreground text-center">
              Ingrese las credenciales de un supervisor o administrador para autorizar el cierre de caja con descuadre.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div className="space-y-1">
            <Label htmlFor="sup-email" className="text-[10px] font-bold text-zinc-650">
              Correo Electrónico
            </Label>
            <Input
              id="sup-email"
              type="email"
              placeholder="supervisor@washmaster.com"
              value={supEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              className="h-9 text-xs rounded-xl font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="sup-pass" className="text-[10px] font-bold text-zinc-650">
              Contraseña
            </Label>
            <Input
              id="sup-pass"
              type="password"
              placeholder="••••••••"
              value={supPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="h-9 text-xs rounded-xl font-medium"
              required
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="flex-1 text-xs font-semibold h-9 rounded-xl border border-zinc-200"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={verifyingSup}
              className="flex-1 text-xs font-bold h-9 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
            >
              {verifyingSup ? "Validando..." : "Autorizar Cierre"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
