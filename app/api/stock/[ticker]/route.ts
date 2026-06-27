// app/api/stock/[ticker]/route.ts
// Fetches quote + fundamentals for a ticker (server-side only — API key stays hidden)
import { NextRequest, NextResponse } from "next/server";
import { getStockData } from "@/lib/financeApi";

export async function GET(
  _req: NextRequest,
  { params }: { params: { ticker: string } },
) {
  const ticker = params.ticker?.toUpperCase().trim();
  if (!ticker) {
    return NextResponse.json({ error: "Ticker is required." }, { status: 400 });
  }
  try {
    const data = await getStockData(ticker);
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to fetch stock data.";
    const status  = message.includes("not found") ? 404 : 502;
    return NextResponse.json({ error: message }, { status });
  }
}
