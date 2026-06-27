// middleware.ts
// Defense layer 1 of 3 for admin protection.
// Also gates /api/stock and /api/news behind authentication (Stock Lookup requires sign-in).
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextAuthRequest } from "next-auth";

export default auth(function middleware(req: NextAuthRequest) {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ── Admin protection (defense in depth — server page + API routes also check) ──
  if (pathname.startsWith("/admin")) {
    if (!session?.user) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    if (session.user.role !== "ADMIN") {
      const url = req.nextUrl.clone();
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // ── Stock Lookup API requires auth ───────────────────────────────────────────
  if (pathname.startsWith("/api/stock") || pathname.startsWith("/api/news")) {
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in to use Stock Lookup." }, { status: 401 });
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
