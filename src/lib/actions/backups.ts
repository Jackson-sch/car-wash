"use server";

import { db } from "@/lib/db";
import { cuentas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { verifyPassword } from "better-auth/crypto";
import { headers } from "next/headers";
import { logAudit } from "./auditoria";
import crypto from "crypto";

export async function solicitarTokenBackup(password: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.rol !== "superadmin") {
      return { success: false, error: "No autorizado. Solo el Super Administrador puede realizar copias de seguridad." };
    }

    // Buscar la cuenta de tipo email del usuario
    const account = await db.query.cuentas.findFirst({
      where: and(
        eq(cuentas.userId, session.user.id),
        eq(cuentas.providerId, "email")
      ),
    });

    if (!account || !account.password) {
      await logAudit({
        usuarioId: session.user.id,
        usuarioNombre: session.user.name || session.user.email,
        accion: "backup_fallido",
        descripcion: "Intento de copia de seguridad fallido: no se encontró cuenta de correo local para verificación",
        entidad: "backups",
      });
      return { success: false, error: "Verificación fallida. No se encontró contraseña local para el usuario." };
    }

    // Verificar la contraseña usando verifyPassword de better-auth/crypto
    const passwordMatch = await verifyPassword({
      hash: account.password,
      password: password,
    });

    if (!passwordMatch) {
      await logAudit({
        usuarioId: session.user.id,
        usuarioNombre: session.user.name || session.user.email,
        accion: "backup_fallido",
        descripcion: "Intento de copia de seguridad fallido: contraseña incorrecta",
        entidad: "backups",
      });
      return { success: false, error: "Contraseña incorrecta." };
    }

    // Validar el límite de frecuencia (cooldown de 1 hora)
    // Buscamos en la auditoría si hay algún backup descargado en la última hora
    const unaHoraAtras = new Date(Date.now() - 60 * 60 * 1000);
    const backupReciente = await db.query.auditoriaLogs.findFirst({
      where: (logs, { and, eq, gte }) => and(
        eq(logs.accion, "backup_descargado"),
        gte(logs.createdAt, unaHoraAtras)
      ),
    });

    if (backupReciente) {
      return {
        success: false,
        error: "Límite de frecuencia excedido. Solo se permite generar una copia de seguridad por hora."
      };
    }

    // Generar token firmado stateless
    const secret = process.env.BETTER_AUTH_SECRET;
    if (!secret) {
      throw new Error("BETTER_AUTH_SECRET no está configurado.");
    }

    const expiresAt = Date.now() + 60 * 1000; // 60 segundos
    const data = `${session.user.id}:${expiresAt}`;
    const signature = crypto.createHmac("sha256", secret).update(data).digest("hex");
    const token = `${data}:${signature}`;

    await logAudit({
      usuarioId: session.user.id,
      usuarioNombre: session.user.name || session.user.email,
      accion: "backup_token_generado",
      descripcion: "Token de descarga de copia de seguridad generado exitosamente tras re-autenticación",
      entidad: "backups",
    });

    return { success: true, token };
  } catch (error: any) {
    console.error("Error en solicitarTokenBackup:", error);
    return { success: false, error: error.message || "Error al procesar la solicitud" };
  }
}
