"use client";
// app/login/page.tsx
// Sign In / Create Account page — matches existing app design system exactly.
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

// ─── Shared design tokens (match existing app exactly) ────────────────────────
const cardClass =
  "rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm";
const inputClass =
  "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all";
const btnPrimary =
  "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm transition-colors shadow-sm";
const btnSecondary =
  "w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-colors shadow-sm";

// ─── Google Icon SVG ─────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"/>
      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"/>
    </svg>
  );
}

// ─── Tab indicator ────────────────────────────────────────────────────────────
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
        active
          ? "bg-indigo-600 text-white shadow-sm"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
      }`}
    >
      {children}
    </button>
  );
}

// ─── Error / Success inline messages ─────────────────────────────────────────
function InlineError({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 text-sm text-red-700 dark:text-red-400">
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      {message}
    </div>
  );
}

function InlineSuccess({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 text-sm text-emerald-700 dark:text-emerald-400">
      <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
      {message}
    </div>
  );
}

// ─── Sign In form ─────────────────────────────────────────────────────────────
function SignInForm({ callbackUrl }: { callbackUrl: string }) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
    } else {
      window.location.href = callbackUrl;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <InlineError message={error} />}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
          Password
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}

// ─── Register form ────────────────────────────────────────────────────────────
function RegisterForm({ callbackUrl }: { callbackUrl: string }) {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);

    const res = await fetch("/api/register", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error ?? "Registration failed.");
      return;
    }

    // Auto sign-in after successful registration
    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (signInRes?.error) {
      setSuccess(true); // registered but auto-login failed — tell user to sign in
    } else {
      window.location.href = callbackUrl;
    }
  }

  if (success) {
    return (
      <InlineSuccess message="Account created! Please sign in with your new credentials." />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <InlineError message={error} />}
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
          Name
        </label>
        <input
          type="text"
          required
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your full name"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
          Email
        </label>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className={inputClass}
        />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wide">
          Password <span className="text-gray-400 dark:text-gray-500 font-normal normal-case">(min. 8 characters)</span>
        </label>
        <div className="relative">
          <input
            type={show ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            aria-label={show ? "Hide password" : "Show password"}
          >
            {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
      <button type="submit" disabled={loading} className={btnPrimary}>
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {loading ? "Creating account…" : "Create Account"}
      </button>
    </form>
  );
}

// ─── Main login card ──────────────────────────────────────────────────────────
function LoginCard() {
  const searchParams = useSearchParams();
  const callbackUrl  = searchParams.get("callbackUrl") ?? "/";
  const [tab, setTab] = useState<"signin" | "register">("signin");
  const [googleLoading, setGoogleLoading] = useState(false);

  return (
    <div className={`${cardClass} w-full max-w-md mx-auto overflow-hidden`}>
      {/* Card header */}
      <div className="px-7 pt-8 pb-6 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border-b border-gray-200 dark:border-gray-700/60 text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-gray-900 dark:text-white text-xl tracking-tight">
            Stock<span className="text-indigo-600">Sense</span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-1 align-middle">AI</span>
          </span>
        </Link>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign in to access Stock Lookup &amp; your saved activity.
        </p>
      </div>

      <div className="p-7 space-y-5">
        {/* Tab switcher */}
        <div className="flex gap-1 p-1 rounded-xl bg-gray-100 dark:bg-gray-800">
          <TabButton active={tab === "signin"}   onClick={() => setTab("signin")}>Sign In</TabButton>
          <TabButton active={tab === "register"} onClick={() => setTab("register")}>Create Account</TabButton>
        </div>

        {/* Google button */}
        <button
          type="button"
          disabled={googleLoading}
          onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl }); }}
          className={btnSecondary}
        >
          {googleLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <GoogleIcon />}
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium shrink-0">
            or continue with email
          </span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        {/* Form (animated tab switch) */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {tab === "signin"
              ? <SignInForm   callbackUrl={callbackUrl} />
              : <RegisterForm callbackUrl={callbackUrl} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer note */}
      <div className="px-7 pb-6 text-center">
        <p className="text-xs text-gray-400 dark:text-gray-500">
          For educational use only.{" "}
          <Link href="/" className="text-indigo-500 hover:underline">Back to home</Link>
        </p>
      </div>
    </div>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/20 dark:to-gray-950">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md"
      >
        <Suspense>
          <LoginCard />
        </Suspense>
      </motion.div>
    </div>
  );
}
