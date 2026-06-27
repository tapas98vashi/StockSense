// app/api/news/[ticker]/route.ts
// Fetches company news — Finnhub primary, structure for easy NewsAPI fallback
import { NextRequest, NextResponse } from "next/server";
import { getFinnhubNews, FinnhubNewsItem } from "@/lib/financeApi";

const EARNINGS_KEYWORDS = [
  "earnings", "earning", "quarterly", "guidance", "eps", "revenue",
  "profit", "loss", "q1", "q2", "q3", "q4", "results", "beats", "misses",
  "outlook", "forecast", "raised", "lowered", "reaffirm",
];

function isEarningsRelated(item: FinnhubNewsItem): boolean {
  const text = `${item.headline} ${item.summary}`.toLowerCase();
  return EARNINGS_KEYWORDS.some((kw) => text.includes(kw));
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { ticker: string } },
) {
  const ticker = params.ticker?.toUpperCase().trim();
  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required." }, { status: 400 });
  }

  try {
    const allNews  = await getFinnhubNews(ticker);
    const sorted   = allNews.sort((a, b) => b.datetime - a.datetime).slice(0, 20);
    const earnings = sorted.filter(isEarningsRelated).slice(0, 4);
    const regular  = sorted.filter((n) => !isEarningsRelated(n)).slice(0, 6);

    return NextResponse.json({
      ticker,
      earningsNews: earnings,
      regularNews:  regular,
      total:        earnings.length + regular.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch news.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
