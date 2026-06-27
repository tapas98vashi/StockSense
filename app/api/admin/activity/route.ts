// app/api/admin/activity/route.ts
// Most recent login events for the admin activity feed.
// Requires authenticated ADMIN session.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user)                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" },     { status: 403 });

  const events = await prisma.loginEvent.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id:        true,
      provider:  true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  return NextResponse.json({ events });
}
