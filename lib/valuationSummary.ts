// lib/valuationSummary.ts
// Deterministic, template-based valuation commentary generator.
// NO LLM calls — every string is rule-based so output is transparent and fast.
import { classifyMetric } from "./valuationBands";

interface SummaryInput {
  ticker:     string;
  name:       string;
  peTrailing: number | null;
  peForward:  number | null;
  peg:        number | null;
  sector?:    string;
}

function fmtPE(v: number | null): string {
  return v != null ? `${v.toFixed(1)}×` : "N/A";
}

function pePhrase(val: number | null, type: "trailing" | "forward"): string {
  if (val == null) return `${type} P/E data is unavailable`;
  const { label } = classifyMetric(type === "trailing" ? "pe" : "forwardPe", val);
  const prefix = type === "trailing" ? "a trailing P/E" : "a forward P/E";
  if (label === "undervalued")      return `${prefix} of ${fmtPE(val)}, below the long-run S&P 500 average of ~19-20×`;
  if (label === "fair")             return `${prefix} of ${fmtPE(val)}, roughly in line with the long-run S&P 500 average of ~19-20×`;
  if (label === "growth-premium")   return `${prefix} of ${fmtPE(val)}, in growth-premium territory above the S&P 500 average`;
  return `${prefix} of ${fmtPE(val)}, well above the S&P 500 average, suggesting a significant premium`;
}

function pegPhrase(val: number | null): string {
  if (val == null) return "PEG ratio data is unavailable, so a growth-adjusted assessment cannot be made";
  if (val < 1.0)  return `a PEG ratio of ${val.toFixed(2)}, below 1.0 — suggesting the market may be underpricing the stock relative to its growth rate (Peter Lynch's classic 'good value' signal)`;
  if (val < 2.0)  return `a PEG ratio of ${val.toFixed(2)}, above Lynch's 1.0 fair-value benchmark but within an acceptable range for quality growth companies`;
  return `a PEG ratio of ${val.toFixed(2)}, above 2.0 — suggesting the market may be pricing in aggressive growth assumptions`;
}

function overallVerdict(
  pe: number | null,
  fwdPe: number | null,
  peg: number | null,
): string {
  const { label: peLabel }   = classifyMetric("pe",        pe);
  const { label: pegLabel }  = classifyMetric("peg",       peg);

  // Use PEG as the primary arbiter if available
  if (peg != null) {
    if (pegLabel === "undervalued") return "undervalued relative to growth";
    if (pegLabel === "fair") {
      if (peLabel === "overvalued") return "fairly valued when growth is considered, despite a high absolute P/E";
      return "fairly valued relative to growth";
    }
    return "trading at a stretched valuation relative to its expected growth";
  }

  // Fall back to P/E
  if (peLabel === "undervalued") return "potentially undervalued on a P/E basis";
  if (peLabel === "fair")        return "fairly valued relative to historical market averages";
  if (peLabel === "growth-premium") return "in growth-premium territory — justified only if earnings growth is strong";
  return "appearing overvalued on trailing earnings — strong future growth would be needed to justify current prices";
}

function forwardVsTrailingSignal(pe: number | null, fwdPe: number | null): string | null {
  if (pe == null || fwdPe == null) return null;
  const diff = pe - fwdPe;
  if (diff > 3)  return `The forward P/E (${fmtPE(fwdPe)}) is meaningfully lower than the trailing P/E (${fmtPE(pe)}), indicating analysts expect earnings to grow — a constructive signal.`;
  if (diff < -3) return `The forward P/E (${fmtPE(fwdPe)}) is higher than the trailing P/E (${fmtPE(pe)}), suggesting analysts expect earnings to decline — worth monitoring closely.`;
  return null;
}

export function generateValuationSummary(input: SummaryInput): string {
  const { ticker, name, peTrailing, peForward, peg, sector } = input;
  const displayName = name || ticker;

  const sentence1 = `${displayName} (${ticker}) trades at ${pePhrase(peTrailing, "trailing")} and ${pePhrase(peForward, "forward")}.`;
  const sentence2 = `It has ${pegPhrase(peg)}.`;
  const signal    = forwardVsTrailingSignal(peTrailing, peForward);
  const sentence3 = signal ?? "";
  const verdict   = overallVerdict(peTrailing, peForward, peg);
  const sentence4 = `Overall, this points to the stock ${verdict}${sector ? `, though investors should compare against direct ${sector} sector peers and the company's own historical valuation range` : ", though investors should compare against sector peers and the company's own historical valuation range"}.`;
  const caveat    = "Note: these metrics are based on general industry conventions — not official standards — and are not a guarantee of future performance.";

  return [sentence1, sentence2, sentence3, sentence4, caveat]
    .filter(Boolean)
    .join(" ");
}
