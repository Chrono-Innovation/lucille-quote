import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE, AUTH_TOKEN } from "@/lib/auth";

export function middleware(request: NextRequest) {
  const isAuthenticated =
    request.cookies.get(AUTH_COOKIE)?.value === AUTH_TOKEN;
  const isLoginPage = request.nextUrl.pathname === "/login";

  if (!isAuthenticated && !isLoginPage) {
    const loginUrl = new URL("/login", request.url);
    const next = request.nextUrl.pathname + request.nextUrl.search;
    if (next && next !== "/") loginUrl.searchParams.set("next", next);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|chrono-logo.png|shapes/).*)",
  ],
};
