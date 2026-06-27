"use client";
// components/StockHeader.tsx
import { StockData } from "@/lib/financeApi";
import Image from "next/image";
import { TrendingUp, TrendingDown, Building2 } from "lucide-react";

function fmtMarketCap(cap: number | null): string {
  if (cap == null) return "N/A";
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(2)}T`;
  if (cap >= 1_000)     return `$${(cap / 1_000).toFixed(2)}B`;
  return `$${cap.toFixed(0)}M`;
}

function fmtPrice(v: number): string {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
}

interface StockHeaderProps {
  data: StockData;
}

export default function StockHeader({ data }: StockHeaderProps) {
  const isUp      = data.changePct >= 0;
  const ChangeIcon = isUp ? TrendingUp : TrendingDown;

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
      {/* Top bar */}
      <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/60 dark:to-gray-900/60 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex flex-wrap items-center gap-4">
          {/* Logo */}
          <div className="h-14 w-14 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
            {data.logo ? (
              <Image
                src={data.logo}
                alt={`${data.name} logo`}
                width={48}
                height={48}
                className="object-contain"
                unoptimized
              />
            ) : (
              <Building2 className="w-7 h-7 text-gray-400" />
            )}
          </div>

          {/* Company info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white truncate">
                {data.name}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 text-sm font-bold tracking-wide">
                {data.ticker}
              </span>
            </div>
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
              {data.exchange && (
                <span className="text-xs text-gray-500 dark:text-gray-400">{data.exchange}</span>
              )}
              {data.sector && (
                <span className="text-xs text-gray-500 dark:text-gray-400">· {data.sector}</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white tabular-nums">
              {fmtPrice(data.price)}
            </p>
            <div
              className={`inline-flex items-center gap-1 mt-1 text-sm font-semibold ${
                isUp ? "text-emerald-600 dark:text-emerald-400" : "text-red-500 dark:text-red-400"
              }`}
            >
              <ChangeIcon className="w-4 h-4" />
              <span>
                {isUp ? "+" : ""}
                {fmtPrice(data.change)} ({isUp ? "+" : ""}
                {data.changePct.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-gray-200 dark:divide-gray-700/60">
        {[
          { label: "Market Cap",    value: fmtMarketCap(data.marketCap) },
          { label: "Prev Close",    value: fmtPrice(data.previousClose)  },
          { label: "Day High",      value: fmtPrice(data.high)           },
          { label: "Day Low",       value: fmtPrice(data.low)            },
        ].map(({ label, value }) => (
          <div key={label} className="px-5 py-3">
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-gray-800 dark:text-gray-200 tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
