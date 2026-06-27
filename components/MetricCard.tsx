"use client";
// components/MetricCard.tsx
// Educational card used on the Learn page — shows definition, formula,
// worked example, gauge, and caveat for one valuation metric.
import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MetricConfig } from "@/lib/valuationBands";
import ValuationGauge from "./ValuationGauge";

interface MetricCardProps {
  config: MetricConfig;
  exampleValue?: number; // optional numeric to show on the gauge in the example
  index: number;
}

export default function MetricCard({ config, exampleValue, index }: MetricCardProps) {
  const ref    = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      id={config.id}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
      className="scroll-mt-24 rounded-2xl border border-gray-200 dark:border-gray-700/60 bg-white dark:bg-gray-900 shadow-sm overflow-hidden"
    >
      {/* Header stripe */}
      <div className="px-6 py-5 bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/40 dark:to-violet-950/40 border-b border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold">
            {index + 1}
          </span>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
              {config.name}
            </h2>
            <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              {config.shortName}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-7">
        {/* Definition */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
            What it measures
          </h3>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{config.description}</p>
        </section>

        {/* Formula */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
            The Formula
          </h3>
          <div className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <span className="font-mono text-base font-semibold text-indigo-700 dark:text-indigo-300">
              {config.formulaLatex}
            </span>
          </div>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{config.formula}</p>
        </section>

        {/* Worked Example */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            Worked Example
          </h3>
          <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4 space-y-3">
            <div className="flex flex-wrap gap-3">
              {config.example.inputs.map((inp) => (
                <div
                  key={inp.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm"
                >
                  <span className="text-gray-500 dark:text-gray-400">{inp.label}:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{inp.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-indigo-600 dark:text-indigo-400">→</span>
              <span className="font-bold text-gray-900 dark:text-white">{config.example.result}</span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {config.example.interpretation}
            </p>
          </div>
        </section>

        {/* Teaching Point (Forward P/E only) */}
        {config.teachingPoint && (
          <section>
            <div className="flex gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50">
              <span className="text-blue-500 mt-0.5 shrink-0">💡</span>
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                {config.teachingPoint}
              </p>
            </div>
          </section>
        )}

        {/* Gauge */}
        <section>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
            Valuation Gauge
          </h3>
          <ValuationGauge
            metricId={config.id}
            value={exampleValue}
            size="lg"
            showValue={exampleValue != null}
          />
          <p className="mt-2 text-xs text-gray-400 dark:text-gray-500 italic">
            Ranges reflect general industry conventions — not official regulations. See caveat below.
          </p>
        </section>

        {/* Caveat Box */}
        <section>
          <div className="flex gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50">
            <span className="text-amber-500 mt-0.5 shrink-0 text-base">⚠️</span>
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">
                Important Caveat
              </p>
              <p className="text-sm text-amber-800 dark:text-amber-300 leading-relaxed">
                {config.caveat}
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-2 italic">
                These are guidelines, not rules — always compare within the same sector and against the company&apos;s own history.
              </p>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
