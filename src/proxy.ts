import { NextRequest, NextResponse } from 'next/server';
import { auth } from './lib/auth/config';
import { updateSession } from './lib/supabase-proxy';

export async function proxy(request: NextRequest) {
  // 1. Actualizar la sesión de Supabase (refrescar cookies si es necesario)
  const supabaseResponse = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Rutas que requieren autenticación
  const isDashboardRoute = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/clientes') ||
    pathname.startsWith('/vehiculos') ||
    pathname.startsWith('/servicios') ||
    pathname.startsWith('/ordenes') ||
    pathname.startsWith('/caja') ||
    pathname.startsWith('/reportes') ||
    pathname.startsWith('/empleados') ||
    pathname.startsWith('/inventario') ||
    pathname.startsWith('/configuracion');

  if (isDashboardRoute) {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = session.user.rol;

    // Proteger rutas de administración
    if (pathname.startsWith('/configuracion') && userRole !== 'admin') {
      const dashboardUrl = new URL('/dashboard', request.url);
      return NextResponse.redirect(dashboardUrl);
    }

    // Lavadores solo acceden a órdenes
    if (userRole === 'lavador' && !pathname.startsWith('/ordenes')) {
      const ordenesUrl = new URL('/ordenes', request.url);
      return NextResponse.redirect(ordenesUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Coincidir con todas las rutas de solicitud excepto:
     * - api/auth (rutas de autenticación de Better-Auth)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico, sitemap.xml, robots.txt (archivos de metadatos)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
