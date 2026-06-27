import Link from "next/link";
import {
  Activity,
  Apple,
  ArrowRight,
  BellRing,
  ChartCandlestick,
  Flame,
  Play,
  Radio,
  ShieldCheck,
  Sparkles,
  Trophy,
  Wallet
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { PrivyLogin } from "@/components/PrivyLogin";
import { TokenMarquee } from "@/components/TokenMarquee";
import { privyLoginMethodsLabel } from "@/components/privyLoginMethods";
import { getTokens } from "@/lib/getTokens";
import { formatNumber, formatUsd, Token } from "@/lib/tokens";

const androidUrl = "https://play.google.com/store/apps/details?id=xyz.chadwallet.www";
const iphoneUrl = "https://apps.apple.com/us/app/chadwallet/id6757367474";

function MiniChart({ token }: { token: Token }) {
  const points = token.sparkline
    .map((value, index) => {
      const min = Math.min(...token.sparkline);
      const max = Math.max(...token.sparkline);
      const range = max - min || 1;
      const x = (index / (token.sparkline.length - 1)) * 100;
      const y = 82 - ((value - min) / range) * 58;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg aria-hidden className="h-16 w-full overflow-visible" viewBox="0 0 100 90">
      <polyline fill="none" points={points} stroke={token.color} strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" />
    </svg>
  );
}

function SignalCard({
  token,
  label,
  className = ""
}: {
  token: Token;
  label: string;
  className?: string;
}) {
  return (
    <Link
      className={`surface surface-hover hidden rounded-2xl p-4 text-left lg:block ${className}`}
      href={`/trade?token=${token.symbol}`}
    >
      <div className="flex items-center justify-between gap-5">
        <span className="flex items-center gap-3">
          <span className="signal-dot size-2 rounded-full bg-acid" />
          <span className="text-xs font-medium uppercase text-white/45">{label}</span>
        </span>
        <span className={token.change24h >= 0 ? "text-sm font-medium text-mint" : "text-sm font-medium text-red-300"}>
          {token.change24h >= 0 ? "+" : ""}
          {token.change24h.toFixed(1)}%
        </span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span>
          <span className="block text-2xl font-semibold">{token.symbol}</span>
          <span className="text-sm text-white/45">{formatUsd(token.volume24h)} vol</span>
        </span>
        <span className="grid size-12 place-items-center rounded-2xl text-sm font-semibold text-ink" style={{ backgroundColor: token.color }}>
          {token.icon}
        </span>
      </div>
    </Link>
  );
}

function PhonePreview({ token, className = "" }: { token: Token; className?: string }) {
  return (
    <div className={`phone-shell rounded-[2rem] p-2 ${className}`}>
      <div className="phone-screen min-h-[430px] rounded-[1.55rem] p-4">
        <div className="mx-auto mb-5 h-1.5 w-16 rounded-full bg-white/[0.18]" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase text-white/45">ChadWallet</p>
            <h3 className="mt-1 text-2xl font-semibold">{token.symbol}</h3>
          </div>
          <span className="grid size-11 place-items-center rounded-2xl text-sm font-semibold text-ink" style={{ backgroundColor: token.color }}>
            {token.icon}
          </span>
        </div>
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-4">
          <div className="flex items-end justify-between">
            <span className="text-3xl font-semibold">{formatUsd(token.price)}</span>
            <span className={token.change24h >= 0 ? "text-sm font-medium text-mint" : "text-sm font-medium text-red-300"}>
              {token.change24h >= 0 ? "+" : ""}
              {token.change24h.toFixed(1)}%
            </span>
          </div>
          <MiniChart token={token} />
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="h-11 rounded-xl bg-gradient-to-r from-acid to-mint text-sm font-semibold text-ink" type="button">
            Buy
          </button>
          <button className="h-11 rounded-xl border border-white/12 bg-white/[0.06] text-sm font-medium text-white" type="button">
            Sell
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {[
            ["24h volume", formatUsd(token.volume24h)],
            ["Liquidity", formatUsd(token.liquidity)],
            ["Holders", formatNumber(token.holders)]
          ].map(([item, value]) => (
            <div className="flex items-center justify-between rounded-xl bg-white/[0.055] px-3 py-2" key={item}>
              <span className="text-xs text-white/62">{item}</span>
              <span className="text-xs font-medium text-acid">{value}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 grid grid-cols-4 gap-2 rounded-2xl border border-white/10 bg-black/20 p-2 text-center text-[10px] font-medium text-white/48">
          <span className="rounded-xl bg-white/[0.08] py-2 text-white">Feed</span>
          <span className="py-2">Trade</span>
          <span className="py-2">Wallet</span>
          <span className="py-2">Alpha</span>
        </div>
      </div>
    </div>
  );
}

function WebTerminal({ tokens }: { tokens: Token[] }) {
  const [top, second = tokens[0], third = tokens[0]] = tokens;

  return (
    <div className="surface scan-panel rounded-[2rem] p-3">
      <div className="rounded-[1.45rem] border border-white/10 bg-black/40 p-4">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-red-400" />
            <span className="size-3 rounded-full bg-yellow-300" />
            <span className="size-3 rounded-full bg-mint" />
          </div>
          <span className="rounded-full border border-acid/20 bg-acid/10 px-3 py-1 text-xs font-medium text-acid">market terminal</span>
        </div>
        <div className="grid gap-3 lg:grid-cols-[220px_minmax(0,1fr)_230px]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <p className="mb-3 text-xs font-medium uppercase text-white/40">Trending</p>
            {tokens.slice(0, 4).map((token) => (
              <Link className="flex items-center justify-between rounded-xl px-2 py-2 transition hover:bg-white/[0.06]" href={`/trade?token=${token.symbol}`} key={token.symbol}>
                <span className="flex items-center gap-2">
                  <span className="grid size-8 place-items-center rounded-xl text-xs font-semibold text-ink" style={{ backgroundColor: token.color }}>
                    {token.icon}
                  </span>
                  <span className="text-sm font-medium">{token.symbol}</span>
                </span>
                <span className={token.change24h >= 0 ? "text-xs text-mint" : "text-xs text-red-300"}>{token.change24h.toFixed(1)}%</span>
              </Link>
            ))}
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium uppercase text-white/40">{top.name}</p>
                <h3 className="mt-1 text-4xl font-semibold">{top.symbol}</h3>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold">{formatUsd(top.price)}</p>
                <p className="text-sm font-medium text-mint">+{top.change24h.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-8 h-44 rounded-2xl border border-white/10 bg-gradient-to-b from-acid/10 to-transparent p-5">
              <MiniChart token={top} />
              <div className="mt-3 grid grid-cols-6 gap-2">
                {top.sparkline.map((_, index) => (
                  <span className="h-1 rounded-full bg-white/10" key={index} />
                ))}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
              <div className="rounded-xl bg-white/[0.05] p-3">
                <span className="block text-white/40">Liquidity</span>
                <span className="font-medium">{formatUsd(top.liquidity)}</span>
              </div>
              <div className="rounded-xl bg-white/[0.05] p-3">
                <span className="block text-white/40">Holders</span>
                <span className="font-medium">{formatNumber(top.holders)}</span>
              </div>
              <div className="rounded-xl bg-white/[0.05] p-3">
                <span className="block text-white/40">Volume</span>
                <span className="font-medium">{formatUsd(top.volume24h)}</span>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.045] p-3">
            <p className="mb-3 text-xs font-medium uppercase text-white/40">Market movers</p>
            {[top, second, third].map((token, index) => (
              <div className="mb-2 rounded-xl bg-white/[0.05] p-3" key={`${token.symbol}-${index}`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{token.symbol}</span>
                  <span className={token.change24h >= 0 ? "text-xs text-mint" : "text-xs text-red-300"}>
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-white/45">{formatUsd(token.volume24h)} 24h volume</p>
              </div>
            ))}
            <Link className="mt-3 flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-acid to-mint text-sm font-semibold text-ink" href={`/trade?token=${top.symbol}`}>
              Trade {top.symbol}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const tokens = await getTokens();

  if (tokens.length === 0) {
    return (
      <main className="min-h-screen bg-ink text-white">
        <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Logo />
          <PrivyLogin compact />
        </header>
        <section className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 text-center">
          <div>
            <p className="text-sm font-semibold uppercase text-acid">Market data unavailable</p>
            <h1 className="mt-3 text-5xl font-semibold leading-tight sm:text-7xl">ChadWallet needs live token data.</h1>
            <p className="mt-5 text-base leading-7 text-white/62">
              Add `BIRDEYE_API_KEY` or confirm the public price provider is reachable. The app will not show hardcoded token prices.
            </p>
          </div>
        </section>
      </main>
    );
  }

  const [top, second = tokens[0], third = tokens[0]] = tokens;

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <TokenMarquee tokens={tokens} />

      <section className="hero-radial relative min-h-[calc(100vh-61px)]">
        <div className="grid-fade absolute inset-0 opacity-50" />
        <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-white/60 md:flex">
            <a className="transition hover:text-white" href="#feed">Feed</a>
            <a className="transition hover:text-white" href="#web">Web</a>
            <Link className="transition hover:text-white" href="/trade">Trade</Link>
          </nav>
          <PrivyLogin compact />
        </header>

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-10 pt-5 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center fade-up">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-acid/25 bg-acid/10 px-4 py-2 text-sm font-medium text-acid">
              <Sparkles size={16} />
              Social trading wallet for Solana
            </div>
            <h1 className="text-[4.25rem] font-semibold leading-[0.82] tracking-normal text-white sm:text-[7.4rem] lg:text-[10.5rem]">
              fomo with receipts
            </h1>
            <p className="mx-auto mt-7 max-w-2xl text-lg leading-8 text-white/66 sm:text-xl">
              ChadWallet turns Solana wallet activity, token heat, and market flow into a social trading home screen.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-acid to-mint px-5 text-sm font-semibold text-ink shadow-[0_18px_50px_rgba(184,255,66,.18)] transition hover:-translate-y-0.5"
                href="/trade"
              >
                Launch trading
                <ArrowRight size={18} />
              </Link>
              <PrivyLogin />
            </div>
          </div>

          <div className="relative mx-auto mt-14 min-h-[600px] max-w-6xl fade-up delay-200">
            <div className="orbital-ring absolute left-1/2 top-8 hidden h-[520px] w-[82%] -translate-x-1/2 lg:block" />
            <div className="orbital-ring absolute left-1/2 top-20 hidden h-[390px] w-[62%] -translate-x-1/2 lg:block" />
            <div className="absolute left-1/2 top-0 h-[500px] w-[76%] -translate-x-1/2 rounded-[5rem] bg-acid/10 blur-3xl" />
            <SignalCard className="absolute left-10 top-5 w-[260px] -rotate-6" label="market volume" token={top} />
            <SignalCard className="absolute right-10 top-16 w-[260px] rotate-6" label="token heat" token={second} />
            <SignalCard className="absolute bottom-28 left-24 w-[260px] rotate-3" label="holder count" token={third} />
            <div className="absolute left-0 top-24 hidden w-[270px] -rotate-12 lg:block">
              <PhonePreview token={second} />
            </div>
            <div className="absolute right-0 top-24 hidden w-[270px] rotate-12 lg:block">
              <PhonePreview token={third} />
            </div>
            <div className="relative mx-auto w-full max-w-[430px] pt-8">
              <PhonePreview className="float-soft" token={top} />
            </div>
          </div>
        </div>
      </section>

      <section id="feed" className="border-y border-white/10 bg-white/[0.035]">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="max-w-xl">
            <p className="text-sm font-semibold uppercase text-acid">Market signal feed</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">The feed is the alpha.</h2>
            <p className="mt-5 text-base leading-7 text-white/62">
              Track trending mints, holder growth, liquidity, and token velocity without opening five tabs.
            </p>
          </div>

          <div className="grid gap-3">
            {tokens.slice(0, 5).map((token, index) => (
              <Link
                className="surface surface-hover flex items-center justify-between rounded-2xl p-4"
                href={`/trade?token=${token.symbol}`}
                key={token.symbol}
              >
                <span className="flex items-center gap-4">
                  <span className="text-sm font-medium text-white/35">0{index + 1}</span>
                  <span className="grid size-11 place-items-center rounded-2xl text-sm font-semibold text-ink" style={{ backgroundColor: token.color }}>
                    {token.icon}
                  </span>
                  <span>
                    <span className="block text-lg font-semibold">{token.symbol}</span>
                    <span className="text-sm text-white/45">{token.name}</span>
                  </span>
                </span>
                <span className="text-right">
                  <span className="block font-semibold">{formatUsd(token.price)}</span>
                  <span className={token.change24h >= 0 ? "text-sm font-medium text-mint" : "text-sm font-medium text-red-300"}>
                    {token.change24h >= 0 ? "+" : ""}
                    {token.change24h.toFixed(1)}%
                  </span>
                </span>
              </Link>
            ))}
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                `${formatNumber(top.holders)} ${top.symbol} holders`,
                `${formatUsd(top.liquidity)} ${top.symbol} liquidity`,
                `${formatUsd(top.volume24h)} ${top.symbol} volume`
              ].map((item) => (
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4" key={item}>
                  <span className="mb-3 block size-2 rounded-full bg-acid" />
                  <p className="text-sm font-medium text-white/70">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="web" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <WebTerminal tokens={tokens} />

          <div>
            <p className="text-sm font-semibold uppercase text-acid">Web trading bonus</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">A terminal for the token you just tapped.</h2>
            <p className="mt-5 text-base leading-7 text-white/62">
              Tap any token banner and jump into charts, holders, live trades, buy/sell controls, and position context.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                [ChartCandlestick, "Token chart", "Price action and momentum at a glance."],
                [Wallet, "Position panel", "Balance, entry, route, and PnL in one view."],
                [Radio, "Live trades", "Recent buys and sells from Birdeye when configured."],
                [ShieldCheck, "Privy login", `${privyLoginMethodsLabel} onboarding for users.`]
              ].map(([Icon, title, copy]) => (
                <div className="surface surface-hover rounded-2xl p-4" key={String(title)}>
                  <Icon className="text-acid" size={22} />
                  <h3 className="mt-4 font-semibold">{title as string}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/52">{copy as string}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[0.035]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
          {[
            [Trophy, "Leaderboards", `${formatNumber(top.holders)} holders tracked`],
            [BellRing, "Alerts", "New buys, whales, and holder spikes"],
            [Activity, "Market heat", `${formatUsd(top.volume24h)} 24h volume`],
            [Flame, "FOMO feed", "Rotating top and bottom token banners"]
          ].map(([Icon, title, copy], index) => (
            <div className="surface feature-card rounded-2xl p-5" key={String(title)} style={{ animationDelay: `${index * 240}ms` }}>
              <Icon className="text-acid" size={24} />
              <h3 className="mt-8 text-xl font-semibold">{title as string}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{copy as string}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative px-4 py-20 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-1/2 h-40 -translate-y-1/2 bg-acid/10 blur-3xl" />
        <div className="surface relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] p-8 text-center sm:p-12">
          <div className="drift-x absolute -left-16 top-10 size-40 rounded-full border border-acid/20 bg-acid/10 blur-2xl" />
          <h2 className="mx-auto max-w-4xl text-4xl font-semibold leading-tight sm:text-7xl">stop watching charts alone.</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-white/62">
            Sign in, discover Solana market flow, and open the trading page when the banner catches fire.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a className="inline-flex h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-white/30" href={iphoneUrl} rel="noreferrer" target="_blank">
              <Apple size={20} />
              App Store
            </a>
            <a className="inline-flex h-12 items-center gap-3 rounded-xl border border-white/15 bg-white/[0.08] px-4 text-sm font-medium text-white transition hover:-translate-y-0.5 hover:border-white/30" href={androidUrl} rel="noreferrer" target="_blank">
              <Play size={19} />
              Google Play
            </a>
            <Link className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-acid to-mint px-5 text-sm font-semibold text-ink" href="/trade">
              Trade now
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <TokenMarquee tokens={tokens} reverse />
    </main>
  );
}
