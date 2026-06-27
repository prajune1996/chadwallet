export type Token = {
  symbol: string;
  name: string;
  mint?: string;
  price: number;
  change24h: number;
  volume24h: number;
  holders: number;
  liquidity: number;
  icon: string;
  sparkline: number[];
  color: string;
  logoURI?: string;
  dataSource?: "birdeye" | "jupiter" | "coingecko";
};

export type TokenMetadata = {
  symbol: string;
  name: string;
  icon: string;
  color: string;
};

export type Trade = {
  id: string;
  side: "buy" | "sell";
  wallet: string;
  amount: number;
  value: number;
  time: string;
};

export type Candle = {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type Holder = {
  id: string;
  wallet: string;
  amount: number;
  valueUsd?: number;
  percentage?: number;
};

export const featuredTokenMetadata: TokenMetadata[] = [
  {
    symbol: "SOL",
    name: "Solana",
    icon: "◎",
    color: "#44f59d"
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    icon: "J",
    color: "#ff7d45"
  },
  {
    symbol: "BONK",
    name: "Bonk",
    icon: "B",
    color: "#ffd166"
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    icon: "W",
    color: "#9b6bff"
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    icon: "P",
    color: "#64d2ff"
  },
  {
    symbol: "RAY",
    name: "Raydium",
    icon: "R",
    color: "#f472b6"
  }
];

export const formatUsd = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: value >= 100000 ? "compact" : "standard",
    maximumFractionDigits: value < 1 ? 6 : 2
  }).format(value);

export const formatNumber = (value: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(value);
