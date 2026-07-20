"use client";

import { Database, ShieldCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BackupSectionProps {
  backupModalOpen: boolean;
  confirmPassword: string;
  verifyingBackup: boolean;
  onOpenModal: () => void;
  onCloseModal: () => void;
  onPasswordChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function BackupSection({
  backupModalOpen,
  confirmPassword,
  verifyingBackup,
  onOpenModal,
  onCloseModal,
  onPasswordChange,
  onSubmit,
}: BackupSectionProps) {
  return (
    <>
      <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <Database className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Copias de Seguridad (Respaldos)</h2>
            <p className="text-[10px] text-muted-foreground">Exporta los datos de toda la aplicación para resguardo o migración.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Genera una copia de seguridad en formato JSON estructurado que incluye la configuración global,
            empresas, planes de suscripción, sucursales, usuarios, clientes, vehículos, servicios y las órdenes de servicio con sus respectivos pagos y comisiones.
          </p>
          <div className="flex items-center gap-2.5 p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <ShieldCheck className="size-4.5 text-emerald-500 shrink-0" />
            <p className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed">
              <strong>Protección y Seguridad:</strong> Para poder descargar este archivo, deberás re-autenticarte
              confirmando tu contraseña de administrador. La descarga directa expira después de 60 segundos
              y está sujeta a límites de frecuencia (máximo 1 descarga por hora).
            </p>
          </div>
          <Button
            onClick={onOpenModal}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto"
          >
            <Download className="size-3.5" />
            Generar Copia de Seguridad
          </Button>
        </div>
      </section>

      {/* Modal de Re-autenticación */}
      <Dialog open={backupModalOpen} onOpenChange={(open) => { if (!open) onCloseModal(); }}>
        <DialogContent className="bg-card border border-border rounded-2xl max-w-sm">
          <form onSubmit={onSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-foreground text-sm font-bold flex items-center gap-2">
                <Lock className="size-4 text-emerald-500" />
                Confirmar Contraseña
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground leading-relaxed">
                Por seguridad, es obligatorio confirmar tu contraseña de administrador para poder descargar el respaldo completo de la base de datos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-1.5">
              <Label htmlFor="backupPass" className="text-xs font-semibold text-foreground">
                Tu contraseña de Superadmin
              </Label>
              <Input
                id="backupPass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-4.5 rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={onCloseModal}
                className="text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs py-2 h-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={verifyingBackup}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs py-2 h-auto"
              >
                {verifyingBackup ? "Verificando..." : "Confirmar y Descargar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
