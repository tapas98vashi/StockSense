"use client";
// app/learn/page.tsx — Feature 1: Educational Hub
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight } from "lucide-react";
import MetricCard from "@/components/MetricCard";
import { METRIC_CONFIGS } from "@/lib/valuationBands";

// Illustrative values shown on the gauges for each metric's worked example
const EXAMPLE_VALUES: Record<string, number> = {
  pe:        25,   // The worked example: P/E = 25×
  forwardPe: 20,   // The worked example: Fwd P/E = 20×
  peg:       1.25, // The worked example: PEG = 1.25
  pb:        1.5,  // The worked example: P/B = 1.5×
  roe:       20,   // The worked example: ROE = 20%
  divYield:  5.0,  // The worked example: Dividend Yield = 5.0%
};

const ANCHOR_LINKS = METRIC_CONFIGS.map((m) => ({
  id:    m.id,
  label: m.shortName,
}));

function StickyNav({ activeId }: { activeId: string }) {
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="sticky top-[4.5rem] z-30 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-3 -mx-4 px-4 mb-10">
      <div className="max-w-3xl mx-auto flex items-center gap-1 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 shrink-0 mr-2">Jump to:</span>
        {ANCHOR_LINKS.map((l) => (
          <button
            key={l.id}
            onClick={() => scrollTo(l.id)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              activeId === l.id
                ? "bg-indigo-600 text-white"
                : "text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Track which section is in viewport for the sticky nav
function useSectionObserver(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? "");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(id); },
        { rootMargin: "-20% 0px -60% 0px" },
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [ids]);

  return active;
}

export default function LearnPage() {
  const ids    = METRIC_CONFIGS.map((m) => m.id);
  const active = useSectionObserver(ids);

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Page hero */}
      <section className="px-4 py-16 bg-gradient-to-b from-indigo-50 to-white dark:from-indigo-950/30 dark:to-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-5">
              <BookOpen className="w-3.5 h-3.5" />
              Educational Hub
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-4">
              Learn the Metrics
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl mx-auto">
              Six essential stock metrics — explained clearly, with formulas,
              examples, and interactive gauges showing where each benchmark sits.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <div className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <StickyNav activeId={active} />

          {/* Intro note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mb-10 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 flex gap-3"
          >
            <span className="text-blue-500 mt-0.5 shrink-0">ℹ️</span>
            <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
              The valuation bands on this page reflect{" "}
              <strong>general industry conventions</strong> based on historical market data — they
              are not official rules, regulations, or pronouncements by the SEC or any regulatory
              body. Think of them as useful starting points for comparison, not hard cutoffs.
            </p>
          </motion.div>

          {/* Metric cards */}
          <div className="space-y-10">
            {METRIC_CONFIGS.map((config, i) => (
              <MetricCard
                key={config.id}
                config={config}
                exampleValue={EXAMPLE_VALUES[config.id]}
                index={i}
              />
            ))}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.55 }}
            className="mt-14 text-center"
          >
            <p className="text-gray-500 dark:text-gray-400 mb-5">
              Ready to apply what you&apos;ve learned?
            </p>
            <a
              href="/lookup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-md"
            >
              Look Up a Real Stock
              <ChevronRight className="w-4 h-4" />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
