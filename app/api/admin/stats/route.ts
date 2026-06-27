// app/api/admin/stats/route.ts
// Summary statistics for the admin dashboard.
// Requires authenticated ADMIN session — checked server-side independently of middleware.
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user)            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" },     { status: 403 });

  const now        = new Date();
  const sevenDaysAgo = new Date(now); sevenDaysAgo.setDate(now.getDate() - 7);
  const todayStart   = new Date(now); todayStart.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    newUsersLast7Days,
    activeTodayIds,
    googleCount,
    credentialsCount,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.loginEvent.findMany({
      where:  { createdAt: { gte: todayStart } },
      select: { userId: true },
      distinct: ["userId"],
    }),
    prisma.account.count({ where: { provider: "google" } }),
    prisma.user.count({ where: { password: { not: null } } }),
  ]);

  return NextResponse.json({
    totalUsers,
    newUsersLast7Days,
    activeToday: activeTodayIds.length,
    signUpBreakdown: {
      google:      googleCount,
      credentials: credentialsCount,
    },
  });
}
