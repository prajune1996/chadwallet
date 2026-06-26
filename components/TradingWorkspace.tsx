"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { AlertCircle, ArrowLeft, BadgeDollarSign, CandlestickChart, CheckCircle2, Flame, Loader2, LogIn, Search, WalletCards } from "lucide-react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { Logo } from "@/components/Logo";
import { PrivyLogin } from "@/components/PrivyLogin";
import { TradingViewChart } from "@/components/TradingViewChart";
import { Token, formatNumber, formatUsd, liveTrades } from "@/lib/tokens";

const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

type Props = {
  tokens: Token[];
  selectedSymbol?: string;
};

type TradeFeedback =
  | { state: "idle"; message: "" }
  | { state: "pending"; message: string }
  | { state: "success"; message: string }
  | { state: "error"; message: string };

export function TradingWorkspace({ tokens, selectedSymbol }: Props) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("1.5");
  const [tradeFeedback, setTradeFeedback] = useState<TradeFeedback>({ state: "idle", message: "" });
  const tradeFeedbackTimeoutRef = useRef<number | null>(null);
  const { ready, authenticated } = usePrivy();
  const { login } = useLogin({
    onError: () => {
      setTradeFeedback({ state: "error", message: "Sign in failed. Try again before trading." });
    },
    onComplete: () => {
      setTradeFeedback({ state: "success", message: "Signed in. Review your amount and submit again." });
    }
  });
  const selected = tokens.find((token) => token.symbol === selectedSymbol) ?? tokens[0];
  const amountValue = Number(amount);
  const estimated = Number.isFinite(amountValue) ? amountValue * selected.price : 0;
  const isValidAmount = Number.isFinite(amountValue) && amountValue > 0;

  useEffect(() => {
    if (tradeFeedbackTimeoutRef.current) {
      window.clearTimeout(tradeFeedbackTimeoutRef.current);
      tradeFeedbackTimeoutRef.current = null;
    }

    setTradeFeedback({ state: "idle", message: "" });
  }, [amount, selected.symbol, side]);

  useEffect(() => {
    return () => {
      if (tradeFeedbackTimeoutRef.current) {
        window.clearTimeout(tradeFeedbackTimeoutRef.current);
      }
    };
  }, []);

  function handleTrade(event: MouseEvent<HTMLButtonElement>) {
    if (!isValidAmount) {
      setTradeFeedback({ state: "error", message: "Enter an amount greater than 0 SOL." });
      return;
    }

    if (!hasPrivy) {
      setTradeFeedback({ state: "error", message: "Sign in is not configured. Add NEXT_PUBLIC_PRIVY_APP_ID before trading." });
      return;
    }

    if (!ready) {
      setTradeFeedback({ state: "pending", message: "Checking sign-in status..." });
      return;
    }

    if (!authenticated) {
      setTradeFeedback({ state: "error", message: "Sign in to preview buy and sell orders." });
      login(event);
      return;
    }

    if (tradeFeedbackTimeoutRef.current) {
      window.clearTimeout(tradeFeedbackTimeoutRef.current);
    }

    setTradeFeedback({ state: "pending", message: `${side === "buy" ? "Buying" : "Selling"} ${amountValue.toFixed(2)} SOL of ${selected.symbol}...` });

    tradeFeedbackTimeoutRef.current = window.setTimeout(() => {
      setTradeFeedback({
        state: "success",
        message: `${side === "buy" ? "Buy" : "Sell"} preview ready: ${amountValue.toFixed(2)} SOL, about ${formatUsd(estimated)}.`
      });
      tradeFeedbackTimeoutRef.current = null;
    }, 650);
  }

  return (
    <main className="min-h-screen bg-ink text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/82 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4">
          <div className="flex items-center gap-4">
            <Link className="grid size-10 place-items-center rounded-lg border border-white/10 bg-white/[0.06] transition hover:-translate-y-0.5 hover:border-acid/40" href="/">
              <ArrowLeft size={18} />
            </Link>
            <Logo />
          </div>
          <div className="hidden h-10 min-w-[360px] items-center gap-2 rounded-lg border border-white/10 bg-white/[0.055] px-3 text-sm text-white/45 shadow-[inset_0_1px_0_rgba(255,255,255,.06)] md:flex">
            <Search size={16} />
            Search tokens, mints, wallets
          </div>
          <PrivyLogin compact />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-4 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)_330px]">
        <aside className="surface fade-up rounded-lg">
          <div className="flex items-center justify-between border-b border-white/10 p-4">
            <div>
              <p className="text-xs font-semibold uppercase text-acid">Trending</p>
              <h1 className="mt-1 text-xl font-semibold">Solana tokens</h1>
            </div>
            <Flame className="text-ember" size={22} />
          </div>
          <div className="grid gap-1 p-2">
            {tokens.map((token, index) => {
              const active = token.symbol === selected.symbol;
              return (
                <Link
                  className={`rounded-lg p-3 transition ${
                    active ? "bg-gradient-to-r from-acid to-mint text-ink shadow-[0_14px_36px_rgba(184,255,66,.16)]" : "bg-transparent text-white hover:translate-x-1 hover:bg-white/[0.06]"
                  }`}
                  href={`/trade?token=${token.symbol}`}
                  key={token.symbol}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-3">
                      <span
                        className="grid size-9 place-items-center rounded-lg text-sm font-semibold text-ink"
                        style={{ backgroundColor: active ? "#07100c" : token.color, color: active ? "#b8ff42" : "#07100c" }}
                      >
                        {token.icon}
                      </span>
                      <span>
                        <span className="block font-semibold">{token.symbol}</span>
                        <span className={active ? "text-xs text-ink/60" : "text-xs text-white/45"}>#{index + 1} trending</span>
                      </span>
                    </span>
                    <span className={active ? "font-medium text-ink" : token.change24h >= 0 ? "font-medium text-mint" : "font-medium text-red-300"}>
                      {token.change24h >= 0 ? "+" : ""}
                      {token.change24h.toFixed(1)}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </aside>

        <section className="grid gap-4 fade-up delay-100">
          <div className="surface hairline rounded-lg p-4">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div className="flex items-center gap-4">
                <div className="grid size-14 place-items-center rounded-lg text-2xl font-semibold text-ink shadow-[0_16px_36px_rgba(0,0,0,.18)]" style={{ backgroundColor: selected.color }}>
                  {selected.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-3xl font-semibold">{selected.symbol}</h2>
                    <span className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-xs font-medium text-white/55">
                      {selected.name}
                    </span>
                  </div>
                  <p className="mt-2 max-w-xl truncate text-sm text-white/45">{selected.mint}</p>
                </div>
              </div>
              <div className="text-left md:text-right">
                <p className="text-4xl font-semibold">{formatUsd(selected.price)}</p>
                <p className={selected.change24h >= 0 ? "mt-1 font-medium text-mint" : "mt-1 font-medium text-red-300"}>
                  {selected.change24h >= 0 ? "+" : ""}
                  {selected.change24h.toFixed(1)}% today
                </p>
              </div>
            </div>
          </div>

          <div className="surface rounded-lg p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                <CandlestickChart className="text-acid" size={20} />
                Price chart
              </h3>
              <span className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-semibold uppercase text-white/52">Candles</span>
            </div>
            <TradingViewChart token={selected} />
          </div>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_330px]">
            <div className="surface rounded-lg p-4">
              <h3 className="text-lg font-semibold">Live trades</h3>
              <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
                {liveTrades.map((trade) => (
                  <div className="grid grid-cols-4 items-center border-b border-white/10 px-3 py-3 text-sm transition hover:bg-white/[0.045] last:border-b-0" key={`${trade.wallet}-${trade.time}`}>
                    <span className={trade.side === "buy" ? "font-semibold uppercase text-mint" : "font-semibold uppercase text-red-300"}>{trade.side}</span>
                    <span className="text-white/65">{trade.wallet}</span>
                    <span>{trade.amount.toFixed(1)} {selected.symbol}</span>
                    <span className="text-right font-medium">{formatUsd(trade.value)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="surface rounded-lg p-4">
              <h3 className="text-lg font-semibold">Holders</h3>
              <div className="mt-4 grid gap-3">
                {["Chad Alpha", "Wallet 9qp", "Smart Money", "Fresh Buyer", "LP Vault"].map((holder, index) => (
                  <div className="flex items-center justify-between rounded-lg bg-white/[0.045] p-3 transition hover:bg-white/[0.075]" key={holder}>
                    <span>
                      <span className="block font-medium">{holder}</span>
                      <span className="text-xs text-white/45">{(12.8 - index * 1.7).toFixed(1)}% supply</span>
                    </span>
                    <span className="font-semibold">{formatUsd(selected.price * (8200 - index * 950))}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <aside className="grid gap-4 fade-up delay-200 lg:sticky lg:top-[88px] lg:self-start">
          <div className="surface rounded-lg p-4">
            <div className="grid grid-cols-2 rounded-lg bg-white/[0.06] p-1">
              {(["buy", "sell"] as const).map((mode) => (
                <button
                  className={`h-10 rounded-lg text-sm font-semibold capitalize transition ${side === mode ? "bg-gradient-to-r from-acid to-mint text-ink shadow-[0_10px_28px_rgba(184,255,66,.14)]" : "text-white/55 hover:text-white"}`}
                  key={mode}
                  onClick={() => setSide(mode)}
                  type="button"
                >
                  {mode}
                </button>
              ))}
            </div>
            <label className="mt-5 block text-sm font-medium text-white/60" htmlFor="amount">
              Amount in SOL
            </label>
            <input
              className="mt-2 h-14 w-full rounded-lg border border-white/10 bg-ink/80 px-4 text-2xl font-semibold outline-none ring-acid/40 transition focus:border-acid/50 focus:ring-4"
              id="amount"
              inputMode="decimal"
              onChange={(event) => setAmount(event.target.value)}
              value={amount}
            />
            {tradeFeedback.state !== "idle" ? (
              <div
                className={`mt-4 flex items-start gap-2 rounded-lg border p-3 text-sm ${
                  tradeFeedback.state === "success"
                    ? "border-mint/30 bg-mint/10 text-mint"
                    : tradeFeedback.state === "error"
                      ? "border-red-300/30 bg-red-300/10 text-red-200"
                      : "border-acid/30 bg-acid/10 text-acid"
                }`}
                role={tradeFeedback.state === "error" ? "alert" : "status"}
              >
                {tradeFeedback.state === "pending" ? <Loader2 className="mt-0.5 animate-spin" size={16} /> : tradeFeedback.state === "success" ? <CheckCircle2 className="mt-0.5" size={16} /> : tradeFeedback.message.startsWith("Sign in") ? <LogIn className="mt-0.5" size={16} /> : <AlertCircle className="mt-0.5" size={16} />}
                <span>{tradeFeedback.message}</span>
              </div>
            ) : null}
            <div className="mt-4 rounded-lg bg-white/[0.05] p-3">
              <div className="flex justify-between text-sm text-white/55">
                <span>Estimated value</span>
                <span>{formatUsd(estimated)}</span>
              </div>
              <div className="mt-2 flex justify-between text-sm text-white/55">
                <span>Route</span>
                <span>Jupiter ready</span>
              </div>
            </div>
            <button
              className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-acid to-mint font-semibold text-ink shadow-[0_16px_38px_rgba(184,255,66,.16)] transition hover:-translate-y-0.5"
              onClick={handleTrade}
              type="button"
            >
              {tradeFeedback.state === "pending" ? <Loader2 className="animate-spin" size={18} /> : null}
              {tradeFeedback.state === "pending" ? "Submitting" : `${side === "buy" ? "Buy" : "Sell"} ${selected.symbol}`}
            </button>
          </div>

          <div className="surface rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <WalletCards className="text-acid" size={20} />
              Your position
            </h3>
            <div className="mt-4 grid gap-3">
              <div className="flex justify-between">
                <span className="text-white/55">Balance</span>
                <span className="font-semibold">128.44 {selected.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/55">Avg entry</span>
                <span className="font-semibold">{formatUsd(selected.price * 0.82)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/55">Unrealized PnL</span>
                <span className="font-semibold text-mint">+{formatUsd(selected.price * 23.7)}</span>
              </div>
            </div>
          </div>

          <div className="surface rounded-lg p-4">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <BadgeDollarSign className="text-acid" size={20} />
              Market stats
            </h3>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between"><span className="text-white/55">Volume</span><span className="font-medium">{formatUsd(selected.volume24h)}</span></div>
              <div className="flex justify-between"><span className="text-white/55">Liquidity</span><span className="font-medium">{formatUsd(selected.liquidity)}</span></div>
              <div className="flex justify-between"><span className="text-white/55">Holders</span><span className="font-medium">{formatNumber(selected.holders)}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
