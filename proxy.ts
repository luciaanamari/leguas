import { NextResponse, type NextRequest } from "next/server";
import { verifySessionToken } from "@/lib/auth/edge";

const STUDENT_AUTH_PREFIXES = ["/trilhas", "/perfil"];
const ADMIN_PREFIXES = ["/admin"];
const ADMIN_LOGIN_PATH = "/admin/login";
const STUDENT_LOGIN_PATH = "/entrar";

function isPathInPrefixes(pathname: string, prefixes: string[]) {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Rotas admin (excluir /admin/login do guard)
  if (isPathInPrefixes(pathname, ADMIN_PREFIXES) && pathname !== ADMIN_LOGIN_PATH) {
    const token = req.cookies.get("legua_admin_session")?.value;
    const secret = process.env.ADMIN_SESSION_SECRET;
    const valid = token && secret ? await verifySessionToken(token, secret) : null;
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = ADMIN_LOGIN_PATH;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Rotas autenticadas do estudante
  if (isPathInPrefixes(pathname, STUDENT_AUTH_PREFIXES)) {
    const token = req.cookies.get("legua_session")?.value;
    const secret = process.env.SESSION_SECRET;
    const valid = token && secret ? await verifySessionToken(token, secret) : null;
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = STUDENT_LOGIN_PATH;
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Excluir:
     * - /api/* (route handlers fazem sua propria checagem)
     * - /_next/static, /_next/image, favicon, robots
     */
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)",
  ],
};
