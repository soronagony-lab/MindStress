import Link from "next/link";
import { AuthActions } from "@/components/auth/auth-actions";
import { ROUTES } from "@/lib/routes";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen ms-page-bg text-[var(--ms-fg)]">
      <a href="#main-content" className="ms-skip-link">
        Aller au contenu
      </a>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[55vh] bg-gradient-to-b from-[var(--ms-accent)]/[0.07] via-transparent to-transparent"
        aria-hidden
      />
      <div className="pointer-events-none absolute right-0 top-32 h-72 w-72 rounded-full bg-[var(--ms-calm)]/[0.06] blur-3xl md:right-[15%]" />
      <div className="pointer-events-none absolute bottom-24 left-0 h-56 w-56 rounded-full bg-[var(--ms-accent-deep)]/20 blur-3xl" />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative z-10 mx-auto flex min-h-screen max-w-lg scroll-mt-24 flex-col justify-center gap-12 px-6 py-16 outline-none sm:max-w-xl md:py-24"
      >
        <div className="space-y-6 text-center">
          <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--ms-muted-fg)]">
            Côte d’Ivoire
          </p>
          <h1 className="font-display text-[2.35rem] font-bold leading-[1.12] tracking-tight text-[var(--ms-fg)] sm:text-5xl md:text-[3.15rem]">
            Mind
            <span className="bg-gradient-to-r from-[var(--ms-accent)] via-[var(--ms-calm)] to-[var(--ms-accent-muted)] bg-clip-text text-transparent">
              Stress
            </span>
          </h1>
          <p className="mx-auto max-w-md text-[0.95rem] leading-[1.65] text-[var(--ms-muted-fg)] sm:text-base">
            Un espace calme pour parler du stress sans tabou — pensé pour toi, avec bienveillance et
            des outils concrets.
          </p>
        </div>

        <div className="ms-card mx-auto w-full max-w-md p-6 sm:p-8">
          <p className="text-center text-sm leading-relaxed text-[var(--ms-muted-fg)]">
            Ici, tu peux respirer : chaque pas compte vers un peu plus de légèreté.
          </p>
          <div className="mt-8 flex w-full flex-col items-stretch gap-4">
            <AuthActions variant="landing" />
            <Link
              href={ROUTES.home}
              className="group relative flex min-h-[50px] w-full items-center justify-center overflow-hidden rounded-xl font-display text-[0.95rem] font-semibold text-[var(--ms-accent-fg)] transition"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[var(--ms-accent-muted)] via-[var(--ms-accent-deep)] to-[var(--ms-accent-muted)] transition duration-300 group-hover:opacity-95" />
              <span className="relative flex items-center gap-2 px-6">
                Découvrir l’app
                <svg
                  className="h-4 w-4 opacity-90 transition group-hover:translate-x-0.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M5 12h14m-6-6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </Link>
          </div>
          <p className="mt-6 text-center text-[0.7rem] leading-relaxed text-[var(--ms-muted-fg)]">
            Gratuit pour commencer · Données protégées
          </p>
        </div>
      </main>
    </div>
  );
}
