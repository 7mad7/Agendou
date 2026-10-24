import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  const isDashboardRoute =
    pathname === "/dashboard" || pathname.startsWith("/dashboard/");
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  // Proteção de rotas /dashboard/*: apenas usuários autenticados com role MERCHANT
  if (isDashboardRoute) {
    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== "MERCHANT") {
      // Usuário CLIENT não pode acessar rotas /dashboard/*
      return NextResponse.redirect(new URL("/explorar", request.url));
    }

    return NextResponse.next();
  }

  // Redirecionamento automático caso usuário já autenticado acesse páginas de login/registro
  if (isAuthRoute && session) {
    const defaultDestination =
      session.role === "MERCHANT" ? "/dashboard" : "/explorar";
    return NextResponse.redirect(new URL(defaultDestination, request.url));
  }

  // Demais rotas (incluindo /explorar para CLIENT e MERCHANT) permanecem acessíveis
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register", "/forgot-password"],
};

