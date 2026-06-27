// app/api/admin/users/route.ts
// Paginated, searchable, sortable user list for the admin dashboard.
// Requires authenticated ADMIN session.
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user)                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" },     { status: 403 });

  const { searchParams } = req.nextUrl;
  const search  = searchParams.get("search")  ?? "";
  const sortBy  = searchParams.get("sortBy")  ?? "createdAt";   // "createdAt" | "lastLoginAt"
  const page    = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));
  const perPage = 20;

  const where = search
    ? {
        OR: [
          { name:  { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const orderBy = sortBy === "lastLoginAt"
    ? { lastLoginAt: "desc" as const }
    : { createdAt:   "desc" as const };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy,
      skip:  (page - 1) * perPage,
      take:  perPage,
      select: {
        id:          true,
        name:        true,
        email:       true,
        role:        true,
        createdAt:   true,
        lastLoginAt: true,
        password:    true,   // used to derive sign-up method, not exposed raw
        accounts: { select: { provider: true } },
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Derive sign-up method without exposing password hash
  const sanitized = users.map(({ password, accounts, ...u }) => ({
    ...u,
    signUpMethod: password
      ? "credentials"
      : accounts.some((a) => a.provider === "google")
        ? "google"
        : "unknown",
  }));

  return NextResponse.json({ users: sanitized, total, page, perPage });
}
