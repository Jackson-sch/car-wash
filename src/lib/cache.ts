/**
 * Helper de caché para Next.js 16 Cache Components.
 *
 * Proporciona perfiles predefinidos de cacheLife y helpers para marcar
 * funciones de obtención de datos con tags de invalidación.
 *
 * Uso típico:
 * ```tsx
 * async function getCachedData(sucursalId: string) {
 *   'use cache'
 *   cacheLife('minutes')    // ← perfil predefinido
 *   cacheTag('dashboard')   // ← tag para invalidación
 *   return await db.query(...)
 * }
 * ```
 *
 * Los tags se usan con revalidateTag() o updateTag() después de mutaciones
 * para invalidar el caché manualmente.
 */
import { cacheTag as _cacheTag, cacheLife as _cacheLife } from "next/cache";

export function cacheTag(...tags: string[]) {
  try {
    _cacheTag(...tags);
  } catch {
    // Safe fallback when cacheComponents is not enabled
  }
}

function cacheLife(profile: Parameters<typeof _cacheLife>[0]) {
  try {
    _cacheLife(profile);
  } catch {
    // Safe fallback when cacheComponents is not enabled
  }
}
