# StockSense AI

An educational full-stack web app for learning and applying stock valuation metrics — built with Next.js 14, TypeScript, Tailwind CSS, Auth.js v5, and Prisma + Neon Postgres.

> **Disclaimer:** This tool is for educational purposes only and does not constitute financial advice. All valuation bands are general industry conventions — not regulations — and are not guarantees of future performance.

---

## Features

### 1. Learn the Metrics (`/learn`)
An interactive educational hub covering six stock valuation and quality metrics:
- **P/E Ratio** (trailing), **Forward P/E**, **PEG Ratio**
- **P/B Ratio** (Price-to-Book), **ROE** (Return on Equity), **Dividend Yield**

Each metric includes a plain-language definition, formula, worked example, interactive valuation gauge, and a caveat box.

### 2. Stock Lookup (`/lookup`) — requires sign-in
Search any U.S. ticker and get live valuation metrics, a rule-based summary, and the latest news headlines. Sign-in required to perform searches.

### 3. Authentication
- Sign in with **Google** or register with **email + password**
- Session-aware navbar (Sign In button → avatar/dropdown when logged in)
- Admin users see an "Admin Dashboard" link in their dropdown

### 4. Admin Dashboard (`/admin`) — ADMIN role required
- Summary cards: total users, new signups (7d), active today
- Sign-up method breakdown chart (Google vs. Email)
- Paginated, searchable, sortable user table
- Recent sign-in activity feed

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + dark mode |
| Animations | Framer Motion |
| Auth | Auth.js v5 (next-auth@beta) |
| ORM | Prisma v5 |
| Database | Neon (free tier Postgres) |
| Password hashing | bcryptjs |
| Validation | Zod |
| Primary API | Finnhub (free tier) |
| Fallback API | Alpha Vantage (free tier) |

---

## Setup — Local Development

### Step 1 — Clone and install

```bash
git clone <repo-url>
cd stocksense-ai
npm install
```

---

### Step 2 — Get your API keys

#### Finnhub (Required — stock data)
1. Go to [https://finnhub.io/register](https://finnhub.io/register)
2. Sign up (free, no credit card)
3. Copy your key from Dashboard → API Keys

#### Alpha Vantage (Optional — fallback)
1. Go to [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key)
2. Enter your email to get a free key instantly

---

### Step 3 — Set up Neon Postgres (free tier)

**Option A — Via Vercel (recommended for deployment):**
1. Push your project to GitHub and import it into Vercel
2. In the Vercel dashboard → **Storage** tab → Add → **Neon**
3. Vercel will create a Neon project and auto-populate `DATABASE_URL` and `DIRECT_URL` as environment variables
4. Pull them to your local `.env.local` with: `vercel env pull .env.local`

**Option B — Direct Neon setup (local dev first):**
1. Go to [https://neon.tech](https://neon.tech) and sign up (free, no credit card)
2. Create a new project (choose a region near you)
3. In your project dashboard → **Connection Details**:
   - Copy the **Pooled connection string** → use as `DATABASE_URL`
   - Copy the **Direct connection string** → use as `DIRECT_URL`
4. Add both to your `.env.local` (see Step 5)

---

### Step 4 — Create Google OAuth credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project (or use an existing one)
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth Client ID**
4. Application type: **Web application**
5. Add **Authorized redirect URIs**:
   - For local dev: `http://localhost:3000/api/auth/callback/google`
   - For production (add after deploying): `https://your-app.vercel.app/api/auth/callback/google`
6. Copy the **Client ID** and **Client Secret**

> ⚠️ **Important after deploying:** You MUST go back to Google Cloud Console and add your production Vercel URL as a second authorized redirect URI, or Google sign-in will fail in production even though it works locally.

---

### Step 5 — Configure environment variables

Copy `.env.example` to `.env.local` and fill in all values:

```bash
cp .env.example .env.local
```

```env
# Stock data APIs
FINNHUB_API_KEY=your_finnhub_key
ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key   # optional
NEWS_API_KEY=your_newsapi_key                   # optional

# Auth.js — generate with: openssl rand -base64 32
AUTH_SECRET=your_generated_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Neon Postgres
DATABASE_URL=postgresql://...?sslmode=require   # pooled URL
DIRECT_URL=postgresql://...?sslmode=require     # direct URL
```

---

### Step 6 — Run Prisma migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

This creates all tables in your Neon database (User, Account, Session, VerificationToken, LoginEvent).

---

### Step 7 — Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Promoting yourself to ADMIN

After signing up for an account, you need to manually promote it to ADMIN. You can do this two ways:

**Option A — Prisma Studio (GUI):**
```bash
npx prisma studio
```
1. Opens a browser UI at `http://localhost:5555`
2. Click the **User** model → find your account
3. Change `role` from `USER` to `ADMIN` → Save

**Option B — Neon SQL Editor (no local tools needed):**
1. Open your Neon project dashboard → **SQL Editor**
2. Run:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

> ⚠️ **Security:** ADMIN role can **only** be granted via a direct database update. There is no user-facing form or API route that can set a role — this is intentional.

---

## Deploying to Vercel

1. Push to GitHub
2. Import the repo in [Vercel](https://vercel.com)
3. Add all environment variables from `.env.local` in **Project Settings → Environment Variables**:
   - `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - `DATABASE_URL`, `DIRECT_URL` (or use Vercel's Neon integration to auto-populate these)
   - `FINNHUB_API_KEY`, `ALPHA_VANTAGE_API_KEY`
4. Deploy
5. Add your Vercel production URL as a redirect URI in Google Cloud Console (see Step 4)

---

## Project Structure

```
stocksense-ai/
├── app/
│   ├── layout.tsx                    # Root layout (SessionProvider, Navbar, Footer)
│   ├── page.tsx                      # Landing page
│   ├── globals.css
│   ├── login/
│   │   └── page.tsx                  # Sign In / Create Account
│   ├── learn/
│   │   └── page.tsx                  # Educational hub (6 metrics)
│   ├── lookup/
│   │   └── page.tsx                  # Stock search (requires sign-in)
│   ├── admin/
│   │   ├── page.tsx                  # Server component — role check (layer 2)
│   │   └── AdminDashboardClient.tsx  # Client UI for admin dashboard
│   └── api/
│       ├── auth/[...nextauth]/       # Auth.js route handler
│       ├── register/                 # POST — create new credentials user
│       ├── search/                   # GET — ticker autocomplete
│       ├── stock/[ticker]/           # GET — live stock data (auth required)
│       ├── news/[ticker]/            # GET — company news (auth required)
│       └── admin/
│           ├── stats/                # GET — summary card data
│           ├── users/                # GET — paginated user list
│           └── activity/             # GET — recent login events
│
├── components/
│   ├── Navbar.tsx                    # Session-aware: Sign In / avatar / admin link
│   ├── Footer.tsx
│   ├── ValuationGauge.tsx
│   ├── MetricCard.tsx
│   ├── StockHeader.tsx
│   ├── SearchBar.tsx
│   └── NewsCard.tsx
│
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── financeApi.ts                 # Finnhub + Alpha Vantage (server-only)
│   ├── valuationBands.ts             # Single source of truth for all thresholds
│   └── valuationSummary.ts          # Deterministic valuation commentary
│
├── auth.ts                           # Auth.js v5 config (providers, callbacks, events)
├── middleware.ts                     # Route protection (admin + stock API auth gate)
├── types/next-auth.d.ts              # Session type augmentation (id, role)
├── prisma/
│   └── schema.prisma                 # Prisma schema (User, Account, LoginEvent, etc.)
├── .env.local                        # Local secrets (gitignored)
└── .env.example                      # Template — copy to .env.local
```

---

## Security Model

- **API keys** (Finnhub, Alpha Vantage) are server-side only — never exposed to the browser
- **Passwords** are hashed with bcrypt (cost factor 12) and never logged or returned to clients
- **Admin access** uses defense-in-depth: middleware (layer 1) + server page check (layer 2) + API route check (layer 3)
- **ADMIN role** is only grantable via direct database access — no user-facing API can elevate privileges
- **JWT sessions** embed `id` and `role` — no extra DB lookup needed per request
- **`.env.local`** is gitignored via `.env*.local` glob

---

## License

MIT — educational use only.
