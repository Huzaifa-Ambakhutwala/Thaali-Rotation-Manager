import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// Do not import `@/auth` here: middleware runs on the Edge runtime and would bundle
// `openid-client` (Google OAuth), which is not Edge-safe and throws at runtime.

export async function middleware(request: NextRequest) {
  const { nextUrl } = request;
  const pathname = nextUrl.pathname;

  if (pathname === "/api/auth/error") {
    const url = nextUrl.clone();
    url.pathname = "/auth/error";
    return NextResponse.redirect(url);
  }

  const isAdminRoute = pathname.startsWith("/admin");
  const isDashboardRoute = pathname.startsWith("/dashboard");

  if (!isAdminRoute && !isDashboardRoute) return NextResponse.next();

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
  });
  const role = token?.role ?? null;

  if (!role) {
    const url = new URL("/", nextUrl);
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAdminRoute && role !== "admin") return NextResponse.redirect(new URL("/dashboard", nextUrl));
  if (isDashboardRoute && role === "admin")
    return NextResponse.redirect(new URL("/admin", nextUrl));

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*", "/api/auth/error"],
};
