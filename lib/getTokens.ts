import { fallbackTokens, Token } from "@/lib/tokens";

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

const pickFeatured = (tokens: JupiterToken[]) => {
  const wanted = ["SOL", "JUP", "BONK", "WIF", "PYTH", "RAY"];
  return wanted
    .map((symbol) => tokens.find((token) => token.symbol === symbol))
    .filter(Boolean) as JupiterToken[];
};

export async function getTokens(): Promise<Token[]> {
  try {
    const tokenResponse = await fetch("https://tokens.jup.ag/tokens?tags=verified", {
      next: { revalidate: 120 }
    });

    if (!tokenResponse.ok) {
      return fallbackTokens;
    }

    const tokenList = (await tokenResponse.json()) as JupiterToken[];
    const featured = pickFeatured(tokenList);
    const ids = featured.map((token) => token.address).filter(Boolean).join(",");

    const priceResponse = await fetch(`https://price.jup.ag/v6/price?ids=${ids}`, {
      next: { revalidate: 30 }
    });
    const prices = priceResponse.ok ? ((await priceResponse.json()) as PriceResponse) : {};

    return fallbackTokens.map((fallback) => {
      const liveToken = featured.find((token) => token.symbol === fallback.symbol);
      const livePrice = liveToken?.address ? prices.data?.[liveToken.address]?.price : undefined;

      return {
        ...fallback,
        mint: liveToken?.address ?? fallback.mint,
        name: liveToken?.name ?? fallback.name,
        price: livePrice ?? fallback.price
      };
    });
  } catch {
    return fallbackTokens;
  }
}
