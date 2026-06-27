import { Candle, Holder, Token, Trade, featuredTokenMetadata } from "@/lib/tokens";

const BIRDEYE_BASE_URL = "https://public-api.birdeye.so";
const tokenColors = ["#44f59d", "#ff7d45", "#ffd166", "#9b6bff", "#64d2ff", "#f472b6", "#b8ff42", "#38bdf8"];

type JsonRecord = Record<string, unknown>;

type BirdeyeToken = {
  address?: string;
  symbol?: string;
  name?: string;
  logoURI?: string;
  logo_uri?: string;
  price?: number;
  priceChange24hPercent?: number;
  priceChange24h?: number;
  volume24hUSD?: number;
  v24hUSD?: number;
  liquidity?: number;
  liquidityUSD?: number;
  holder?: number;
  holderCount?: number;
};

export const hasBirdeyeApiKey = Boolean(process.env.BIRDEYE_API_KEY);

function shortWallet(wallet: string) {
  if (wallet.length <= 10) {
    return wallet;
  }

  return `${wallet.slice(0, 4)}...${wallet.slice(-4)}`;
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function asNumber(value: unknown, fallback = 0) {
  const number = typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;
  return Number.isFinite(number) ? number : fallback;
}

function nestedArray(json: unknown, keys: string[]) {
  let current: unknown = json;

  for (const key of keys) {
    current = asRecord(current)[key];
  }

  return Array.isArray(current) ? current : [];
}

async function birdeyeFetch(path: string, init?: RequestInit) {
  const apiKey = process.env.BIRDEYE_API_KEY;

  if (!apiKey) {
    throw new Error("BIRDEYE_API_KEY is not configured");
  }

  const response = await fetch(`${BIRDEYE_BASE_URL}${path}`, {
    ...init,
    headers: {
      accept: "application/json",
      "x-api-key": apiKey,
      "x-chain": "solana",
      ...init?.headers
    }
  });

  if (!response.ok) {
    throw new Error(`Birdeye request failed: ${response.status}`);
  }

  return response.json();
}

function normalizeToken(raw: BirdeyeToken, index: number): Token | null {
  const mint = raw.address;
  const symbol = raw.symbol;

  if (!mint || !symbol) {
    return null;
  }

  const metadata = featuredTokenMetadata.find((token) => token.symbol === symbol);
  const price = asNumber(raw.price);

  if (!price) {
    return null;
  }

  return {
    symbol,
    name: raw.name ?? metadata?.name ?? symbol,
    mint,
    price,
    change24h: asNumber(raw.priceChange24hPercent ?? raw.priceChange24h),
    volume24h: asNumber(raw.volume24hUSD ?? raw.v24hUSD),
    holders: asNumber(raw.holder ?? raw.holderCount),
    liquidity: asNumber(raw.liquidityUSD ?? raw.liquidity),
    icon: metadata?.icon ?? symbol.slice(0, 1),
    sparkline: [price, price],
    color: metadata?.color ?? tokenColors[index % tokenColors.length],
    logoURI: raw.logoURI ?? raw.logo_uri,
    dataSource: "birdeye"
  };
}

export async function getBirdeyeTrendingTokens() {
  const json = await birdeyeFetch("/defi/v3/token/list?sort_by=volume_24h_usd&sort_type=desc&offset=0&limit=12");
  const rawTokens = nestedArray(json, ["data", "items"]) as BirdeyeToken[];
  const seenSymbols = new Set<string>();
  const tokens = (rawTokens.map(normalizeToken).filter(Boolean) as Token[]).filter((token) => {
    const key = token.symbol.toLowerCase();

    if (seenSymbols.has(key)) {
      return false;
    }

    seenSymbols.add(key);
    return true;
  });

  return tokens.length > 0 ? tokens : null;
}

export async function getBirdeyeCandles(address: string, interval = "1H") {
  const type = interval === "1D" ? "1D" : interval === "4H" ? "4H" : interval === "15m" ? "15m" : interval === "5m" ? "5m" : interval === "1m" ? "1m" : "1H";
  const now = Math.floor(Date.now() / 1000);
  const from = now - (type === "1D" ? 90 : type === "4H" ? 30 : type === "1H" ? 7 : 2) * 24 * 60 * 60;
  const json = await birdeyeFetch(`/defi/ohlcv?address=${encodeURIComponent(address)}&type=${type}&time_from=${from}&time_to=${now}`);
  const items = nestedArray(json, ["data", "items"]);

  return items
    .map((item): Candle | null => {
      const record = asRecord(item);
      const time = asNumber(record.unixTime ?? record.time);
      const open = asNumber(record.o ?? record.open);
      const high = asNumber(record.h ?? record.high);
      const low = asNumber(record.l ?? record.low);
      const close = asNumber(record.c ?? record.close);

      if (!time || !open || !high || !low || !close) {
        return null;
      }

      return {
        time,
        open,
        high,
        low,
        close,
        volume: asNumber(record.v ?? record.volume)
      };
    })
    .filter(Boolean) as Candle[];
}

export async function getBirdeyeTrades(address: string) {
  const json = await birdeyeFetch(`/defi/txs/token?address=${encodeURIComponent(address)}&offset=0&limit=12&tx_type=swap`);
  const items = nestedArray(json, ["data", "items"]);
  const now = Math.floor(Date.now() / 1000);

  return items
    .map((item, index): Trade | null => {
      const record = asRecord(item);
      const sideValue = String(record.side ?? record.txType ?? record.type ?? "").toLowerCase();
      const side = sideValue.includes("sell") ? "sell" : "buy";
      const wallet = String(record.owner ?? record.sourceOwner ?? record.trader ?? record.signer ?? record.txHash ?? "");

      if (!wallet) {
        return null;
      }

      const amount = asNumber(record.baseAmount ?? record.tokenAmount ?? record.amount ?? record.amountIn ?? record.amountOut);
      const value = asNumber(record.volumeUSD ?? record.valueUSD ?? record.valueUsd ?? record.amountUSD ?? record.quoteAmount);
      const blockTime = asNumber(record.blockUnixTime ?? record.blockTime ?? record.unixTime, now);
      const secondsAgo = Math.max(0, now - blockTime);
      const txHash = String(record.txHash ?? record.signature ?? record.tx_hash ?? "");
      const id = txHash ? `${txHash}-${index}` : `${wallet}-${blockTime}-${amount}-${value}-${index}`;

      return {
        id,
        side,
        wallet: shortWallet(wallet),
        amount,
        value,
        time: secondsAgo < 60 ? `${secondsAgo}s` : `${Math.floor(secondsAgo / 60)}m`
      };
    })
    .filter(Boolean) as Trade[];
}

export async function getBirdeyeHolders(address: string) {
  const json = await birdeyeFetch(`/defi/v3/token/holder?address=${encodeURIComponent(address)}&offset=0&limit=8`);
  const items = nestedArray(json, ["data", "items"]);

  return items
    .map((item, index): Holder | null => {
      const record = asRecord(item);
      const wallet = String(record.owner ?? record.wallet ?? record.address ?? "");

      if (!wallet) {
        return null;
      }

      return {
        id: `${wallet}-${index}`,
        wallet: shortWallet(wallet),
        amount: asNumber(record.ui_amount ?? record.amount),
        valueUsd: asNumber(record.valueUsd ?? record.valueUSD, undefined),
        percentage: asNumber(record.percentage ?? record.percent, undefined)
      };
    })
    .filter(Boolean) as Holder[];
}
