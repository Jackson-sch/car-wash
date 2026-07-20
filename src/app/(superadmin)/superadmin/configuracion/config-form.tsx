"use client";

import { useState } from "react";
import { updateConfigGlobal } from "@/lib/actions/config-global";
import { solicitarTokenBackup } from "@/lib/actions/backups";
import { toast } from "sonner";
import { MantenimientoSection } from "./components/MantenimientoSection";
import { MarcaSection } from "./components/MarcaSection";
import { SmtpSection } from "./components/SmtpSection";
import { BackupSection } from "./components/BackupSection";

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
      <MantenimientoSection
        mantenimientoActivo={form.mantenimientoActivo}
        mantenimientoMensaje={form.mantenimientoMensaje}
        saving={saving}
        onMantenimientoChange={(v) => setForm({ ...form, mantenimientoActivo: v })}
        onMensajeChange={(v) => setForm({ ...form, mantenimientoMensaje: v })}
        onSave={() => handleSaveSection("mantenimiento")}
      />

      <MarcaSection
        nombreApp={form.nombreApp}
        logoUrl={form.logoUrl || ""}
        saving={saving}
        onNombreAppChange={(v) => setForm({ ...form, nombreApp: v })}
        onLogoUrlChange={(url) => setForm({ ...form, logoUrl: url })}
        onSave={() => handleSaveSection("marca")}
      />

      <SmtpSection
        smtpHost={form.smtpHost}
        smtpPort={form.smtpPort}
        smtpUser={form.smtpUser}
        smtpPass={form.smtpPass}
        smtpFromEmail={form.smtpFromEmail}
        smtpFromName={form.smtpFromName}
        showPass={showPass}
        saving={saving}
        onHostChange={(v) => setForm({ ...form, smtpHost: v })}
        onPortChange={(v) => setForm({ ...form, smtpPort: v })}
        onUserChange={(v) => setForm({ ...form, smtpUser: v })}
        onPassChange={(v) => setForm({ ...form, smtpPass: v })}
        onFromEmailChange={(v) => setForm({ ...form, smtpFromEmail: v })}
        onFromNameChange={(v) => setForm({ ...form, smtpFromName: v })}
        onToggleShowPass={() => setShowPass(!showPass)}
        onSave={() => handleSaveSection("smtp")}
      />

      <BackupSection
        backupModalOpen={backupModalOpen}
        confirmPassword={confirmPassword}
        verifyingBackup={verifyingBackup}
        onOpenModal={() => setBackupModalOpen(true)}
        onCloseModal={() => { setBackupModalOpen(false); setConfirmPassword(""); }}
        onPasswordChange={setConfirmPassword}
        onSubmit={handleGenerateBackup}
      />
    </div>
  );
}

