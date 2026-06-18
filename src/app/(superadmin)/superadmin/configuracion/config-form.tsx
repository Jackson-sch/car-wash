"use client";

import { useState } from "react";
import {
  Settings,
  ShieldAlert,
  Brush,
  Mail,
  Wrench,
  Save,
  Eye,
  EyeOff,
  Database,
  Lock,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { updateConfigGlobal } from "@/lib/actions/config-global";
import { solicitarTokenBackup } from "@/lib/actions/backups";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface ConfigData {
  id: string;
  mantenimientoActivo: boolean;
  mantenimientoMensaje: string;
  nombreApp: string;
  logoUrl: string | null;
  smtpHost: string | null;
  smtpPort: number | null;
  smtpUser: string | null;
  smtpPass: string | null;
  smtpFromEmail: string | null;
  smtpFromName: string | null;
}

export function ConfigForm({ config }: { config: ConfigData }) {
  const [form, setForm] = useState({
    mantenimientoActivo: config.mantenimientoActivo,
    mantenimientoMensaje: config.mantenimientoMensaje,
    nombreApp: config.nombreApp,
    logoUrl: config.logoUrl || "",
    smtpHost: config.smtpHost || "",
    smtpPort: config.smtpPort?.toString() || "",
    smtpUser: config.smtpUser || "",
    smtpPass: config.smtpPass || "",
    smtpFromEmail: config.smtpFromEmail || "",
    smtpFromName: config.smtpFromName || "",
  });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);

  const [backupModalOpen, setBackupModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [verifyingBackup, setVerifyingBackup] = useState(false);

  const handleGenerateBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmPassword.trim()) {
      toast.error("Por favor, ingrese su contraseña.");
      return;
    }

    try {
      setVerifyingBackup(true);
      const res = await solicitarTokenBackup(confirmPassword);
      if (res.success && res.token) {
        toast.success("Verificación exitosa. Iniciando descarga...");
        setBackupModalOpen(false);
        setConfirmPassword("");
        window.location.href = `/api/superadmin/backup?token=${res.token}`;
      } else {
        toast.error(res.error || "Contraseña incorrecta o error al generar el backup.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error inesperado al procesar la copia de seguridad.");
    } finally {
      setVerifyingBackup(false);
    }
  };

  const handleSaveSection = async (section: string) => {
    try {
      setSaving(true);
      const payload: Record<string, unknown> = {};

      switch (section) {
        case "mantenimiento":
          payload.mantenimientoActivo = form.mantenimientoActivo;
          payload.mantenimientoMensaje = form.mantenimientoMensaje;
          break;
        case "marca":
          payload.nombreApp = form.nombreApp;
          payload.logoUrl = form.logoUrl || undefined;
          break;
        case "smtp":
          payload.smtpHost = form.smtpHost || undefined;
          payload.smtpPort = form.smtpPort ? parseInt(form.smtpPort) : null;
          payload.smtpUser = form.smtpUser || undefined;
          payload.smtpPass = form.smtpPass || undefined;
          payload.smtpFromEmail = form.smtpFromEmail || undefined;
          payload.smtpFromName = form.smtpFromName || undefined;
          break;
      }

      const res = await updateConfigGlobal(payload);
      if (res.success) {
        toast.success(`${section === "mantenimiento" ? "Mantenimiento" : section === "marca" ? "Marca" : "SMTP"} actualizado`);
      } else {
        toast.error(res.error || "Error al guardar");
      }
    } catch {
      toast.error("Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mantenimiento */}
      <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Wrench className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Modo Mantenimiento</h2>
              <p className="text-[10px] text-muted-foreground">Deshabilita el acceso a todos los usuarios no administradores.</p>
            </div>
          </div>
          <Switch
            checked={form.mantenimientoActivo}
            onCheckedChange={(v) => setForm({ ...form, mantenimientoActivo: v })}
            className="data-[state=checked]:bg-amber-500 focus-visible:ring-ring/40"
          />
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="mantMsg" className="text-xs font-semibold text-foreground">Mensaje para los usuarios</Label>
            <textarea
              id="mantMsg"
              value={form.mantenimientoMensaje}
              onChange={(e) => setForm({ ...form, mantenimientoMensaje: e.target.value })}
              rows={2}
              className="w-full bg-muted/30 border border-border text-xs rounded-xl px-3 py-2.5 text-foreground focus:outline-none focus:border-ring resize-none placeholder-muted-foreground"
            />
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
            <ShieldAlert className="size-4 text-amber-500 shrink-0" />
            <p className="text-[10px] text-amber-600/80 dark:text-amber-400/80 leading-relaxed">
              {form.mantenimientoActivo
                ? "El modo mantenimiento está activo. Los usuarios no administradores verán la página de mantenimiento al intentar acceder."
                : "Al activarlo, todos los usuarios (excepto superadmins) serán redirigidos a una página de mantenimiento."}
            </p>
          </div>
          <Button
            onClick={() => handleSaveSection("mantenimiento")}
            disabled={saving}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto"
          >
            <Save className="size-3.5" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </section>

      {/* Marca */}
      <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20">
            <Brush className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Personalización de Marca</h2>
            <p className="text-[10px] text-muted-foreground">Nombre de la aplicación y logo.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="appName" className="text-xs font-semibold text-foreground">Nombre de la App</Label>
              <Input
                id="appName"
                value={form.nombreApp}
                onChange={(e) => setForm({ ...form, nombreApp: e.target.value })}
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="logoUrl" className="text-xs font-semibold text-foreground">URL del Logo</Label>
              <Input
                id="logoUrl"
                value={form.logoUrl}
                onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                placeholder="https://ejemplo.com/logo.png"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
              />
            </div>
          </div>
          <Button
            onClick={() => handleSaveSection("marca")}
            disabled={saving}
            className="bg-secondary hover:bg-secondary/90 text-secondary-foreground font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto"
          >
            <Save className="size-3.5" />
            {saving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </section>

      {/* SMTP */}
      <section className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
            <Mail className="size-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-foreground">Configuración SMTP</h2>
            <p className="text-[10px] text-muted-foreground">Servidor de correo para notificaciones y recuperación de contraseñas.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="smtpHost" className="text-xs font-semibold text-foreground">Host</Label>
              <Input
                id="smtpHost"
                value={form.smtpHost}
                onChange={(e) => setForm({ ...form, smtpHost: e.target.value })}
                placeholder="smtp.gmail.com"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtpPort" className="text-xs font-semibold text-foreground">Puerto</Label>
              <Input
                id="smtpPort"
                type="number"
                value={form.smtpPort}
                onChange={(e) => setForm({ ...form, smtpPort: e.target.value })}
                placeholder="587"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtpUser" className="text-xs font-semibold text-foreground">Usuario</Label>
              <Input
                id="smtpUser"
                value={form.smtpUser}
                onChange={(e) => setForm({ ...form, smtpUser: e.target.value })}
                placeholder="tu@correo.com"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtpPass" className="text-xs font-semibold text-foreground">Contraseña</Label>
              <div className="relative">
                <Input
                  id="smtpPass"
                  type={showPass ? "text" : "password"}
                  value={form.smtpPass}
                  onChange={(e) => setForm({ ...form, smtpPass: e.target.value })}
                  placeholder="••••••••"
                  className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {showPass ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtpFromEmail" className="text-xs font-semibold text-foreground">Correo Remitente</Label>
              <Input
                id="smtpFromEmail"
                value={form.smtpFromEmail}
                onChange={(e) => setForm({ ...form, smtpFromEmail: e.target.value })}
                placeholder="noreply@washmaster.pe"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="smtpFromName" className="text-xs font-semibold text-foreground">Nombre Remitente</Label>
              <Input
                id="smtpFromName"
                value={form.smtpFromName}
                onChange={(e) => setForm({ ...form, smtpFromName: e.target.value })}
                placeholder="WashMaster Pro"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-5 rounded-xl"
              />
            </div>
          </div>
          <Button
            onClick={() => handleSaveSection("smtp")}
            disabled={saving}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto mt-4"
          >
            <Save className="size-3.5" />
            {saving ? "Guardando..." : "Guardar Configuración SMTP"}
          </Button>
        </div>
      </section>

      {/* Copias de Seguridad */}
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
            onClick={() => setBackupModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold gap-2 cursor-pointer rounded-xl text-xs py-2 h-auto"
          >
            <Download className="size-3.5" />
            Generar Copia de Seguridad
          </Button>
        </div>
      </section>

      {/* Modal de Re-autenticación */}
      <Dialog open={backupModalOpen} onOpenChange={(open) => {
        setBackupModalOpen(open);
        if (!open) setConfirmPassword("");
      }}>
        <DialogContent className="bg-card border border-border rounded-2xl max-w-sm">
          <form onSubmit={handleGenerateBackup} className="space-y-4">
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
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="bg-muted/30 border-border focus-visible:ring-ring/50 text-foreground text-xs py-4.5 rounded-xl"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setBackupModalOpen(false)}
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
    </div>
  );
}

