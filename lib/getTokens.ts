import { Token, featuredTokenMetadata } from "@/lib/tokens";
import { getBirdeyeTrendingTokens, hasBirdeyeApiKey } from "@/lib/birdeye";

type JupiterToken = {
  address?: string;
  symbol?: string;
  name?: string;
  logoURI?: string;
};

type PriceResponse = {
  data?: Record<
    string,
    {
      price?: number;
    }
  >;
};

type CoinGeckoMarket = {
  symbol?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  total_volume?: number;
  market_cap?: number;
};

const pickFeatured = (tokens: JupiterToken[]) => {
  return featuredTokenMetadata
    .map((metadata) => tokens.find((token) => token.symbol === metadata.symbol))
    .filter(Boolean) as JupiterToken[];
};

function sparklineFromChange(price: number, change24h: number) {
  const start = change24h === -100 ? price : price / (1 + change24h / 100);
  const middle = (start + price) / 2;

  return [start, middle, price].filter((value) => Number.isFinite(value) && value > 0);
}

async function getPublicMarketFallback() {
  const ids = ["solana", "jupiter-exchange-solana", "bonk", "dogwifcoin", "pyth-network", "raydium"].join(",");
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&price_change_percentage=24h`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    return new Map<string, CoinGeckoMarket>();
  }

  const markets = (await response.json()) as CoinGeckoMarket[];
  return new Map(markets.map((market) => [market.symbol?.toUpperCase() ?? "", market]));
}

export async function getTokens(): Promise<Token[]> {
  if (hasBirdeyeApiKey) {
    try {
      const birdeyeTokens = await getBirdeyeTrendingTokens();

      if (birdeyeTokens?.length) {
        return birdeyeTokens;
      }
    } catch {
      // Fall through to Jupiter's public token and price APIs.
    }
  }

  try {
    const tokenResponse = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
      next: { revalidate: 120 }
    });

    if (!tokenResponse.ok) {
      return [];
    }

    const tokenList = (await tokenResponse.json()) as JupiterToken[];
    const featured = pickFeatured(tokenList);
    const ids = featured.map((token) => token.address).filter(Boolean).join(",");

    const priceResponse = await fetch(`https://price.jup.ag/v6/price?ids=${ids}`, {
      next: { revalidate: 30 }
    });
    const prices = priceResponse.ok ? ((await priceResponse.json()) as PriceResponse) : {};
    const needsPublicFallback = !priceResponse.ok || Object.keys(prices.data ?? {}).length === 0;
    const publicMarkets = needsPublicFallback ? await getPublicMarketFallback() : new Map<string, CoinGeckoMarket>();

    return featuredTokenMetadata.map((metadata) => {
      const liveToken = featured.find((token) => token.symbol === metadata.symbol);
      const livePrice = liveToken?.address ? prices.data?.[liveToken.address]?.price : undefined;
      const publicMarket = publicMarkets.get(metadata.symbol);
      const price = livePrice ?? publicMarket?.current_price;

      if (!price) {
        return null;
      }

      const change24h = publicMarket?.price_change_percentage_24h ?? 0;

      return {
        ...metadata,
        mint: liveToken?.address,
        name: liveToken?.name ?? metadata.name,
        price,
        change24h,
        volume24h: publicMarket?.total_volume ?? 0,
        holders: 0,
        liquidity: publicMarket?.market_cap ?? 0,
        sparkline: sparklineFromChange(price, change24h),
        logoURI: liveToken?.logoURI,
        dataSource: livePrice ? "jupiter" : "coingecko"
      };
    }).filter(Boolean) as Token[];
  } catch {
    return [];
  }
}
