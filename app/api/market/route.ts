import { NextRequest, NextResponse } from "next/server";
import { getBirdeyeCandles, getBirdeyeHolders, getBirdeyeTrades, hasBirdeyeApiKey } from "@/lib/birdeye";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get("address");
  const interval = request.nextUrl.searchParams.get("interval") ?? "1H";

  if (!address) {
    return NextResponse.json({ error: "Missing token address" }, { status: 400 });
  }

  if (!hasBirdeyeApiKey) {
    return NextResponse.json({
      configured: false,
      candles: [],
      trades: [],
      holders: []
    });
  }

  try {
    const [candles, trades, holders] = await Promise.all([
      getBirdeyeCandles(address, interval),
      getBirdeyeTrades(address),
      getBirdeyeHolders(address)
    ]);

    return NextResponse.json(
      {
        configured: true,
        candles,
        trades,
        holders
      },
      {
        headers: {
          "Cache-Control": "s-maxage=15, stale-while-revalidate=45"
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        configured: true,
        candles: [],
        trades: [],
        holders: [],
        error: error instanceof Error ? error.message : "Market data unavailable"
      },
      { status: 502 }
    );
  }
}
