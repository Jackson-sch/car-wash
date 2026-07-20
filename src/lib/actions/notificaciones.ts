"use server";

import { db } from "@/lib/db";
import { notificaciones, usuarios } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { sendNotificationEmail } from "@/lib/email";
import { getSessionOrThrow } from "./servicios";
import { revalidatePath } from "next/cache";

export async function getNotificaciones(limit = 20) {
  try {
    const session = await getSessionOrThrow();
    const usuarioId = session.user.id;

    const rows = await db
      .select()
      .from(notificaciones)
      .where(eq(notificaciones.usuarioId, usuarioId))
      .orderBy(desc(notificaciones.createdAt))
      .limit(limit);

    return rows;
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return [];
  }
}

export async function getNotificacionesNoLeidas() {
  try {
    const session = await getSessionOrThrow();
    const usuarioId = session.user.id;

    const rows = await db
      .select()
      .from(notificaciones)
      .where(
        and(
          eq(notificaciones.usuarioId, usuarioId),
          eq(notificaciones.leida, false)
        )
      )
      .orderBy(desc(notificaciones.createdAt))
      .limit(50);

    return rows;
  } catch (error) {
    console.error("Error al obtener notificaciones no leídas:", error);
    return [];
  }
}

export async function marcarNotificacionLeida(id: string) {
  try {
    const session = await getSessionOrThrow();
    const usuarioId = session.user.id;

    await db
      .update(notificaciones)
      .set({ leida: true })
      .where(
        and(
          eq(notificaciones.id, id),
          eq(notificaciones.usuarioId, usuarioId)
        )
      );

    return { success: true };
  } catch (error) {
    console.error("Error al marcar notificación:", error);
    return { success: false };
  }
}

export async function marcarTodasLeidas() {
  try {
    const session = await getSessionOrThrow();
    const usuarioId = session.user.id;

    await db
      .update(notificaciones)
      .set({ leida: true })
      .where(
        and(
          eq(notificaciones.usuarioId, usuarioId),
          eq(notificaciones.leida, false)
        )
      );

    revalidatePath("/notificaciones");
    return { success: true };
  } catch (error) {
    console.error("Error al marcar notificaciones:", error);
    return { success: false };
  }
}

async function _createNotificacion(
  usuarioId: string,
  data: {
    tipo: string;
    titulo: string;
    mensaje?: string;
    metadata?: Record<string, unknown>;
    enviarEmail?: boolean;
  }
) {
  try {
    await getSessionOrThrow();

    await db.insert(notificaciones).values({
      usuarioId,
      tipo: data.tipo,
      titulo: data.titulo,
      mensaje: data.mensaje || null,
      metadata: data.metadata || {},
      leida: false,
    });

    if (data.enviarEmail) {
      const [user] = await db
        .select({ email: usuarios.email })
        .from(usuarios)
        .where(eq(usuarios.id, usuarioId))
        .limit(1);

      if (user?.email) {
        await sendNotificationEmail(
          user.email,
          data.titulo,
          data.mensaje || data.titulo
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error al crear notificación:", error);
    return { success: false };
  }
}
