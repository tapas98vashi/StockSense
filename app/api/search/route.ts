// app/api/search/route.ts
// Ticker autocomplete — proxies Finnhub /search to protect the API key
import { NextRequest, NextResponse } from "next/server";
import { searchFinnhub } from "@/lib/financeApi";

// U.S. tickers never contain a dot. International cross-listings always do
// (e.g. MSFT.BC = Berlin, AAPL.BA = Buenos Aires). Filtering these out keeps
// the autocomplete to U.S.-listed securities only.
function isUSTicker(symbol: string): boolean {
  return !symbol.includes(".");
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (!q || q.length < 1) {
    return NextResponse.json({ results: [] });
  }
  try {
    const data = await searchFinnhub(q);
    // Filter to US-only equities, then limit to 8
    const results = (data.result ?? [])
      .filter(
        (r) =>
          (r.type === "Common Stock" || r.type === "EQS" || r.type === "") &&
          isUSTicker(r.displaySymbol || r.symbol),
      )
      .slice(0, 8)
      .map((r) => ({
        symbol:      r.displaySymbol || r.symbol,
        description: r.description,
        type:        r.type,
      }));
    return NextResponse.json({ results });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Search failed.";
    return NextResponse.json({ error: message, results: [] }, { status: 502 });
  }
}
