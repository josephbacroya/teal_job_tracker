// middleware.ts
// Architecture note: Next.js middleware runs at the Edge (before any page
// renders). Using it for auth guards means protected routes never render
// server components for unauthenticated users — the redirect happens
// before any DB query or RSC rendering starts.

import { auth } from "@/lib/auth/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { nextUrl, auth: session } = req as any;
  const isLoggedIn = !!session?.user;

  const isAuthPage = nextUrl.pathname.startsWith("/auth");
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
  const isPublic = isAuthPage || isApiAuthRoute;

  // Allow auth pages and API auth routes to pass through
  if (isPublic) return NextResponse.next();

  // Redirect unauthenticated users to login
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/login", nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public/).*)"],
};
