"use server";

import { db } from "@/lib/db";
import { configGlobal } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/config";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getErrorMessage } from "./action-utils";
import { logAudit } from "./auditoria";

async function verifySuperAdminSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.rol !== "superadmin") {
    throw new Error("No autorizado.");
  }
  return session;
}

export async function getConfigGlobal() {
  try {
    await verifySuperAdminSession();

    let [config] = await db.select().from(configGlobal).limit(1);

    if (!config) {
      [config] = await db.insert(configGlobal).values({}).returning();
    }

    return { success: true, data: config };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Error al obtener configuración") };
  }
}

export async function updateConfigGlobal(data: {
  mantenimientoActivo?: boolean;
  mantenimientoMensaje?: string;
  nombreApp?: string;
  logoUrl?: string;
  smtpHost?: string;
  smtpPort?: number | null;
  smtpUser?: string;
  smtpPass?: string;
  smtpFromEmail?: string;
  smtpFromName?: string;
}) {
  try {
    const session = await verifySuperAdminSession();

    let [config] = await db.select().from(configGlobal).limit(1);
    if (!config) {
      [config] = await db.insert(configGlobal).values({}).returning();
    }

    await db
      .update(configGlobal)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(configGlobal.id, config.id));

    const cambios = Object.keys(data)
      .filter((k) => data[k as keyof typeof data] !== undefined)
      .map((k) => {
        const val = data[k as keyof typeof data];
        if (k === "smtpPass") return "smtp_pass: ***";
        return `${k}: ${val}`;
      })
      .join(", ");

    logAudit({
      usuarioId: session.user.id,
      usuarioNombre: session.user.name || session.user.email,
      accion: "editar_configuracion",
      descripcion: `Actualizó configuración global (${cambios})`,
      entidad: "configuracion",
    });

    revalidatePath("/superadmin/configuracion");
    return { success: true };
  } catch (error) {
    return { success: false, error: getErrorMessage(error, "Error al actualizar configuración") };
  }
}
