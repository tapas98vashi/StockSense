"use client";
// components/NewsCard.tsx
import { ExternalLink, Calendar, Newspaper } from "lucide-react";
import Image from "next/image";

export interface NewsItem {
  headline: string;
  summary:  string;
  source:   string;
  datetime: number;  // unix timestamp
  url:      string;
  image?:   string;
  id:       number;
}

interface NewsCardProps {
  item:    NewsItem;
  variant?: "earnings" | "regular";
}

function timeAgo(ts: number): string {
  const diff = Date.now() / 1000 - ts;
  if (diff < 3600)   return `${Math.round(diff / 60)}m ago`;
  if (diff < 86400)  return `${Math.round(diff / 3600)}h ago`;
  return `${Math.round(diff / 86400)}d ago`;
}

export default function NewsCard({ item, variant = "regular" }: NewsCardProps) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-4 p-4 rounded-xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-md transition-all duration-200"
    >
      {/* Thumbnail */}
      {item.image && (
        <div className="hidden sm:block w-20 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
          <Image
            src={item.image}
            alt={item.headline}
            width={80}
            height={64}
            className="object-cover w-full h-full"
            unoptimized
          />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        {variant === "earnings" && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 text-xs font-semibold mb-1">
            Earnings / Guidance
          </span>
        )}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
          {item.headline}
        </h3>
        {item.summary && (
          <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
            {item.summary}
          </p>
        )}
        <div className="flex items-center gap-3 pt-1">
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Newspaper className="w-3 h-3" />
            {item.source}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
            <Calendar className="w-3 h-3" />
            {timeAgo(item.datetime)}
          </span>
          <ExternalLink className="w-3 h-3 text-indigo-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </a>
  );
}
