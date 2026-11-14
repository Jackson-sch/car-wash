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
import { KeyRound, ShieldAlert } from "lucide-react";

interface SupervisorAuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supEmail: string;
  supPassword: string;
  verifyingSup: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
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
      <DialogContent className="bg-card border border-border rounded-2xl max-w-sm p-6 space-y-4 shadow-xl">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <KeyRound className="size-6" />
          </div>
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-base font-black text-foreground text-center">
              Autorización de Supervisor Requerida
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground text-center">
              Ingrese credenciales de un supervisor o administrador para visar el cierre de caja descuadrada.
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="sup-email" className="text-xs font-bold text-foreground">
              Correo Electrónico del Supervisor
            </Label>
            <Input
              id="sup-email"
              name="email"
              type="email"
              placeholder="supervisor@carwashpro.com"
              value={supEmail}
              onChange={(e) => onEmailChange(e.target.value)}
              className="h-10 text-xs rounded-xl font-medium border-border bg-card"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="sup-pass" className="text-xs font-bold text-foreground">
              Contraseña
            </Label>
            <Input
              id="sup-pass"
              name="password"
              type="password"
              placeholder="••••••••"
              value={supPassword}
              onChange={(e) => onPasswordChange(e.target.value)}
              className="h-10 text-xs rounded-xl font-medium border-border bg-card"
              required
            />
          </div>

          <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/15 flex items-start gap-2 text-[11px] text-amber-600 dark:text-amber-400">
            <ShieldAlert className="size-4 shrink-0 mt-0.5" />
            <span>
              Esta aprobación quedará registrada en la auditoría del turno con fecha, hora y usuario.
            </span>
          </div>

          <div className="flex gap-2.5 pt-1">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 text-xs font-semibold h-10 rounded-xl border-border cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={verifyingSup}
              className="flex-1 text-xs font-bold h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-white cursor-pointer shadow-xs"
            >
              {verifyingSup ? (
                <>
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white mr-1.5" />
                  Validando...
                </>
              ) : (
                "Autorizar Cierre"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
