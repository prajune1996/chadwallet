"use client";

import { PrivyProvider } from "@privy-io/react-auth";
import { activePrivyLoginMethods } from "@/components/privyLoginMethods";

export function Providers({ children }: { children: React.ReactNode }) {
  const appId = process.env.NEXT_PUBLIC_PRIVY_APP_ID ?? "";

  return (
    <PrivyProvider
      appId={appId}
      config={{
        loginMethods: activePrivyLoginMethods,
        loginMethodsAndOrder: {
          primary: activePrivyLoginMethods
        },
        appearance: {
          theme: "#07100c",
          accentColor: "#b8ff42",
          logo: "/brand/chadwallet-mark.svg",
          landingHeader: "Welcome to Chadwallet",
          loginMessage: "Sign in to preview trades and manage your Solana wallet.",
          walletList: [],
          walletChainType: "solana-only"
        },
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: "eoaOnly"
          }
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off"
          },
          solana: {
            createOnLogin: "users-without-wallets"
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
}
