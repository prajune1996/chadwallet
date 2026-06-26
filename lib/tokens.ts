export type Token = {
  symbol: string;
  name: string;
  mint: string;
  price: number;
  change24h: number;
  volume24h: number;
  holders: number;
  liquidity: number;
  icon: string;
  sparkline: number[];
  color: string;
};

export type Trade = {
  side: "buy" | "sell";
  wallet: string;
  amount: number;
  value: number;
  time: string;
};

export const fallbackTokens: Token[] = [
  {
    symbol: "SOL",
    name: "Solana",
    mint: "So11111111111111111111111111111111111111112",
    price: 142.84,
    change24h: 7.8,
    volume24h: 2384000000,
    holders: 2479000,
    liquidity: 923000000,
    icon: "◎",
    sparkline: [124, 128, 126, 132, 138, 135, 144],
    color: "#44f59d"
  },
  {
    symbol: "JUP",
    name: "Jupiter",
    mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN",
    price: 0.93,
    change24h: 13.4,
    volume24h: 319000000,
    holders: 691000,
    liquidity: 186000000,
    icon: "J",
    sparkline: [0.7, 0.73, 0.79, 0.82, 0.8, 0.9, 0.93],
    color: "#ff7d45"
  },
  {
    symbol: "BONK",
    name: "Bonk",
    mint: "DezXAZ8z7PnrnRJjz3kdF9G1ZiXYS2D3zTi4NeH7B263",
    price: 0.000025,
    change24h: 21.2,
    volume24h: 219000000,
    holders: 934000,
    liquidity: 99000000,
    icon: "B",
    sparkline: [19, 21, 20, 23, 25, 24, 26],
    color: "#ffd166"
  },
  {
    symbol: "WIF",
    name: "dogwifhat",
    mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzL352XFg8eBnv",
    price: 1.62,
    change24h: -4.6,
    volume24h: 184000000,
    holders: 213000,
    liquidity: 121000000,
    icon: "W",
    sparkline: [1.72, 1.68, 1.7, 1.64, 1.59, 1.63, 1.62],
    color: "#9b6bff"
  },
  {
    symbol: "PYTH",
    name: "Pyth Network",
    mint: "HZ1JovNiVvGrGNiiYvEozEVgM7uPNL3KAPeNJPvLyG7L",
    price: 0.41,
    change24h: 5.1,
    volume24h: 78000000,
    holders: 178000,
    liquidity: 68000000,
    icon: "P",
    sparkline: [0.35, 0.37, 0.36, 0.39, 0.4, 0.39, 0.41],
    color: "#64d2ff"
  },
  {
    symbol: "RAY",
    name: "Raydium",
    mint: "4k3Dyjzvzp8e8gFaQqHXYP1nGzK3Z1Eh2JZ2ZtYQf7R",
    price: 2.48,
    change24h: 9.7,
    volume24h: 126000000,
    holders: 152000,
    liquidity: 158000000,
    icon: "R",
    sparkline: [2.08, 2.2, 2.18, 2.31, 2.38, 2.42, 2.48],
    color: "#f472b6"
  }
];

export const liveTrades: Trade[] = [
  { side: "buy", wallet: "7Jk...9qp", amount: 42.8, value: 6112, time: "now" },
  { side: "sell", wallet: "H3p...2va", amount: 13.1, value: 1871, time: "11s" },
  { side: "buy", wallet: "9Zn...mL4", amount: 88.4, value: 12625, time: "24s" },
  { side: "buy", wallet: "Fmo...7Ch", amount: 19.7, value: 2814, time: "39s" },
  { side: "sell", wallet: "Ax8...Qd1", amount: 6.2, value: 886, time: "52s" }
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
