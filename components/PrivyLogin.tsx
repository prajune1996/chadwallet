"use client";

import { ChevronDown, LogIn, LogOut, ShieldCheck, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLogin, usePrivy } from "@privy-io/react-auth";
import { privyLoginMethodsLabel } from "@/components/privyLoginMethods";

const hasPrivy = Boolean(process.env.NEXT_PUBLIC_PRIVY_APP_ID);

function shortenAddress(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function PrivyLogin({ compact = false }: { compact?: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLSpanElement>(null);
  const { login } = useLogin({
    onError: (privyError) => {
      setError(`Privy login failed: ${privyError}`);
    },
    onComplete: () => {
      setError(null);
    }
  });
  const { ready, authenticated, user, logout } = usePrivy();
  const userEmail = user?.google?.email ?? user?.apple?.email ?? user?.email?.address;
  const userName =
    user?.google?.name ??
    (userEmail ? userEmail.split("@")[0] : null) ??
    (user?.wallet?.address ? shortenAddress(user.wallet.address) : null) ??
    "Account";

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", closeMenu);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeMenu);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  if (!hasPrivy) {
    return (
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.08] px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,.08)] transition hover:border-white/30 hover:bg-white/[0.12]"
        type="button"
        title={`Set NEXT_PUBLIC_PRIVY_APP_ID to enable Privy ${privyLoginMethodsLabel} sign-in`}
      >
        <ShieldCheck size={17} />
        {compact ? "Privy" : "Privy ready"}
      </button>
    );
  }

  if (ready && authenticated) {
    return (
      <span className="relative inline-flex" ref={menuRef}>
        <button
          aria-expanded={menuOpen}
          aria-haspopup="menu"
          className="inline-flex h-11 max-w-[210px] items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-acid to-mint px-3 text-sm font-semibold text-ink shadow-[0_12px_34px_rgba(184,255,66,.16)] transition hover:-translate-y-0.5"
          onClick={() => setMenuOpen((open) => !open)}
          type="button"
        >
          <UserCircle size={17} />
          <span className="truncate">{userName}</span>
          <ChevronDown className={`shrink-0 transition ${menuOpen ? "rotate-180" : ""}`} size={16} />
        </button>

        {menuOpen ? (
          <span
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-56 overflow-hidden rounded-lg border border-white/12 bg-ink/95 p-1 text-white shadow-[0_18px_60px_rgba(0,0,0,.35)] backdrop-blur"
            role="menu"
          >
            <span className="block border-b border-white/10 px-3 py-2">
              <span className="block truncate text-sm font-semibold">{userName}</span>
              {userEmail ? <span className="block truncate text-xs text-white/52">{userEmail}</span> : null}
            </span>
            <button
              className="mt-1 inline-flex h-10 w-full items-center gap-2 rounded-md px-3 text-left text-sm font-medium text-white/78 transition hover:bg-white/10 hover:text-white"
              onClick={async () => {
                setMenuOpen(false);
                await logout();
              }}
              role="menuitem"
              type="button"
            >
              <LogOut size={16} />
              Logout
            </button>
          </span>
        ) : null}
      </span>
    );
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-acid to-mint px-4 text-sm font-semibold text-ink shadow-[0_12px_34px_rgba(184,255,66,.16)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={!ready}
        onClick={(event) => {
          setError(null);
          login(event);
        }}
        type="button"
      >
        <LogIn size={17} />
        {!ready ? "Loading Privy" : compact ? "Sign in" : `Sign in with ${privyLoginMethodsLabel}`}
      </button>
      {error ? <span className="max-w-[260px] text-xs leading-5 text-red-300">{error}</span> : null}
    </span>
  );
}
