"use client";
// app/page.tsx — Landing page
import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Search, TrendingUp, ChevronRight, BarChart2, Gauge, Zap } from "lucide-react";

const FEATURES = [
  {
    icon:  BookOpen,
    color: "text-indigo-600 dark:text-indigo-400",
    bg:    "bg-indigo-50 dark:bg-indigo-950/40",
    title: "Learn the Metrics",
    desc:  "Deep-dive into P/E, Forward P/E, and PEG ratio — what they mean, how to calculate them, and how to interpret them with interactive valuation gauges.",
    href:  "/learn",
    cta:   "Start Learning",
  },
  {
    icon:  Search,
    color: "text-violet-600 dark:text-violet-400",
    bg:    "bg-violet-50 dark:bg-violet-950/40",
    title: "Stock Lookup",
    desc:  "Search any U.S. ticker and instantly see live valuation metrics, an auto-generated analysis summary, and the latest earnings & news headlines.",
    href:  "/lookup",
    cta:   "Look Up a Stock",
  },
];

const STATS = [
  { label: "Metrics Explained",   value: "3",    icon: BarChart2 },
  { label: "Data Source",         value: "Live",  icon: Zap       },
  { label: "Valuation Zones",     value: "4",    icon: Gauge     },
];

export default function HomePage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl mx-auto"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold mb-6">
            <TrendingUp className="w-3.5 h-3.5" />
            Educational Stock Analysis Tool
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight mb-6">
            Understand what a{" "}
            <span className="text-indigo-600 dark:text-indigo-400">stock is really worth</span>
          </h1>
          <p className="text-xl text-gray-500 dark:text-gray-400 leading-relaxed max-w-2xl mx-auto mb-10">
            StockSense AI teaches you how to read P/E, Forward P/E, and PEG ratios — then
            lets you apply that knowledge to any live ticker, instantly.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/learn"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm transition-colors shadow-md hover:shadow-lg"
            >
              <BookOpen className="w-4 h-4" />
              Learn the Metrics
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="/lookup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 font-semibold text-sm transition-colors shadow-sm"
            >
              <Search className="w-4 h-4" />
              Look Up a Stock
            </Link>
          </div>
        </motion.div>

        {/* Stats strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex items-center gap-10 mt-20"
        >
          {STATS.map(({ label, value, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon className="w-4 h-4 text-indigo-400" />
                <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{value}</span>
              </div>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-medium">{label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Feature cards */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-2 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.href}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.3 + i * 0.12 }}
            >
              <Link
                href={f.href}
                className="group flex flex-col h-full p-7 rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all duration-200"
              >
                <div className={`inline-flex p-3 rounded-xl ${f.bg} mb-5 self-start`}>
                  <f.icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {f.title}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed flex-1">
                  {f.desc}
                </p>
                <div className="flex items-center gap-1 mt-5 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  {f.cta}
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 py-16 bg-gray-50 dark:bg-gray-900/40 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white text-center mb-2">
            How it works
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-10">
            Three simple steps from zero to informed.
          </p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "01",
                title: "Read the theory",
                desc:  "Visit the Learn page for plain-language explanations of P/E, Forward P/E, and PEG — each with examples and interactive gauges.",
              },
              {
                step: "02",
                title: "Look up any ticker",
                desc:  "Search any U.S. stock symbol. StockSense fetches live fundamentals from Finnhub and displays the key metrics for you.",
              },
              {
                step: "03",
                title: "Read the summary",
                desc:  "Get a rule-based, deterministic valuation commentary that tells you where the stock sits on each metric — no black-box AI.",
              },
            ].map((s) => (
              <div key={s.step} className="relative p-5 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700/60">
                <span className="absolute -top-3 left-4 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">
                  {s.step}
                </span>
                <h3 className="font-semibold text-gray-900 dark:text-white mt-1 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
