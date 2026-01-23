import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1️⃣ Public routes
  const publicPaths = ["/login", "/register", "/api/auth"];
  if (
    publicPaths.some(path => pathname.startsWith(path)) ||
    pathname === "/"
  ) {
    return NextResponse.next();
  }

  const token = await getToken({ req: request });

  // 2️⃣ If NOT authenticated → redirect to login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const role = token.role; // SUPER_ADMIN | ADMIN | STAFF | USER

  // 3️⃣ Prevent logged-in users from visiting auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return redirectToRoleDashboard(role, request);
  }

  // 4️⃣ Role-based route protection
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

// 🔁 Central redirect helper
function redirectToRoleDashboard(role: string, request: NextRequest) {
  switch (role) {
    case "SUPER_ADMIN":
      return NextResponse.redirect(new URL("/super-admin/dashboard", request.url));
    case "ADMIN":
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    case "STAFF":
      return NextResponse.redirect(new URL("/staff/dashboard", request.url));
    default:
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
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
