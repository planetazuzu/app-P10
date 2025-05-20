
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_TOKEN_COOKIE_NAME = 'gmrAuthToken'; // Nombre del cookie que el middleware buscaría

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const authTokenCookie = request.cookies.get(AUTH_TOKEN_COOKIE_NAME)?.value;

  // Si el usuario intenta acceder a /login pero tiene un cookie de autenticación,
  // redirigirlo al dashboard. Esto es útil si se implementara autenticación basada en cookies.
  if (authTokenCookie && pathname.startsWith('/login')) {
     return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Para todas las demás rutas y escenarios, permitir que la petición continúe.
  // La lógica de AuthContext, AppLayout (para rutas protegidas) y HomePage (para la raíz)
  // se encargarán de las redirecciones necesarias basadas en el estado de autenticación
  // gestionado en el cliente (localStorage).
  return NextResponse.next();
}

export const config = {
  // El matcher sigue siendo el mismo, el middleware se ejecutará en estas rutas,
  // pero su lógica ahora es menos propensa a causar bucles con localStorage auth.
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico|images/).*)'],
};
