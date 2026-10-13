/**
 * Utilidades para generación de enlaces de WhatsApp para WashMaster Pro
 */

export interface WhatsAppNotificationData {
  clienteNombre: string;
  clienteTelefono?: string | null;
  placa: string;
  vehiculoMarca?: string | null;
  vehiculoModelo?: string | null;
  servicios?: string[];
  total?: number | string | null;
  nroTicket?: string | null;
  ordenId: string;
  sucursalNombre?: string;
  sucursalTelefono?: string;
}

/**
 * Normaliza un número telefónico de Perú para WhatsApp (prefijo 51)
 */
export function formatPeruPhoneNumber(phone?: string | null): string | null {
  if (!phone) return null;
  // Limpiar espacios, guiones, paréntesis y símbolos
  const cleaned = phone.replace(/\D/g, "");
  if (!cleaned) return null;

  // Si ya tiene el código de país de Perú (51) y 11 dígitos en total (519XXXXXXXX)
  if (cleaned.startsWith("51") && cleaned.length === 11) {
    return cleaned;
  }

  // Si es un celular estándar de Perú de 9 dígitos (9XXXXXXXX)
  if (cleaned.length === 9 && cleaned.startsWith("9")) {
    return `51${cleaned}`;
  }

  // Si tiene otra longitud pero es válido, retornar tal cual con prefijo
  return cleaned.startsWith("51") ? cleaned : `51${cleaned}`;
}

/**
 * Genera el enlace de WhatsApp para notificar el INGRESO del vehículo al taller
 */
export function getWhatsAppIngresoUrl(data: WhatsAppNotificationData): string | null {
  const phone = formatPeruPhoneNumber(data.clienteTelefono);
  if (!phone) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const trackingUrl = `${appUrl}/consulta/${data.nroTicket || data.ordenId.substring(0, 8)}`;
  const vehiculoDesc = [data.vehiculoMarca, data.vehiculoModelo].filter(Boolean).join(" ") || "su vehículo";
  const sucursal = data.sucursalNombre || "WashMaster Pro";

  const message = [
    `🚗💦 *¡Hola ${data.clienteNombre.trim()}!*`,
    ``,
    `Tu *${vehiculoDesc}* con placa *${data.placa.toUpperCase()}* ya ingresó a las bahías de lavado en *${sucursal}*.`,
    ``,
    data.servicios && data.servicios.length > 0 ? `*Servicios solicitados:*` : ``,
    data.servicios && data.servicios.length > 0 ? data.servicios.map((s) => `• ${s}`).join("\n") : ``,
    ``,
    `📱 Puedes consultar el avance de tu lavado en tiempo real aquí:`,
    `${trackingUrl}`,
    ``,
    `Te avisaremos en cuanto esté listo para entrega. ¡Gracias por confiar en nosotros! ✨`,
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera el enlace de WhatsApp para notificar que el VEHÍCULO ESTÁ LISTO para retiro
 */
export function getWhatsAppListoUrl(data: WhatsAppNotificationData): string | null {
  const phone = formatPeruPhoneNumber(data.clienteTelefono);
  if (!phone) return null;

  const vehiculoDesc = [data.vehiculoMarca, data.vehiculoModelo].filter(Boolean).join(" ") || "su vehículo";
  const sucursal = data.sucursalNombre || "WashMaster Pro";
  const totalParsed = typeof data.total === "number" ? data.total : parseFloat(String(data.total || "0"));
  const totalFormatted = !isNaN(totalParsed) && totalParsed > 0 ? `S/ ${totalParsed.toFixed(2)}` : null;

  const message = [
    `🎉✨ *¡Tu auto está listo para entrega!*`,
    ``,
    `Hola *${data.clienteNombre.trim()}*, el servicio de tu *${vehiculoDesc}* (*${data.placa.toUpperCase()}*) ha culminado con éxito.`,
    ``,
    totalFormatted ? `💰 *Total a pagar:* ${totalFormatted}` : ``,
    ``,
    `Ya puedes acercarte a la caja de *${sucursal}* para recoger tu vehículo y tus llaves. 🔑🚘`,
    ``,
    `¡Esperamos que disfrutes de tu auto reluciente!`,
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera el enlace de WhatsApp con el resumen de COMPROBANTE/TICKET
 */
export function getWhatsAppTicketUrl(data: WhatsAppNotificationData): string | null {
  const phone = formatPeruPhoneNumber(data.clienteTelefono);
  if (!phone) return null;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (typeof window !== "undefined" ? window.location.origin : "");
  const trackingUrl = `${appUrl}/consulta/${data.nroTicket || data.ordenId.substring(0, 8)}`;
  const sucursal = data.sucursalNombre || "WashMaster Pro";

  const message = [
    `📄 *Comprobante de Servicio - ${sucursal}*`,
    ``,
    `Estimado(a) *${data.clienteNombre.trim()}*, adjuntamos los detalles de su orden *#${data.nroTicket || data.ordenId.substring(0, 8).toUpperCase()}*:`,
    `• Placa: *${data.placa.toUpperCase()}*`,
    data.total ? `• Total: *S/ ${parseFloat(String(data.total)).toFixed(2)}*` : ``,
    ``,
    `Puedes descargar o revisar el detalle de tu comprobante aquí:`,
    `${trackingUrl}`,
    ``,
    `¡Muchas gracias por su preferencia!`,
  ]
    .filter((line, index, arr) => !(line === "" && arr[index - 1] === ""))
    .join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
