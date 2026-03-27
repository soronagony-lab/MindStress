"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AuthActions } from "@/components/auth/auth-actions";
import { ROUTES } from "@/lib/routes";

const links = [
  {
    href: ROUTES.home,
    emoji: "🏠",
    label: "Accueil",
    shortLabel: "Accueil",
    hint: "Tableau de bord",
  },
  {
    href: ROUTES.drMind,
    emoji: "✨",
    label: "Dr. Mind",
    shortLabel: "Dr. Mind",
    hint: "Parler en confiance",
  },
  {
    href: ROUTES.bancPublic,
    emoji: "💬",
    label: "Banc public",
    shortLabel: "Banc",
    hint: "Anonyme",
  },
  {
    href: ROUTES.guide,
    emoji: "📖",
    label: "Guide",
    shortLabel: "Guide",
    hint: "Conseils utiles",
  },
  {
    href: ROUTES.auth,
    emoji: "👤",
    label: "Profil",
    shortLabel: "Profil",
    hint: "Compte",
  },
] as const;

function LogoMark() {
  return (
    <svg
      className="h-6 w-6 text-[var(--ms-accent-fg)]"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
    >
      <path
        d="M16 4C12 12 8 16 8 22c0 4 3.5 6 8 6s8-2 8-6c0-6-4-10-8-18z"
        fill="currentColor"
        opacity="0.95"
      />
      <path
        d="M16 8c-2 6-5 10-5 14 0 2.5 2 4 5 4s5-1.5 5-4c0-4-3-8-5-14z"
        fill="currentColor"
        opacity="0.45"
      />
    </svg>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen ms-page-bg text-[var(--ms-fg)]">
      <a href="#main-content" className="ms-skip-link">
        Aller au contenu
      </a>
      <div
        className="pointer-events-none fixed inset-x-0 top-0 h-64 bg-gradient-to-b from-[var(--ms-accent-dim)] to-transparent"
        aria-hidden
      />

      <header className="sticky top-0 z-40 border-b border-[var(--ms-border)]/80">
        <div className="ms-glass mx-auto mt-3 max-w-5xl rounded-2xl px-4 py-3.5 sm:mx-4 lg:mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href={ROUTES.home}
              className="group flex items-center gap-3.5 font-display"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--ms-accent-muted)] to-[var(--ms-accent-deep)] text-[var(--ms-accent-fg)] shadow-md shadow-[var(--ms-glow-soft)] ring-1 ring-[var(--ms-border)] transition group-hover:scale-[1.02]">
                <LogoMark />
              </span>
              <span>
                <span className="block text-[1.05rem] font-bold leading-tight tracking-tight text-[var(--ms-fg)]">
                  MindStress
                </span>
                <span className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--ms-muted-fg)]">
                  Santé mentale · CI
                </span>
              </span>
            </Link>
            <AuthActions />
          </div>

          <nav
            className="mt-4 hidden flex-wrap gap-1.5 md:flex"
            aria-label="Navigation principale"
          >
            {links.map((l) => {
              const active = pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  title={l.hint}
                  className={`ms-nav-pill ${active ? "ms-nav-pill-active" : ""}`}
                >
                  <span className="text-[1.05rem] leading-none opacity-90" aria-hidden>
                    {l.emoji}
                  </span>
                  <span>{l.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-0 mx-auto w-full max-w-3xl flex-1 scroll-mt-28 px-5 pb-28 pt-8 outline-none md:max-w-4xl md:pb-12 md:pt-10"
      >
        {children}
      </main>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--ms-border)] bg-[var(--ms-surface)]/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden"
        aria-label="Navigation mobile"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-2 py-3">
          {links.map((l) => {
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                title={l.hint}
                className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl px-1 py-1 text-[10px] font-semibold transition ${
                  active
                    ? "text-[var(--ms-accent)]"
                    : "text-[var(--ms-muted-fg)]"
                }`}
              >
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg transition ${
                    active
                      ? "bg-[var(--ms-accent-dim)] text-[var(--ms-accent)] shadow-inner ring-1 ring-[var(--ms-accent)]/25"
                      : "bg-[var(--ms-elevated)]"
                  }`}
                  aria-hidden
                >
                  {l.emoji}
                </span>
                <span className="max-w-[4.5rem] truncate leading-tight">{l.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <footer className="relative z-0 hidden border-t border-[var(--ms-border)] py-10 text-center md:block">
        <p className="text-sm text-[var(--ms-muted-fg)]">
          MindStress — gestion du stress en Côte d’Ivoire
        </p>
        <p className="mt-1.5 text-xs text-[var(--ms-muted-fg)]/80">
          Douceur · Respect · Confidentialité
        </p>
      </footer>
    </div>
  );
}
