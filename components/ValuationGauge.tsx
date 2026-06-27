"use client";
// components/ValuationGauge.tsx
// Reusable horizontal gauge bar — used by both Learn page (examples) and 
// Lookup page (live metrics).  Reads zone config from /lib/valuationBands.ts
// so the thresholds are always in sync.
import { GAUGE_MAX, getZoneWidths, classifyMetric } from "@/lib/valuationBands";

interface ValuationGaugeProps {
  metricId: "pe" | "forwardPe" | "peg";
  value?: number | null;      // actual value to mark; omit on Learn page for illustrative mode
  showValue?: boolean;
  size?: "sm" | "md" | "lg";
}

const SIZE_MAP = {
  sm: { bar: "h-3",  text: "text-xs", label: "text-[10px]" },
  md: { bar: "h-4",  text: "text-sm", label: "text-xs"     },
  lg: { bar: "h-5",  text: "text-sm", label: "text-xs"     },
};

export default function ValuationGauge({
  metricId,
  value,
  showValue = true,
  size = "md",
}: ValuationGaugeProps) {
  const zones       = getZoneWidths(metricId);
  const max         = GAUGE_MAX[metricId];
  const sz          = SIZE_MAP[size];
  const hasValue    = value != null && isFinite(value) && value > 0;
  const pct         = hasValue ? Math.min(100, (value! / max) * 100) : null;
  const { zone } = classifyMetric(metricId, value);

  return (
    <div className="w-full select-none">
      {/* Zone label row */}
      <div className="flex justify-between mb-1">
        {zones.map((z, zIdx) => (
          <span
            key={z.label}
            className={`${sz.label} font-medium truncate`}
            style={{ color: z.hexColor, width: `${z.pct}%`, textAlign: zIdx === 0 ? "left" : zIdx === zones.length - 1 ? "right" : "center" }}
          >
            {z.label}
          </span>
        ))}
      </div>

      {/* Gauge track */}
      <div className={`relative flex rounded-full overflow-hidden ${sz.bar} bg-gray-200 dark:bg-gray-700`}>
        {zones.map((z, zIdx) => (
          <div
            key={`${z.label}-${zIdx}`}
            style={{ width: `${z.pct}%`, backgroundColor: z.hexColor, opacity: 0.85 }}
          />
        ))}

        {/* Value needle */}
        {pct != null && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white dark:bg-gray-900 shadow-md transition-all duration-700"
            style={{ left: `${pct}%` }}
          />
        )}
      </div>

      {/* Tick labels */}
      <div className="flex justify-between mt-1">
        {zones.map((z, tIdx) => (
          <span
            key={`tick-${tIdx}`}
            className={`${sz.label} text-gray-400 dark:text-gray-500`}
            style={{ width: `${z.pct}%`, textAlign: tIdx === 0 ? "left" : tIdx === zones.length - 1 ? "right" : "center" }}
          >
            {tIdx < zones.length - 1
              ? metricId === "peg"
                ? (tIdx === 0 ? "0" : tIdx === 1 ? "1.0" : "2.0")
                : (tIdx === 0 ? "0" : tIdx === 1 ? "15" : tIdx === 2 ? "25" : "35")
              : `${max}+`}
          </span>
        ))}
      </div>

      {/* Value badge */}
      {hasValue && showValue && zone && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: zone.hexColor }}
          >
            {value!.toFixed(metricId === "peg" ? 2 : 1)}×
          </span>
          <span className={`${sz.text} font-medium`} style={{ color: zone.hexColor }}>
            {zone.label}
          </span>
        </div>
      )}

      {!hasValue && (
        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">N/A — data not available</p>
      )}
    </div>
  );
}
