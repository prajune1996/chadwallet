"use client";

import Link from "next/link";
import { Token, formatUsd } from "@/lib/tokens";

export function TokenMarquee({ tokens, reverse = false }: { tokens: Token[]; reverse?: boolean }) {
  const list = [...tokens, ...tokens, ...tokens];

  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-ink/70 py-2.5 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <div className={`flex w-max gap-2.5 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}>
        {list.map((token, index) => (
          <Link
            className="group inline-flex min-w-[206px] items-center justify-between rounded-lg border border-white/10 bg-white/[0.055] px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,.06)] transition hover:-translate-y-0.5 hover:border-acid/50 hover:bg-acid/10"
            href={`/trade?token=${token.symbol}`}
            key={`${token.symbol}-${index}`}
          >
            <span className="flex items-center gap-2">
              <span
                className="grid size-8 place-items-center rounded-lg text-xs font-semibold text-ink"
                style={{ backgroundColor: token.color }}
              >
                {token.icon}
              </span>
              <span>
                <span className="block font-semibold text-white">{token.symbol}</span>
                <span className="text-xs text-white/50">{formatUsd(token.price)}</span>
              </span>
            </span>
            <span className={token.change24h >= 0 ? "font-medium text-mint" : "font-medium text-red-300"}>
              {token.change24h >= 0 ? "+" : ""}
              {token.change24h.toFixed(1)}%
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
