"use server";

import { db } from "@/lib/db";
import { ordenes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export interface EvaluacionParams {
  nroTicket: string;
  estrellas: number;
  comentario?: string;
  aspectos?: string[];
}

export async function guardarEvaluacionCSAT(params: EvaluacionParams) {
  try {
    const cleanTicket = params.nroTicket.trim().toUpperCase();

    const [orden] = await db
      .select({ id: ordenes.id })
      .from(ordenes)
      .where(eq(ordenes.nroTicket, cleanTicket));

    if (!orden) {
      return { success: false, error: "No se encontró el ticket especificado" };
    }

    // Actualizar observaciones / notas con la calificación registrada
    const evaluacionText = `[CSAT: ${params.estrellas}⭐] ${params.aspectos?.join(", ") || ""} - ${params.comentario || "Sin comentario adicional"}`;

    await db
      .update(ordenes)
      .set({
        notas: evaluacionText,
        updatedAt: new Date(),
      })
      .where(eq(ordenes.id, orden.id));

    revalidatePath(`/consulta/${cleanTicket}`);
    return { success: true };
  } catch (error) {
    console.error("Error al guardar evaluación CSAT:", error);
    return { success: false, error: "Ocurrió un error al enviar tu evaluación" };
  }
}
