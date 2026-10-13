"use client";

/**
 * Emite un evento en la ventana actual y sincroniza a través de localStorage
 * para que el Header y cualquier otra vista actualicen el estado de la caja de inmediato.
 */
export function notifyCajaStatusChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("caja-status-changed"));
    try {
      localStorage.setItem("caja-status-updated", Date.now().toString());
    } catch {
      // ignore localStorage exceptions
    }
  }
}
