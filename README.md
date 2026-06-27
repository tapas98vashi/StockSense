# StockSense AI

An educational full-stack web app for learning and applying stock valuation metrics — built with Next.js 14, TypeScript, and Tailwind CSS.

> **Disclaimer:** This tool is for educational purposes only and does not constitute financial advice. All valuation bands are general industry conventions — not regulations — and are not guarantees of future performance.

---

## Features

### 1. Learn the Metrics (`/learn`)
An interactive educational hub covering the three most-used stock valuation ratios:
- **P/E Ratio** (trailing) — Price-to-Earnings
- **Forward P/E** — based on analyst consensus estimates
- **PEG Ratio** — P/E divided by expected growth rate (popularized by Peter Lynch)

Each metric includes:
- Plain-language definition
- The formula
- A worked numeric example
- An interactive valuation gauge (color-coded: green → yellow → red)
- A caveat box with sector context

### 2. Stock Lookup (`/lookup`)
Search any U.S. ticker and get:
- **Live header card** — name, logo, price, day change (color-coded), market cap, sector
- **Valuation metrics panel** — Trailing P/E, Forward P/E, PEG, each with the same visual gauge used on the Learn page
- **Trailing vs Forward signal** — auto-detects whether earnings are expected to grow or shrink
- **Auto-generated valuation summary** — deterministic, rule-based commentary (not an LLM)
- **News feed** — most recent articles, with earnings/guidance articles surfaced in a dedicated section
- **Ticker autocomplete** — powered by Finnhub's search endpoint

---

## Tech Stack

| Layer         | Technology                                      |
|---------------|--------------------------------------------------|
| Framework     | Next.js 14 (App Router)                         |
| Language      | TypeScript                                      |
| Styling       | Tailwind CSS + dark mode                        |
| Animations    | Framer Motion                                   |
| Charting      | Recharts (available for extension)              |
| Icons         | Lucide React                                    |
| Primary API   | [Finnhub](https://finnhub.io) (free tier, 60 req/min) |
| Fallback API  | [Alpha Vantage](https://www.alphavantage.co) (free tier, ~25 req/day) |
| News          | Finnhub `/company-news` endpoint                |

---

## Getting Started

### 1. Clone the repo

```bash
git clone <repo-url>
cd stocksense-ai
npm install
```

### 2. Get your free API keys

#### Finnhub (Required — primary data source)
1. Go to [https://finnhub.io/register](https://finnhub.io/register)
2. Sign up for a **free account** — no credit card required
3. Copy your API key from the Dashboard → API Keys
4. Free tier: 60 API calls/minute — more than enough for development

#### Alpha Vantage (Optional — fallback only)
1. Go to [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
2. Enter your email to get a free key instantly
3. **Note:** Free tier is limited to ~25 requests/day — used only as a fallback when Finnhub doesn't return certain fields (e.g. Forward P/E)

#### NewsAPI (Optional — not currently used, available for extension)
1. Go to [https://newsapi.org/register](https://newsapi.org/register)
2. Free tier: 100 requests/day, developer use only
3. The app currently uses Finnhub's `/company-news` endpoint instead

### 3. Set up environment variables

Copy `.env.example` to `.env.local` and fill in your keys:

```bash
cp .env.example .env.local
```

```env
FINNHUB_API_KEY=your_finnhub_api_key_here
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key_here   # optional
NEWS_API_KEY=your_newsapi_key_here                   # optional
```

> **Important:** Never commit `.env.local` to version control. It is already in `.gitignore`. API keys are only used server-side (in `/app/api/` route handlers) — they are never exposed to the browser.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
stocksense-ai/
├── app/
│   ├── layout.tsx                    # Root layout (Navbar, Footer, dark mode init)
│   ├── page.tsx                      # Landing page
│   ├── globals.css                   # Global Tailwind styles
│   ├── learn/
│   │   └── page.tsx                  # Feature 1: Educational hub
│   ├── lookup/
│   │   └── page.tsx                  # Feature 2: Stock lookup & analysis
│   └── api/
│       ├── search/route.ts           # GET /api/search?q=AAPL (ticker autocomplete)
│       ├── stock/[ticker]/route.ts   # GET /api/stock/AAPL (quote + fundamentals)
│       └── news/[ticker]/route.ts    # GET /api/news/AAPL (earnings + regular news)
│
├── components/
│   ├── Navbar.tsx                    # Sticky navbar with dark mode toggle
│   ├── Footer.tsx                    # Footer with disclaimer
│   ├── ValuationGauge.tsx            # Reusable colored horizontal gauge bar
│   ├── MetricCard.tsx                # Full educational card (Learn page)
│   ├── StockHeader.tsx               # Company header card (Lookup page)
│   ├── SearchBar.tsx                 # Ticker search with autocomplete
│   └── NewsCard.tsx                  # Individual news article card
│
├── lib/
│   ├── valuationBands.ts             # ★ Single source of truth for all thresholds
│   ├── financeApi.ts                 # Finnhub + Alpha Vantage client (server-only)
│   └── valuationSummary.ts          # Deterministic valuation commentary generator
│
├── .env.local                        # Your API keys (gitignored)
├── .env.example                      # Template for env vars
└── README.md
```

---

## Valuation Bands Reference

All bands are general industry conventions based on historical S&P 500 data — **not official regulations**.

### P/E Ratio (Trailing) & Forward P/E
| Range  | Zone             | Color  |
|--------|------------------|--------|
| < 15   | Potentially Undervalued | 🟢 Green |
| 15–25  | Fairly Valued (S&P avg ~19-20×) | 🟡 Yellow |
| 25–35  | Growth Premium   | 🟠 Orange |
| > 35   | Overvalued / Expensive | 🔴 Red |

### PEG Ratio
| Range  | Zone             | Color  |
|--------|------------------|--------|
| < 1.0  | Undervalued vs Growth | 🟢 Green |
| 1.0–2.0 | Fair (Lynch benchmark) | 🟡 Yellow |
| > 2.0  | Growth Premium Stretched | 🔴 Red |

All thresholds are defined in [`lib/valuationBands.ts`](lib/valuationBands.ts) — change them there to update everywhere consistently.

---

## Architecture Notes

- **API keys never leave the server.** All Finnhub and Alpha Vantage calls happen in `/app/api/` route handlers. Client components only call `/api/*` on the same origin.
- **Valuation thresholds are defined once.** `lib/valuationBands.ts` is the single source of truth for all zone boundaries, colors, and labels. Both the Learn page and Lookup page import from this file.
- **Valuation summary is deterministic.** `lib/valuationSummary.ts` generates commentary purely from conditional logic — no LLM, no randomness. The output is always consistent for the same inputs.
- **Alpha Vantage is a last-resort fallback.** It's only called when Finnhub doesn't return a specific field (e.g. Forward P/E). Given the 25 req/day free limit, this keeps usage minimal.

---

## License

MIT — educational use only.
