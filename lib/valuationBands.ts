// ─────────────────────────────────────────────────────────────────────────────
// valuationBands.ts
// Single source of truth for all valuation thresholds, gauge zones, and
// classification logic.  Used by BOTH the Learn page and the Lookup page so
// every number is defined once and stays consistent.
// ─────────────────────────────────────────────────────────────────────────────

export type ValuationLabel = "undervalued" | "fair" | "growth-premium" | "overvalued" | "n/a";

export interface GaugeZone {
  label: string;
  color: string;        // Tailwind bg class
  hexColor: string;     // raw hex for SVG / canvas use
  from: number;
  to: number;           // Infinity for open-ended upper zone
}

export interface MetricConfig {
  id: "pe" | "forwardPe" | "peg";
  name: string;
  shortName: string;
  formula: string;
  formulaLatex: string; // human-readable formula parts
  description: string;
  example: {
    inputs: { label: string; value: string }[];
    result: string;
    interpretation: string;
  };
  zones: GaugeZone[];
  caveat: string;
  teachingPoint?: string;
}

// ─── P/E Ratio ───────────────────────────────────────────────────────────────
const PE_ZONES: GaugeZone[] = [
  { label: "Potentially Undervalued",  color: "bg-emerald-500", hexColor: "#10b981", from: 0,   to: 15  },
  { label: "Fairly Valued",            color: "bg-yellow-400",  hexColor: "#facc15", from: 15,  to: 25  },
  { label: "Growth Premium",           color: "bg-orange-400",  hexColor: "#fb923c", from: 25,  to: 35  },
  { label: "Overvalued / Expensive",   color: "bg-red-500",     hexColor: "#ef4444", from: 35,  to: Infinity },
];

// ─── Forward P/E (same numeric bands as trailing) ────────────────────────────
const FORWARD_PE_ZONES: GaugeZone[] = [
  { label: "Potentially Undervalued",  color: "bg-emerald-500", hexColor: "#10b981", from: 0,   to: 15  },
  { label: "Fairly Valued",            color: "bg-yellow-400",  hexColor: "#facc15", from: 15,  to: 25  },
  { label: "Growth Premium",           color: "bg-orange-400",  hexColor: "#fb923c", from: 25,  to: 35  },
  { label: "Overvalued / Expensive",   color: "bg-red-500",     hexColor: "#ef4444", from: 35,  to: Infinity },
];

// ─── PEG Ratio ───────────────────────────────────────────────────────────────
const PEG_ZONES: GaugeZone[] = [
  { label: "Undervalued vs Growth",    color: "bg-emerald-500", hexColor: "#10b981", from: 0,   to: 1.0 },
  { label: "Fairly Valued (Lynch)",    color: "bg-yellow-400",  hexColor: "#facc15", from: 1.0, to: 2.0 },
  { label: "Growth Premium Stretched", color: "bg-red-500",     hexColor: "#ef4444", from: 2.0, to: Infinity },
];

// ─── Full Metric Configs ──────────────────────────────────────────────────────
export const METRIC_CONFIGS: MetricConfig[] = [
  {
    id: "pe",
    name: "Price-to-Earnings Ratio",
    shortName: "P/E Ratio",
    formula: "Share Price ÷ Earnings Per Share (EPS, trailing 12 months)",
    formulaLatex: "P/E = Share Price ÷ EPS (TTM)",
    description:
      "The P/E ratio tells you how much investors are willing to pay for every $1 of a company's earnings. A higher P/E means the market expects strong future growth — or the stock may simply be overpriced. A lower P/E can signal a bargain, but it can also signal declining earnings or a 'value trap.'",
    example: {
      inputs: [
        { label: "Share Price",         value: "$150.00" },
        { label: "EPS (trailing 12m)", value: "$6.00"   },
      ],
      result: "P/E = $150 ÷ $6 = 25×",
      interpretation:
        "A P/E of 25× sits in the 'growth premium' zone — above the long-run S&P 500 average of ~19-20×, but not extreme. The market is pricing in above-average earnings growth.",
    },
    zones: PE_ZONES,
    caveat:
      "P/E varies widely by sector. Utilities and banks often trade at 8–20×; mature tech at 20–35×; high-growth software can command 40×+ and still be reasonable if growth is fast enough. Companies with negative earnings have no meaningful P/E. Always compare within the same sector and against the company's own historical range.",
  },
  {
    id: "forwardPe",
    name: "Forward Price-to-Earnings Ratio",
    shortName: "Forward P/E",
    formula: "Share Price ÷ Estimated EPS (next 12 months, analyst consensus)",
    formulaLatex: "Fwd P/E = Share Price ÷ Estimated EPS (NTM)",
    description:
      "Forward P/E replaces historical earnings with analysts' consensus estimates for the next 12 months. It's a forward-looking version of the P/E ratio, and it tells you how the market is pricing the company's expected — not yet realized — earnings.",
    example: {
      inputs: [
        { label: "Share Price",          value: "$150.00" },
        { label: "Estimated EPS (NTM)",  value: "$7.50"   },
      ],
      result: "Forward P/E = $150 ÷ $7.50 = 20×",
      interpretation:
        "A forward P/E of 20× with a trailing P/E of 25× means analysts expect earnings to grow meaningfully — the market is paying less per future dollar of earnings than per current dollar.",
    },
    zones: FORWARD_PE_ZONES,
    teachingPoint:
      "If Forward P/E < Trailing P/E → earnings are expected to GROW. If Forward P/E > Trailing P/E → earnings are expected to SHRINK. This divergence is a crucial signal.",
    caveat:
      "Forward P/E is only as reliable as the analyst estimates behind it. Estimates can be wrong — especially for cyclical companies, turnarounds, or businesses navigating rapid change. Always treat it as an educated guess, not a fact.",
  },
  {
    id: "peg",
    name: "Price/Earnings-to-Growth Ratio",
    shortName: "PEG Ratio",
    formula: "P/E Ratio ÷ Expected Annual EPS Growth Rate (%)",
    formulaLatex: "PEG = P/E ÷ EPS Growth Rate",
    description:
      "Popularized by legendary investor Peter Lynch, the PEG ratio adjusts the P/E for the company's growth rate. The big idea: a high P/E is justified if earnings are growing fast. PEG puts growth and valuation on the same scale — a PEG of 1.0 means you're paying a P/E roughly equal to the growth rate, which Lynch called 'fair value.'",
    example: {
      inputs: [
        { label: "P/E Ratio",               value: "25×"  },
        { label: "Expected EPS Growth Rate", value: "20%" },
      ],
      result: "PEG = 25 ÷ 20 = 1.25",
      interpretation:
        "A PEG of 1.25 sits just above Lynch's 1.0 fair-value benchmark — the stock carries a modest growth premium, but it's not extreme given the 20% expected growth.",
    },
    zones: PEG_ZONES,
    caveat:
      "PEG doesn't work for companies with negative earnings or near-zero growth (the ratio becomes meaningless). Growth estimates are inherently uncertain. Compare PEG within the same sector — a 'high' PEG in a slow-growth utility means something very different than in high-growth software.",
  },
];

// ─── Classification Helpers ───────────────────────────────────────────────────

/** Return the gauge zone a raw numeric value falls into for a given metric. */
export function classifyMetric(
  metricId: "pe" | "forwardPe" | "peg",
  value: number | null | undefined,
): { zone: GaugeZone | null; label: ValuationLabel } {
  if (value == null || !isFinite(value) || value <= 0) {
    return { zone: null, label: "n/a" };
  }

  const config = METRIC_CONFIGS.find((m) => m.id === metricId)!;
  const zone = config.zones.find((z) => value >= z.from && value < z.to) ?? config.zones[config.zones.length - 1];

  let label: ValuationLabel = "n/a";
  if (metricId === "peg") {
    if (value < 1.0)  label = "undervalued";
    else if (value < 2.0) label = "fair";
    else label = "overvalued";
  } else {
    if (value < 15)   label = "undervalued";
    else if (value < 25) label = "fair";
    else if (value < 35) label = "growth-premium";
    else label = "overvalued";
  }

  return { zone, label };
}

/** Gauge display max (values above this are clamped to the end of the bar). */
export const GAUGE_MAX: Record<"pe" | "forwardPe" | "peg", number> = {
  pe: 60,
  forwardPe: 60,
  peg: 4,
};

/**
 * Convert a raw metric value to a 0–100 percentage for gauge positioning.
 * Values above GAUGE_MAX are clamped to 100.
 */
export function toGaugePercent(metricId: "pe" | "forwardPe" | "peg", value: number): number {
  const max = GAUGE_MAX[metricId];
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** Zone widths as percentages (for the colored gauge track). */
export function getZoneWidths(metricId: "pe" | "forwardPe" | "peg"): { label: string; pct: number; hexColor: string }[] {
  const max = GAUGE_MAX[metricId];
  const config = METRIC_CONFIGS.find((m) => m.id === metricId)!;
  return config.zones.map((z) => {
    const effectiveTo = isFinite(z.to) ? z.to : max;
    const effectiveFrom = z.from;
    const width = Math.max(0, Math.min(effectiveTo, max) - effectiveFrom);
    const pct = (width / max) * 100;
    return { label: z.label, pct, hexColor: z.hexColor };
  });
}
