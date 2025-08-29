import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { nextUrl, cookies } = req;

  // Verificar se o usuário está logado através dos cookies de sessão
  const sessionToken = cookies.get("next-auth.session-token")?.value || 
                       cookies.get("__Secure-next-auth.session-token")?.value;
  const isLoggedIn = Boolean(sessionToken);

  // Definir rotas públicas (que não requerem autenticação)
  const publicPaths = [
    "/login",
    "/register", 
    "/forgot-password",
    "/reset-password", // Nova rota para reset de senha
  ];

  // Verificar se a rota atual é pública
  const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path));

  // Se está logado e tenta acessar rota pública, redireciona para dashboard
  if (isLoggedIn && isPublicPath) {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  // Se não está logado e tenta acessar rota privada, redireciona para login
  if (!isLoggedIn && !isPublicPath) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  // Permite prosseguir normalmente
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Aplica middleware a todas as rotas exceto:
     * - API routes (/api/*)
     * - Static files (_next/static/*)
     * - Images (_next/image/*)
     * - Arquivos públicos (favicon.ico, robots.txt, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.json|.*\\..*).*)',
  ],
};
