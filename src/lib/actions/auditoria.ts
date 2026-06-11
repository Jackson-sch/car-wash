import { db } from "@/lib/db";
import { auditoriaLogs } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function logAudit(data: {
  usuarioId: string;
  usuarioNombre: string;
  accion: string;
  descripcion: string;
  entidad?: string;
  entidadId?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await db.insert(auditoriaLogs).values({
      usuarioId: data.usuarioId,
      usuarioNombre: data.usuarioNombre,
      accion: data.accion,
      descripcion: data.descripcion,
      entidad: data.entidad || null,
      entidadId: data.entidadId || null,
      metadata: data.metadata || {},
    } as any);
  } catch (error) {
    console.error("Error logging audit:", error);
  }
}

export async function getAuditLogs(page = 1, limit = 50) {
  try {
    const offset = (page - 1) * limit;

    return await db
      .select()
      .from(auditoriaLogs)
      .orderBy(desc(auditoriaLogs.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}
