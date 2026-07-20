import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';
import { auth } from './lib/auth/config';

export async function proxy(request: NextRequest) {
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
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (e) {
      console.error('Error al obtener sesión en proxy:', e);
      session = null;
    }

    if (!session) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = session.user.rol;

    // Superadmin redirigido a su panel
    if (userRole === 'superadmin' && !pathname.startsWith('/superadmin')) {
      const superadminUrl = new URL('/superadmin', request.url);
      return NextResponse.redirect(superadminUrl);
    }

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

  return NextResponse.next();
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
