import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function NotFound() {
  return (
    <div className="relative min-h-screen ms-page-bg px-6 py-24 text-[var(--ms-fg)]">
      <a href="#main-content" className="ms-skip-link">
        Aller au contenu
      </a>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-lg scroll-mt-24 text-center outline-none"
      >
        <p className="font-display text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-[var(--ms-muted-fg)]">
          404
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">
          Page introuvable
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-[var(--ms-muted-fg)]">
          Ce chemin n’existe pas ou a été déplacé. Respire un instant, puis reviens à l’accueil.
        </p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={ROUTES.landing}
            className="ms-btn-secondary min-h-[44px] min-w-[200px] px-6 py-2.5 text-center"
          >
            Accueil
          </Link>
          <Link
            href={ROUTES.home}
            className="ms-btn-primary min-h-[44px] min-w-[200px] px-6 py-2.5 text-center"
          >
            Tableau de bord
          </Link>
        </div>
      </main>
    </div>
  );
}
