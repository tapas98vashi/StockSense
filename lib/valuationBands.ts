// ─────────────────────────────────────────────────────────────────────────────
// valuationBands.ts
// Single source of truth for all valuation thresholds, gauge zones, and
// classification logic.  Used by BOTH the Learn page and the Lookup page so
// every number is defined once and stays consistent.
//
// The Lookup page only references "pe" | "forwardPe" | "peg".
// The additional ids below ("pb" | "roe" | "divYield") are Learn-page-only
// educational metrics and are NOT wired into the Stock Lookup feature.
// ─────────────────────────────────────────────────────────────────────────────

export type ValuationLabel = "undervalued" | "fair" | "growth-premium" | "overvalued" | "n/a";

/** All metric ids used across the app. Lookup uses only the first three. */
export type MetricId = "pe" | "forwardPe" | "peg" | "pb" | "roe" | "divYield";

export interface GaugeZone {
  label: string;
  color: string;        // Tailwind bg class
  hexColor: string;     // raw hex for SVG / canvas use
  from: number;
  to: number;           // Infinity for open-ended upper zone
  /** Tick label shown at the left boundary of this zone on the gauge. */
  tickLabel: string;
}

export interface MetricConfig {
  id: MetricId;
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
  { label: "Potentially Undervalued",  color: "bg-emerald-500", hexColor: "#10b981", from: 0,   to: 15,       tickLabel: "0"  },
  { label: "Fairly Valued",            color: "bg-yellow-400",  hexColor: "#facc15", from: 15,  to: 25,       tickLabel: "15" },
  { label: "Growth Premium",           color: "bg-orange-400",  hexColor: "#fb923c", from: 25,  to: 35,       tickLabel: "25" },
  { label: "Overvalued / Expensive",   color: "bg-red-500",     hexColor: "#ef4444", from: 35,  to: Infinity, tickLabel: "35" },
];

// ─── Forward P/E (same numeric bands as trailing) ────────────────────────────
const FORWARD_PE_ZONES: GaugeZone[] = [
  { label: "Potentially Undervalued",  color: "bg-emerald-500", hexColor: "#10b981", from: 0,   to: 15,       tickLabel: "0"  },
  { label: "Fairly Valued",            color: "bg-yellow-400",  hexColor: "#facc15", from: 15,  to: 25,       tickLabel: "15" },
  { label: "Growth Premium",           color: "bg-orange-400",  hexColor: "#fb923c", from: 25,  to: 35,       tickLabel: "25" },
  { label: "Overvalued / Expensive",   color: "bg-red-500",     hexColor: "#ef4444", from: 35,  to: Infinity, tickLabel: "35" },
];

// ─── PEG Ratio ───────────────────────────────────────────────────────────────
const PEG_ZONES: GaugeZone[] = [
  { label: "Undervalued vs Growth",    color: "bg-emerald-500", hexColor: "#10b981", from: 0,   to: 1.0,      tickLabel: "0"   },
  { label: "Fairly Valued (Lynch)",    color: "bg-yellow-400",  hexColor: "#facc15", from: 1.0, to: 2.0,      tickLabel: "1.0" },
  { label: "Growth Premium Stretched", color: "bg-red-500",     hexColor: "#ef4444", from: 2.0, to: Infinity, tickLabel: "2.0" },
];

// ─── Price-to-Book (P/B) Ratio ───────────────────────────────────────────────
const PB_ZONES: GaugeZone[] = [
  { label: "Below Book Value",         color: "bg-emerald-500", hexColor: "#10b981", from: 0,   to: 1.0,      tickLabel: "0"   },
  { label: "Typical Range",            color: "bg-yellow-400",  hexColor: "#facc15", from: 1.0, to: 3.0,      tickLabel: "1.0" },
  { label: "Growth Premium",           color: "bg-orange-400",  hexColor: "#fb923c", from: 3.0, to: 5.0,      tickLabel: "3.0" },
  { label: "Very High / Asset-Light",  color: "bg-red-500",     hexColor: "#ef4444", from: 5.0, to: Infinity, tickLabel: "5.0" },
];

// ─── Return on Equity (ROE) ──────────────────────────────────────────────────
const ROE_ZONES: GaugeZone[] = [
  { label: "Below Average",            color: "bg-red-500",     hexColor: "#ef4444", from: 0,   to: 10,       tickLabel: "0%"  },
  { label: "Solid",                    color: "bg-yellow-400",  hexColor: "#facc15", from: 10,  to: 15,       tickLabel: "10%" },
  { label: "Strong",                   color: "bg-emerald-400", hexColor: "#34d399", from: 15,  to: 20,       tickLabel: "15%" },
  { label: "Excellent",                color: "bg-emerald-600", hexColor: "#059669", from: 20,  to: Infinity, tickLabel: "20%" },
];

// ─── Dividend Yield ──────────────────────────────────────────────────────────
const DIV_YIELD_ZONES: GaugeZone[] = [
  { label: "Low / Growth Focus",       color: "bg-gray-400",    hexColor: "#9ca3af", from: 0,   to: 1.0,      tickLabel: "0%"  },
  { label: "Moderate",                 color: "bg-yellow-400",  hexColor: "#facc15", from: 1.0, to: 3.0,      tickLabel: "1%"  },
  { label: "Solid Income",             color: "bg-emerald-500", hexColor: "#10b981", from: 3.0, to: 6.0,      tickLabel: "3%"  },
  { label: "High — Review Carefully",  color: "bg-red-500",     hexColor: "#ef4444", from: 6.0, to: Infinity, tickLabel: "6%"  },
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
  // ── Learn-page-only metrics (NOT used by Stock Lookup) ──────────────────────
  {
    id: "pb",
    name: "Price-to-Book Ratio",
    shortName: "P/B Ratio",
    formula: "Share Price ÷ Book Value per Share  (Book Value per Share = (Total Assets − Total Liabilities − Preferred Equity) ÷ Shares Outstanding)",
    formulaLatex: "P/B = Share Price ÷ Book Value per Share",
    description:
      "The P/B ratio compares what the market pays for a share against what the company's own balance sheet says each share is worth in net assets. A P/B below 1 means you are — at least on paper — buying $1 of net assets for less than $1. A high P/B means the market is paying a premium over accounting value, often because of brand, intellectual property, or growth expectations that don't show up on the balance sheet.",
    example: {
      inputs: [
        { label: "Total Assets",        value: "$3,000,000" },
        { label: "Total Liabilities",   value: "$1,000,000" },
        { label: "Shares Outstanding",  value: "1,000,000"  },
        { label: "Share Price",         value: "$3.00"       },
      ],
      result: "Book Value/Share = ($3M − $1M) ÷ 1M = $2.00  →  P/B = $3.00 ÷ $2.00 = 1.5×",
      interpretation:
        "A P/B of 1.5× sits in the typical range for a stable, established company — the market is paying a modest premium over net asset value, which is normal for a profitable business.",
    },
    zones: PB_ZONES,
    caveat:
      "P/B works best for asset-heavy sectors (banks, insurance, utilities, manufacturing) where book value closely reflects real assets. It is much less meaningful for asset-light businesses (software, tech, services) where most value comes from intangibles like patents, brand, and people — a high P/B there is not automatically a red flag. Always compare P/B to the sector median, not the broad market average. Also note: aggressive stock buybacks reduce book value and can push P/B higher even for a healthy, shareholder-friendly company — so don't read a rising P/B alone as 'getting more expensive.'",
  },
  {
    id: "roe",
    name: "Return on Equity",
    shortName: "ROE",
    formula: "Net Income ÷ Shareholders' Equity (expressed as a percentage)",
    formulaLatex: "ROE = Net Income ÷ Shareholders' Equity × 100",
    description:
      "ROE measures how efficiently a company turns shareholders' invested capital into profit. It is a measure of management's effectiveness — not a direct measure of stock price valuation. A high ROE means the company is generating a lot of profit relative to the equity investors have put in. Think of it as asking: for every dollar shareholders own, how many cents of profit did the company produce?",
    example: {
      inputs: [
        { label: "Net Income",           value: "$20,000,000" },
        { label: "Shareholders' Equity", value: "$100,000,000" },
      ],
      result: "ROE = $20M ÷ $100M = 20%",
      interpretation:
        "An ROE of 20% means the company generates $0.20 of profit for every $1 of equity invested — widely cited as a marker of an efficient, well-run business.",
    },
    zones: ROE_ZONES,
    teachingPoint:
      "ROE is a profitability and quality metric, not a 'cheap vs expensive' valuation metric. Use it alongside P/E or P/B to judge whether you are paying a fair price for the quality you are getting.",
    caveat:
      "A very high ROE can be artificially inflated by heavy debt — because more debt reduces the equity in the denominator, making ROE look better without any improvement in actual business performance. Always sanity-check a very high ROE against the company's debt levels before assuming it reflects pure operational excellence. ROE is also not meaningful for companies with negative earnings or negative equity.",
  },
  {
    id: "divYield",
    name: "Dividend Yield",
    shortName: "Dividend Yield",
    formula: "Annual Dividend per Share ÷ Current Share Price × 100 (expressed as a percentage)",
    formulaLatex: "Dividend Yield = Annual DPS ÷ Share Price × 100",
    description:
      "Dividend yield is the cash return an investor receives from dividends alone, expressed as a percentage of the share price paid. It is entirely separate from any gain or loss in the stock price itself. A stock paying $2.50 in dividends on a $50 share gives you a 5% yield — you receive that cash regardless of whether the stock goes up or down.",
    example: {
      inputs: [
        { label: "Annual Dividend per Share", value: "$2.50" },
        { label: "Current Share Price",       value: "$50.00" },
      ],
      result: "Dividend Yield = $2.50 ÷ $50.00 × 100 = 5.0%",
      interpretation:
        "A 5% yield is a solid income return — roughly in line with many established blue-chip dividend payers. For context, the S&P 500 average yield has historically been around 1.5–2%.",
    },
    zones: DIV_YIELD_ZONES,
    caveat:
      "A very high dividend yield is not always good news. It can mean the stock price has fallen sharply — which mechanically inflates the yield — or that the dividend itself is at risk of being cut. Always check whether the dividend is sustainable by looking at the payout ratio (dividend per share ÷ EPS). A payout ratio under ~60% generally leaves room for the dividend to keep growing even if earnings dip, while a very high payout ratio — or one exceeding 100% — is a warning sign the company may be paying out more than it earns.",
  },
];

// ─── Classification Helpers ───────────────────────────────────────────────────

/** Return the gauge zone a raw numeric value falls into for a given metric. */
export function classifyMetric(
  metricId: MetricId,
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
  } else if (metricId === "pb") {
    if (value < 1.0)  label = "undervalued";
    else if (value < 3.0) label = "fair";
    else if (value < 5.0) label = "growth-premium";
    else label = "overvalued";
  } else if (metricId === "roe") {
    if (value < 10)   label = "undervalued";
    else if (value < 15) label = "fair";
    else if (value < 20) label = "growth-premium";
    else label = "overvalued";
  } else if (metricId === "divYield") {
    if (value < 1.0)  label = "undervalued";
    else if (value < 3.0) label = "fair";
    else if (value < 6.0) label = "growth-premium";
    else label = "overvalued";
  } else {
    // pe / forwardPe
    if (value < 15)   label = "undervalued";
    else if (value < 25) label = "fair";
    else if (value < 35) label = "growth-premium";
    else label = "overvalued";
  }

  return { zone, label };
}

/** Gauge display max (values above this are clamped to the end of the bar). */
export const GAUGE_MAX: Record<MetricId, number> = {
  pe:         60,
  forwardPe:  60,
  peg:        4,
  pb:         10,
  roe:        40,
  divYield:   10,
};

/**
 * Convert a raw metric value to a 0–100 percentage for gauge positioning.
 * Values above GAUGE_MAX are clamped to 100.
 */
export function toGaugePercent(metricId: MetricId, value: number): number {
  const max = GAUGE_MAX[metricId];
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** Zone widths as percentages (for the colored gauge track). */
export function getZoneWidths(metricId: MetricId): { label: string; pct: number; hexColor: string; tickLabel: string }[] {
  const max = GAUGE_MAX[metricId];
  const config = METRIC_CONFIGS.find((m) => m.id === metricId)!;
  return config.zones.map((z) => {
    const effectiveTo = isFinite(z.to) ? z.to : max;
    const effectiveFrom = z.from;
    const width = Math.max(0, Math.min(effectiveTo, max) - effectiveFrom);
    const pct = (width / max) * 100;
    return { label: z.label, pct, hexColor: z.hexColor, tickLabel: z.tickLabel };
  });
}
