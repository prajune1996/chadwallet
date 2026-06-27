import { TradingWorkspace } from "@/components/TradingWorkspace";
import { TokenMarquee } from "@/components/TokenMarquee";
import { Logo } from "@/components/Logo";
import { getTokens } from "@/lib/getTokens";

export default async function TradePage({ searchParams }: { searchParams: { token?: string } }) {
  const tokens = await getTokens();

  if (tokens.length === 0) {
    return (
      <main className="min-h-screen bg-ink text-white">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/82 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-4">
            <Logo />
          </div>
        </header>
        <section className="mx-auto grid min-h-[70vh] max-w-3xl place-items-center px-4 text-center">
          <div>
            <p className="text-sm font-semibold uppercase text-acid">Market data unavailable</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-6xl">No live token prices loaded.</h1>
            <p className="mt-5 text-base leading-7 text-white/62">
              Configure `BIRDEYE_API_KEY` or restore public provider access. ChadWallet no longer displays fake fallback prices.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <>
      <TokenMarquee tokens={tokens} />
      <TradingWorkspace selectedSymbol={searchParams.token} tokens={tokens} />
      <TokenMarquee tokens={tokens} reverse />
    </>
  );
}
