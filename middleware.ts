import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const publicPaths = ["/login", "/register", "/api/auth"];
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = token.role;

  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return redirectToRoleDashboard(role, request);
  }

  if (pathname.startsWith("/super-admin") && role !== "SUPER_ADMIN") {
    return redirectToRoleDashboard(role, request);
  }

  if (pathname.startsWith("/admin") && role !== "ADMIN") {
    return redirectToRoleDashboard(role, request);
  }

  if (pathname.startsWith("/staff") && role !== "STAFF") {
    return redirectToRoleDashboard(role, request);
  }

  if (pathname.startsWith("/user") && role !== "USER") {
    return redirectToRoleDashboard(role, request);
  }

  return NextResponse.next();
}

function redirectToRoleDashboard(role: string, request: NextRequest) {
  switch (role) {
    case "SUPER_ADMIN":
      return NextResponse.redirect(new URL("/super-admin", request.url));
    case "ADMIN":
      return NextResponse.redirect(new URL("/admin", request.url));
    case "STAFF":
      return NextResponse.redirect(new URL("/staff", request.url));
    default:
      return NextResponse.redirect(new URL("/user", request.url));
  }
}

export const config = {
  matcher: [
    "/super-admin/:path*",
    "/admin/:path*",
    "/staff/:path*",
    "/user/:path*",
    "/login",
    "/register"
  ]
};
