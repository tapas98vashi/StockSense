"use client";
// components/SearchBar.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Suggestion {
  symbol:      string;
  description: string;
  type:        string;
}

interface SearchBarProps {
  initialValue?: string;
  onSelect?: (ticker: string) => void;
  className?:   string;
  placeholder?: string;
  autoFocus?:   boolean;
}

export default function SearchBar({
  initialValue = "",
  onSelect,
  className    = "",
  placeholder  = "Search ticker or company name… (e.g. AAPL)",
  autoFocus    = false,
}: SearchBarProps) {
  const router               = useRouter();
  const [query,       setQuery]       = useState(initialValue);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [open,        setOpen]        = useState(false);
  const [activeIdx,   setActiveIdx]   = useState(-1);
  const inputRef                      = useRef<HTMLInputElement>(null);
  const debounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 1) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSuggestions(data.results ?? []);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(query), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, fetchSuggestions]);

  function handleSelect(symbol: string) {
    setQuery(symbol);
    setOpen(false);
    setActiveIdx(-1);
    if (onSelect) {
      onSelect(symbol);
    } else {
      router.push(`/lookup?ticker=${encodeURIComponent(symbol)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIdx >= 0 && suggestions[activeIdx]) {
        handleSelect(suggestions[activeIdx].symbol);
      } else if (query.trim()) {
        handleSelect(query.trim().toUpperCase());
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          autoFocus={autoFocus}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIdx(-1);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          placeholder={placeholder}
          className="w-full pl-11 pr-12 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-600 transition-all shadow-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />}
          {query && !loading && (
            <button
              onMouseDown={(e) => { e.preventDefault(); setQuery(""); setSuggestions([]); setOpen(false); }}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button
              key={s.symbol}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s.symbol); }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                i === activeIdx
                  ? "bg-indigo-50 dark:bg-indigo-950/40"
                  : "hover:bg-gray-50 dark:hover:bg-gray-800"
              } ${i < suggestions.length - 1 ? "border-b border-gray-100 dark:border-gray-800" : ""}`}
            >
              <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm w-16 shrink-0 tabular-nums">
                {s.symbol}
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{s.description}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
