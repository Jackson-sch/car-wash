import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Normaliza y parsea cualquier entrada de fecha (String ISO, Date o Timestamp) a un objeto Date seguro.
 */
export function parseDate(dateInput: string | Date | number): Date {
  if (dateInput instanceof Date) return dateInput;
  if (typeof dateInput === "number") return new Date(dateInput);
  return parseISO(dateInput);
}

/**
 * Format a number as Peruvian currency (PEN)
 * Nota: date-fns no maneja monedas, por lo que se mantiene Intl.NumberFormat
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-PE", {
    style: "currency",
    currency: "PEN",
  }).format(amount);
}

/* 
 * Formatea una fecha a una fecha (e.g., "16-12-2025")
 */
export function formatDate(dateStr: string | Date, pattern = "dd-MM-yyyy"): string {
  const date = parseDate(dateStr);
  return format(date, pattern, { locale: es });
}

/**
 * Format a date string to short format (e.g., "lun 16")
 */
export function formatShortDate(dateStr: string | Date, pattern = "EEE d"): string {
  const date = parseDate(dateStr);
  // 'EEE' da el día abreviado, 'd' el número del día
  return format(date, pattern, { locale: es });
}

/**
 * Format a date string to long format (e.g., "lunes, 16 de diciembre")
 */
export function formatLongDate(dateStr: string | Date, pattern = "EEEE, d 'de' MMMM"): string {
  const date = parseDate(dateStr);
  // 'EEEE' día completo, 'MMMM' mes completo. Se escapa 'de' con comillas simples.
  return format(date, pattern, { locale: es });
}

/**
 * Format a date to month and year (e.g., "diciembre de 2025")
 */
export function formatMonthYear(date: string | Date, pattern = "MMMM 'de' yyyy"): string {
  const dateObj = parseDate(date);
  return format(dateObj, pattern, { locale: es });
}

/* 
 * Formatea una fecha a una hora (e.g., "16:30")
 */
export function formatTime(date: string | Date, pattern = "HH:mm:ss"): string {
  const dateObj = parseDate(date);
  return format(dateObj, pattern, { locale: es });
}

// --- Helpers ---
/**
 * Capitaliza un texto (Title Case). 
 * Útil para nombres de estudiantes.
 * Ejemplo: "sebastián espinola" -> "Sebastián Espinola"
 */
export function formatTitleCase(text: string): string {
  if (!text) return "";
  
  return text
    .toLowerCase()
    .split(/\s+/)
    .map(word => {
      if (word.length === 0) return "";
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ");
}

/**
 * Obtiene las iniciales a partir de un nombre y un apellido
 */
export function getInitials(nombre: string, apellido: string): string {
  const cleanName = (nombre || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const cleanLast = (apellido || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
  const firstInitial = cleanName ? Array.from(cleanName)[0] : "";
  const lastInitial = cleanLast ? Array.from(cleanLast)[0] : "";
  return (firstInitial + lastInitial).toUpperCase();
}

/**
 * Formatea un método de pago a su versión amigable
 */
export function formatPaymentMethod(method: string): string {
  const map: Record<string, string> = {
    CASH: "Efectivo",
    CARD: "Tarjeta",
    TRANSFER: "Transferencia",
    YAPE: "Yape",
    PLIN: "Plin",
    OTHER: "Otro",
  };
  return map[method?.toUpperCase()] || method;
}