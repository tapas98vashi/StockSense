"use client";
// app/admin/AdminDashboardClient.tsx
// Full admin dashboard UI — summary cards, user table, activity feed.
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Users, UserPlus, Activity, LogIn, Search, ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalUsers:       number;
  newUsersLast7Days: number;
  activeToday:      number;
  signUpBreakdown:  { google: number; credentials: number };
}

interface User {
  id:           string;
  name:         string | null;
  email:        string | null;
  role:         string;
  createdAt:    string;
  lastLoginAt:  string | null;
  signUpMethod: string;
}

interface ActivityEvent {
  id:        string;
  provider:  string;
  createdAt: string;
  user: { name: string | null; email: string | null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs  < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function fmtDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function fmtDateTime(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Design tokens (match app exactly) ───────────────────────────────────────
const cardClass = "rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm";

// ─── Summary card ─────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className={`${cardClass} p-5 flex items-start gap-4`}>
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-extrabold text-gray-900 dark:text-white tabular-nums">{value}</p>
        {sub && <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800 ${className}`} />;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AdminDashboardClient({ adminName }: { adminName: string }) {
  const [stats,    setStats]    = useState<Stats | null>(null);
  const [users,    setUsers]    = useState<User[]>([]);
  const [total,    setTotal]    = useState(0);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [search,   setSearch]   = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy,   setSortBy]   = useState<"createdAt" | "lastLoginAt">("createdAt");
  const [page,     setPage]     = useState(1);
  const [loading,  setLoading]  = useState({ stats: true, users: true, activity: true });

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  // Fetch stats
  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => { setStats(d); setLoading((l) => ({ ...l, stats: false })); })
      .catch(() => setLoading((l) => ({ ...l, stats: false })));
  }, []);

  // Fetch activity
  useEffect(() => {
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then((d) => { setActivity(d.events ?? []); setLoading((l) => ({ ...l, activity: false })); })
      .catch(() => setLoading((l) => ({ ...l, activity: false })));
  }, []);

  // Fetch users
  const fetchUsers = useCallback(() => {
    setLoading((l) => ({ ...l, users: true }));
    const params = new URLSearchParams({ search: debouncedSearch, sortBy, page: String(page) });
    fetch(`/api/admin/users?${params}`)
      .then((r) => r.json())
      .then((d) => {
        setUsers(d.users ?? []);
        setTotal(d.total ?? 0);
        setLoading((l) => ({ ...l, users: false }));
      })
      .catch(() => setLoading((l) => ({ ...l, users: false })));
  }, [debouncedSearch, sortBy, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const perPage  = 20;
  const pageCount = Math.max(1, Math.ceil(total / perPage));

  const breakdownData = stats
    ? [
        { name: "Google",       value: stats.signUpBreakdown.google,      fill: "#4285F4" },
        { name: "Email/Password", value: stats.signUpBreakdown.credentials, fill: "#6366f1" },
      ]
    : [];

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-gray-900 dark:text-white text-base tracking-tight">
                Stock<span className="text-indigo-600">Sense</span>
                <span className="text-xs font-semibold text-gray-400 ml-1">AI</span>
              </span>
            </Link>
            <span className="text-gray-300 dark:text-gray-700">|</span>
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
              Signed in as <strong>{adminName}</strong>
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Page title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">User Activity</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Read-only monitoring dashboard.</p>
        </motion.div>

        {/* Summary cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {loading.stats ? (
            Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)
          ) : (
            <>
              <StatCard icon={Users}     label="Total Users"       value={stats?.totalUsers ?? 0}       color="bg-indigo-600"  />
              <StatCard icon={UserPlus}  label="New (Last 7 Days)" value={stats?.newUsersLast7Days ?? 0} color="bg-violet-600"  sub="registered accounts" />
              <StatCard icon={Activity}  label="Active Today"      value={stats?.activeToday ?? 0}       color="bg-emerald-600" sub="unique sign-ins" />
              <StatCard icon={LogIn}     label="Sign-up Methods"   value={`${stats?.signUpBreakdown.google ?? 0}G · ${stats?.signUpBreakdown.credentials ?? 0}E`} color="bg-orange-500" sub="Google · Email" />
            </>
          )}
        </motion.div>

        {/* Sign-up breakdown chart */}
        {!loading.stats && breakdownData.some((d) => d.value > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className={`${cardClass} p-6`}
          >
            <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Sign-up Method Breakdown</h2>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={breakdownData} barSize={48}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, background: "var(--tw-bg-gray-900, #111827)", border: "1px solid #374151", borderRadius: 8 }}
                    cursor={{ fill: "rgba(99,102,241,0.06)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                    {breakdownData.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        )}

        {/* Main content: table + activity feed side by side on large screens */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* User table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
            className={`${cardClass} lg:col-span-2 overflow-hidden`}
          >
            {/* Table toolbar */}
            <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">
                Registered Users
                <span className="ml-2 text-xs font-normal text-gray-400 dark:text-gray-500">{total} total</span>
              </h2>
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search…"
                    className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 w-36"
                  />
                </div>
                {/* Sort */}
                <select
                  value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value as "createdAt" | "lastLoginAt"); setPage(1); }}
                  className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="createdAt">Sort: Joined</option>
                  <option value="lastLoginAt">Sort: Last Login</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    {["Name / Email", "Method", "Role", "Joined", "Last Login"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading.users
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i} className="border-b border-gray-100 dark:border-gray-800">
                          {Array.from({ length: 5 }).map((__, j) => (
                            <td key={j} className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                          ))}
                        </tr>
                      ))
                    : users.map((u) => (
                        <tr key={u.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-5 py-3">
                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{u.name ?? "—"}</p>
                            <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[160px]">{u.email ?? "—"}</p>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              u.signUpMethod === "google"
                                ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
                                : "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                            }`}>
                              {u.signUpMethod === "google" ? "Google" : "Email"}
                            </span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              u.role === "ADMIN"
                                ? "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {fmtDate(u.createdAt)}
                          </td>
                          <td className="px-5 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            {fmtDateTime(u.lastLoginAt)}
                          </td>
                        </tr>
                      ))}
                  {!loading.users && users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500 italic">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pageCount > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 dark:border-gray-800">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  Page {page} of {pageCount}
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page <= 1}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={page >= pageCount}
                    className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {/* Activity feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={`${cardClass} overflow-hidden`}
          >
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700/60">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" />
                Recent Sign-ins
              </h2>
            </div>

            <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[520px] overflow-y-auto">
              {loading.activity
                ? Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="px-5 py-3 space-y-1.5">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  ))
                : activity.length === 0
                  ? <p className="px-5 py-8 text-center text-sm text-gray-400 italic">No activity yet.</p>
                  : activity.map((ev) => (
                      <div key={ev.id} className="px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {ev.user.name ?? ev.user.email ?? "Unknown"}
                        </p>
                        <div className="flex items-center justify-between mt-0.5">
                          <span className={`text-xs font-medium ${ev.provider === "google" ? "text-blue-500" : "text-indigo-500"}`}>
                            via {ev.provider === "google" ? "Google" : "Email"}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {timeAgo(ev.createdAt)}
                          </span>
                        </div>
                      </div>
                    ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
