"use client";

import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useFirebaseAuth } from "@/providers/firebase-provider";

type Variant = "header" | "landing";

export function AuthActions({ variant = "header" }: { variant?: Variant }) {
  const {
    user,
    loading,
    ready,
    error,
    authBusy,
    signIn,
    signOut,
    retryInit,
  } = useFirebaseAuth();

  const isLanding = variant === "landing";
  const compact = !isLanding;
  const btnSize = compact
    ? "min-h-[38px] px-3 py-2 text-xs sm:min-h-[40px] sm:px-4 sm:text-sm"
    : "min-h-[48px] px-6 py-3 text-sm sm:px-8 sm:text-base";

  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-xl border border-[var(--ms-border)] bg-[var(--ms-elevated)] px-4 py-2 text-xs text-[var(--ms-muted-fg)]">
        <span className="text-base" aria-hidden>
          ⏳
        </span>
        Connexion…
      </span>
    );
  }

  if (error || !ready) {
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => retryInit()}
          disabled={loading}
          className={`ms-btn-primary ${btnSize}`}
        >
          🔄 Réessayer
        </button>
        <Link href={ROUTES.auth} className={`ms-btn-secondary ${btnSize}`}>
          ✍️ Inscription
        </Link>
      </div>
    );
  }

  return (
    <div
      className={
        isLanding
          ? "flex w-full max-w-md flex-col items-stretch gap-3 sm:flex-row sm:justify-center"
          : "flex flex-wrap items-center justify-end gap-2"
      }
    >
      {user ? (
        <button
          type="button"
          onClick={() => void signOut()}
          disabled={authBusy}
          className={`ms-btn-secondary ${btnSize}`}
        >
          {authBusy ? "…" : "🚪 Déconnexion"}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => void signIn()}
          disabled={authBusy}
          className={`ms-btn-primary ${btnSize}`}
        >
          {authBusy ? "…" : "🔐 Connexion"}
        </button>
      )}

      <Link
        href={ROUTES.auth}
        className={`ms-btn-secondary ${btnSize} text-center hover:border-[var(--ms-accent)]/35`}
      >
        ✍️ Créer mon profil
      </Link>
    </div>
  );
}
