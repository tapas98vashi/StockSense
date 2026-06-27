// ─────────────────────────────────────────────────────────────────────────────
// financeApi.ts
// Server-side only — NEVER import this from client components.
// Finnhub is the primary source.  Alpha Vantage is a documented fallback for
// fields Finnhub doesn't reliably return (note: AV free tier is ~25 req/day).
// ─────────────────────────────────────────────────────────────────────────────

const FINNHUB_BASE = "https://finnhub.io/api/v1";
const AV_BASE      = "https://www.alphavantage.co/query";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY    ?? "";
const AV_KEY      = process.env.ALPHA_VANTAGE_API_KEY ?? "";

// ─── Generic fetch helper ─────────────────────────────────────────────────────
async function apiFetch<T>(url: string, label: string): Promise<T> {
  const res = await fetch(url, {
    next: { revalidate: 300 }, // cache for 5 minutes
    headers: { "User-Agent": "StockSenseAI/1.0" },
  });
  if (!res.ok) {
    throw new Error(`[${label}] HTTP ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─────────────────────────────────────────────────────────────────────────────
// FINNHUB
// ─────────────────────────────────────────────────────────────────────────────

export interface FinnhubQuote {
  c:  number;  // current price
  d:  number;  // change
  dp: number;  // percent change
  h:  number;  // high
  l:  number;  // low
  o:  number;  // open
  pc: number;  // previous close
  t:  number;  // timestamp
}

export interface FinnhubProfile {
  country:        string;
  currency:       string;
  exchange:       string;
  finnhubIndustry:string;
  ipo:            string;
  logo:           string;
  marketCapitalization: number;
  name:           string;
  phone:          string;
  shareOutstanding: number;
  ticker:         string;
  weburl:         string;
}

export interface FinnhubMetrics {
  metric: Record<string, number | null>;
  metricType: string;
  series?: Record<string, unknown>;
  symbol: string;
}

export interface FinnhubSearchResult {
  count:  number;
  result: { description: string; displaySymbol: string; symbol: string; type: string }[];
}

export interface FinnhubNewsItem {
  category:  string;
  datetime:  number;
  headline:  string;
  id:        number;
  image:     string;
  related:   string;
  source:    string;
  summary:   string;
  url:       string;
}

/** Real-time quote for a ticker. */
export async function getFinnhubQuote(ticker: string): Promise<FinnhubQuote> {
  return apiFetch<FinnhubQuote>(
    `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`,
    "FinnhubQuote",
  );
}

/** Company profile (name, logo, sector, market cap). */
export async function getFinnhubProfile(ticker: string): Promise<FinnhubProfile> {
  return apiFetch<FinnhubProfile>(
    `${FINNHUB_BASE}/stock/profile2?symbol=${encodeURIComponent(ticker)}&token=${FINNHUB_KEY}`,
    "FinnhubProfile",
  );
}

/**
 * Fundamental metrics (peTTM, epsGrowth5Y, etc.).
 * Finnhub returns these under /stock/metric?metricType=all
 */
export async function getFinnhubMetrics(ticker: string): Promise<FinnhubMetrics> {
  return apiFetch<FinnhubMetrics>(
    `${FINNHUB_BASE}/stock/metric?symbol=${encodeURIComponent(ticker)}&metricType=all&token=${FINNHUB_KEY}`,
    "FinnhubMetrics",
  );
}

/** Ticker search / autocomplete. */
export async function searchFinnhub(query: string): Promise<FinnhubSearchResult> {
  return apiFetch<FinnhubSearchResult>(
    `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${FINNHUB_KEY}`,
    "FinnhubSearch",
  );
}

/**
 * Company news from Finnhub.
 * Date range: last 14 days to get enough articles on free tier.
 */
export async function getFinnhubNews(ticker: string): Promise<FinnhubNewsItem[]> {
  const to   = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 14);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return apiFetch<FinnhubNewsItem[]>(
    `${FINNHUB_BASE}/company-news?symbol=${encodeURIComponent(ticker)}&from=${fmt(from)}&to=${fmt(to)}&token=${FINNHUB_KEY}`,
    "FinnhubNews",
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ALPHA VANTAGE (documented fallback — use sparingly, ~25 req/day free tier)
// ─────────────────────────────────────────────────────────────────────────────

export interface AVOverview {
  Symbol:              string;
  Name:                string;
  Sector:              string;
  Industry:            string;
  MarketCapitalization:string;
  TrailingPE:          string;
  ForwardPE:           string;
  PEGRatio:            string;
  EPS:                 string;
  DividendYield:       string;
  "52WeekHigh":        string;
  "52WeekLow":         string;
  [key: string]: string;
}

/**
 * Alpha Vantage OVERVIEW endpoint — use only if Finnhub is missing key fields.
 * NOTE: free tier = ~25 requests/day, not suitable for high-traffic use.
 */
export async function getAVOverview(ticker: string): Promise<AVOverview | null> {
  if (!AV_KEY) return null;
  try {
    const data = await apiFetch<AVOverview>(
      `${AV_BASE}?function=OVERVIEW&symbol=${encodeURIComponent(ticker)}&apikey=${AV_KEY}`,
      "AVOverview",
    );
    // AV returns an empty object or error message on bad ticker
    if (!data.Symbol) return null;
    return data;
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPOSITE — assemble the full stock data object used by the API route
// ─────────────────────────────────────────────────────────────────────────────

export interface StockData {
  ticker:        string;
  name:          string;
  logo:          string;
  exchange:      string;
  sector:        string;
  industry:      string;
  weburl:        string;
  currency:      string;
  // Price
  price:         number;
  change:        number;
  changePct:     number;
  high:          number;
  low:           number;
  open:          number;
  previousClose: number;
  // Fundamentals
  marketCap:     number | null; // in millions (Finnhub unit)
  peTrailing:    number | null;
  peForward:     number | null;
  peg:           number | null;
  eps:           number | null;
  epsGrowth5Y:   number | null;
  // Source transparency
  sources: {
    quote:    "finnhub";
    profile:  "finnhub";
    metrics:  "finnhub" | "alphavantage" | "calculated";
  };
}

export async function getStockData(ticker: string): Promise<StockData> {
  const sym = ticker.toUpperCase();

  // Fetch quote and profile in parallel
  const [quote, profile] = await Promise.all([
    getFinnhubQuote(sym),
    getFinnhubProfile(sym),
  ]);

  // Validate — Finnhub returns c=0 for unknown tickers on free tier
  if (!profile.name || profile.name.trim() === "") {
    throw new Error(`Ticker "${sym}" not found. Check the symbol and try again.`);
  }

  // Fetch fundamentals
  const metrics = await getFinnhubMetrics(sym);
  const m = metrics.metric ?? {};

  // Map Finnhub metric keys
  // Finnhub key reference: https://finnhub.io/docs/api/company-basic-financials
  let peTrailing:  number | null = typeof m["peTTM"]        === "number" ? m["peTTM"]        : null;
  let peForward:   number | null = typeof m["peForward"]     === "number" ? m["peForward"]     : null; // not always present
  let epsVal:      number | null = typeof m["epsTTM"]        === "number" ? m["epsTTM"]        : null;
  const epsGrowth5Y: number | null = typeof m["epsGrowth5Y"]   === "number" ? m["epsGrowth5Y"]   :
                                     typeof m["revenueGrowth5Y"]=== "number" ? m["revenueGrowth5Y"] : null;

  // Calculate PEG: peTTM / epsGrowth5Y (growth as a whole number, e.g. 20 for 20%)
  let peg: number | null = null;
  if (peTrailing != null && epsGrowth5Y != null && epsGrowth5Y > 0) {
    peg = peTrailing / epsGrowth5Y;
  }

  let metricsSource: StockData["sources"]["metrics"] = "finnhub";

  // Alpha Vantage fallback if key metrics are missing
  if ((peTrailing == null || peForward == null || peg == null) && AV_KEY) {
    const av = await getAVOverview(sym);
    if (av) {
      metricsSource = "alphavantage";
      if (peTrailing == null && av.TrailingPE && av.TrailingPE !== "None") {
        peTrailing = parseFloat(av.TrailingPE);
      }
      if (peForward == null && av.ForwardPE && av.ForwardPE !== "None") {
        peForward = parseFloat(av.ForwardPE);
      }
      if (peg == null && av.PEGRatio && av.PEGRatio !== "None") {
        peg = parseFloat(av.PEGRatio);
      }
      if (epsVal == null && av.EPS && av.EPS !== "None") {
        epsVal = parseFloat(av.EPS);
      }
    }
  }

  return {
    ticker:        profile.ticker || sym,
    name:          profile.name,
    logo:          profile.logo,
    exchange:      profile.exchange,
    sector:        profile.finnhubIndustry,
    industry:      profile.finnhubIndustry,
    weburl:        profile.weburl,
    currency:      profile.currency,
    price:         quote.c,
    change:        quote.d,
    changePct:     quote.dp,
    high:          quote.h,
    low:           quote.l,
    open:          quote.o,
    previousClose: quote.pc,
    marketCap:     profile.marketCapitalization,
    peTrailing,
    peForward,
    peg,
    eps:           epsVal,
    epsGrowth5Y,
    sources: {
      quote:   "finnhub",
      profile: "finnhub",
      metrics: metricsSource,
    },
  };
}
