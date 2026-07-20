/**
 * Generador de avisos y notificaciones de WhatsApp para clientes de autolavado.
 */

interface NotificationParams {
  clienteNombre: string;
  clienteTelefono: string | null;
  placa: string;
  vehiculoInfo?: string;
  servicioNombre: string;
  total: number;
  sucursalNombre: string;
  nroTicket?: string | null;
}

export function formatWhatsAppMessage({
  clienteNombre,
  placa,
  vehiculoInfo,
  servicioNombre,
  total,
  sucursalNombre,
  nroTicket,
}: NotificationParams): string {
  const ticketInfo = nroTicket ? ` (Ticket #${nroTicket})` : "";
  const autoStr = vehiculoInfo ? ` (${vehiculoInfo})` : "";

  return (
    `¡Hola ${clienteNombre}! 🚗✨\n\n` +
    `Tu vehículo con placa *${placa}*${autoStr} ya ha finalizado su servicio *${servicioNombre}*${ticketInfo} y está *listo para ser recogido* en nuestra sucursal *${sucursalNombre}*.\n\n` +
    `💰 Total a pagar: *S/ ${total.toFixed(2)}*\n\n` +
    `¡Muchas gracias por tu preferencia!`
  );
}

export function buildWhatsAppUrl(telefono: string | null, text: string): string {
  if (!telefono) return "#";

  let cleanPhone = telefono.replace(/\D/g, "");
  // Asumir prefijo +51 si tiene 9 dígitos (Perú)
  if (cleanPhone.length === 9) {
    cleanPhone = `51${cleanPhone}`;
  }

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}
