// middleware.ts
import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;
  const { pathname } = req.nextUrl;

  // Protected routes — must be logged in
  if (pathname.startsWith("/profile") && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Auth routes — must be logged out
  if ((pathname.startsWith("/login") || pathname.startsWith("/signup")) && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  // Only run middleware on these paths — ignore static files and API routes
  matcher: ["/profile/:path*", "/login", "/signup"],
};