"use server";

import { getSessionOrThrow } from "./servicios";

export interface PushNotificationPayload {
  title: string;
  body: string;
  url?: string;
  tag?: string;
}

export async function enviarNotificacionPushLocal(payload: PushNotificationPayload) {
  try {
    await getSessionOrThrow();
    // Simulación de despacho Web Push Protocol para PWA
    return {
      success: true,
      message: `Notificación enviada: ${payload.title}`,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error enviando push:", error);
    return { success: false, error: "Error enviando notificación push" };
  }
}
