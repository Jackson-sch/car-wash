"use client";

import { useState } from "react";
import { Database, ShieldCheck, Lock, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { solicitarTokenBackupEmpresa } from "@/lib/actions/backups";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface Sucursal {
  id: string;
  nombre: string;
}

interface BackupPanelProps {
  sucursal: Sucursal;
}

export function BackupPanel({ sucursal }: BackupPanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifying, setVerifying] = useState(false);

  const handleGenerateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPassword.trim()) {
      toast.error("Por favor, ingrese su contraseña.");
      return;
    }

    try {
      setVerifying(true);
      const res = await solicitarTokenBackupEmpresa(confirmPassword);
      if (res.success && res.token) {
        toast.success("Verificación exitosa. Iniciando descarga...");
        setModalOpen(false);
        setConfirmPassword("");
        // Iniciar la descarga del archivo redireccionando al endpoint del API
        window.location.href = `/api/admin/exportar?token=${res.token}`;
      } else {
        toast.error(res.error || "Contraseña incorrecta o error al generar el backup.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al procesar la copia de seguridad.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <Card className="border-border bg-card shadow-sm max-w-2xl">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Copia de Seguridad de la Empresa</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Exporta los datos comerciales de tu sucursal y empresa.</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-6">
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Genera y descarga un archivo estructurado en formato JSON que contiene toda la información histórica
            de tu empresa. Esto incluye tus sucursales, lista de personal, base de datos de clientes y vehículos,
            servicios configurados, turnos de caja, historial de ventas/órdenes con sus pagos, comisiones,
            así como el uso de cupones y puntos de fidelidad.
          </p>

          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
            <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-emerald-600 dark:text-emerald-400">Protección de Datos Privados</h3>
              <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 leading-relaxed">
                Por seguridad de la empresa, es mandatorio que confirmes tu contraseña de acceso para poder iniciar el proceso. 
                El enlace de descarga generado expira en 60 segundos y puedes descargar el archivo un máximo de **1 vez cada 2 horas**.
              </p>
            </div>
          </div>

          <div className="pt-4 flex justify-end border-t border-border">
            <Button
              onClick={() => setModalOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 cursor-pointer h-10 rounded-lg shadow-sm px-6"
            >
              <Download className="h-4 w-4" />
              Generar Copia de Seguridad
            </Button>
          </div>
        </div>
      </Card>

      {/* Modal de Re-autenticación */}
      <Dialog
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setConfirmPassword("");
        }}
      >
        <DialogContent className="bg-card border border-border rounded-2xl max-w-sm">
          <form onSubmit={handleGenerateBackup} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="text-foreground text-sm font-bold flex items-center gap-2">
                <Lock className="h-4 w-4 text-emerald-500" />
                Confirmar Contraseña
              </DialogTitle>
              <DialogDescription className="text-[11px] text-muted-foreground leading-relaxed">
                Para autorizar la descarga del respaldo de datos de la empresa, confirma tu contraseña actual.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="backupPass" className="text-xs font-bold text-muted-foreground">
                Tu contraseña de Administrador
              </Label>
              <Input
                id="backupPass"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="bg-card border-border focus:border-emerald-500 text-sm h-10 rounded-lg"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
                className="text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs py-2 h-auto"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={verifying}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs py-2 h-auto"
              >
                {verifying ? "Verificando..." : "Confirmar y Descargar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
