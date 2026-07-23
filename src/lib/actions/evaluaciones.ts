"use server";

import { db } from "@/lib/db";
import { ordenes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { evaluacionLimiter, globalLimiter, getClientIp } from "./rate-limit";

export interface EvaluacionParams {
  nroTicket: string;
  estrellas: number;
  comentario?: string;
  aspectos?: string[];
}

const ESTADOS_PERMITIDOS: string[] = ["completado", "cobrado"];
const ESTRELLAS_VALIDAS = [1, 2, 3, 4, 5];

function sanitizarTexto(texto: string, maxLen: number = 500): string {
  return texto.trim().slice(0, maxLen);
}

// react-doctor-disable-next-line server-auth-actions
export async function guardarEvaluacionCSAT(params: EvaluacionParams) {
  try {
    const cleanTicket = params.nroTicket.trim().toUpperCase();

    // Validar que el ticket solo contenga caracteres permitidos (alfanumérico, guiones, guión bajo)
    if (!/^[A-Z0-9\-_]+$/.test(cleanTicket)) {
      return { success: false, error: "El formato del ticket no es válido" };
    }

    // Validar rango de estrellas
    if (!ESTRELLAS_VALIDAS.includes(params.estrellas)) {
      return { success: false, error: "La calificación debe estar entre 1 y 5 estrellas" };
    }

    // Rate limiting: máximo 3 intentos por ticket por hora + límite global por IP
    const clientIp = await getClientIp();
    const ticketLimit = evaluacionLimiter.check(`ticket:${cleanTicket}`);
    if (!ticketLimit.allowed) {
      const mins = Math.ceil(ticketLimit.reset / 60000);
      return {
        success: false,
        error: `Has alcanzado el límite de evaluaciones para este ticket. Intenta de nuevo en ${mins} minuto${mins !== 1 ? "s" : ""}.`,
      };
    }
    // Throttle global por IP (20 solicitudes/minuto)
    const ipLimit = globalLimiter.check(`ip:${clientIp}`);
    if (!ipLimit.allowed) {
      return {
        success: false,
        error: "Demasiadas solicitudes desde tu dirección IP. Intenta de nuevo en un momento.",
      };
    }

    const [orden] = await db
      .select({ id: ordenes.id, estado: ordenes.estado, notas: ordenes.notas })
      .from(ordenes)
      .where(eq(ordenes.nroTicket, cleanTicket));

    if (!orden) {
      return { success: false, error: "No se encontró el ticket especificado" };
    }

    // Solo permitir evaluación para órdenes completadas o cobradas
    if (!ESTADOS_PERMITIDOS.includes(orden.estado)) {
      return { success: false, error: "Solo puedes evaluar servicios que hayan sido completados" };
    }

    // Prevenir sobrescritura de evaluaciones existentes
    if (orden.notas?.startsWith("[CSAT:")) {
      return { success: false, error: "Este ticket ya fue evaluado anteriormente" };
    }

    // Sanitizar y limitar longitud de comentarios
    const comentario = params.comentario
      ? sanitizarTexto(params.comentario)
      : "Sin comentario adicional";

    const aspectos = (params.aspectos || []).flatMap((a) => {
      const clean = sanitizarTexto(a, 100);
      return clean ? [clean] : [];
    });

    const evaluacionText = `[CSAT: ${params.estrellas}⭐] ${aspectos.join(", ")} - ${comentario}`;

    await db
      .update(ordenes)
      .set({
        notas: evaluacionText,
        updatedAt: new Date(),
      })
      .where(eq(ordenes.id, orden.id));

    revalidatePath(`/consulta/${cleanTicket}`);
    revalidateTag("ordenes", { expire: 600 });
    return { success: true };
  } catch (error) {
    console.error("Error al guardar evaluación CSAT:", error);
    return { success: false, error: "Ocurrió un error al enviar tu evaluación" };
  }
}
