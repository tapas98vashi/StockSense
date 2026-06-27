// app/admin/page.tsx
// Admin Dashboard — server component performs role check (defense layer 2 of 3).
// Client components fetch data from /api/admin/* routes (layer 3 is in those routes).
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminDashboardClient from "./AdminDashboardClient";

export const metadata = { title: "Admin Dashboard — StockSense AI" };

export default async function AdminPage() {
  // Defense layer 2: server-side role verification, independent of middleware
  const session = await auth();
  if (!session?.user)                redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "ADMIN") redirect("/");

  return <AdminDashboardClient adminName={session.user.name ?? session.user.email ?? "Admin"} />;
}
