import { TradingWorkspace } from "@/components/TradingWorkspace";
import { TokenMarquee } from "@/components/TokenMarquee";
import { getTokens } from "@/lib/getTokens";

export default async function TradePage({ searchParams }: { searchParams: { token?: string } }) {
  const tokens = await getTokens();

  return (
    <>
      <TokenMarquee tokens={tokens} />
      <TradingWorkspace selectedSymbol={searchParams.token?.toUpperCase()} tokens={tokens} />
      <TokenMarquee tokens={tokens} reverse />
    </>
  );
}
