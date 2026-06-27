"use client";
// components/Navbar.tsx
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { TrendingUp, Moon, Sun, Menu, X } from "lucide-react";

const NAV_LINKS = [
  { href: "/",       label: "Home"           },
  { href: "/learn",  label: "Learn the Metrics" },
  { href: "/lookup", label: "Stock Lookup"    },
];

export default function Navbar() {
  const pathname             = usePathname();
  const [dark,  setDark]     = useState(false);
  const [open,  setOpen]     = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Sync with system preference on mount
  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored === "dark" || (!stored && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-200 ${
        scrolled
          ? "bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200/80 dark:border-gray-800/80 shadow-sm"
          : "bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800"
      }`}
    >
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
            <TrendingUp className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-gray-900 dark:text-white text-lg tracking-tight">
            Stock<span className="text-indigo-600">Sense</span>
            <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 ml-1 align-middle">AI</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((o) => !o)}
            className="sm:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="sm:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-4 pb-3">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors my-0.5 ${
                  active
                    ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
