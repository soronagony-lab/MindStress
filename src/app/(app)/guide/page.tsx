import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guide de survie",
  description:
    "Fiches tactiques pour les moments difficiles — MindStress, Côte d’Ivoire.",
};

const fiches = [
  {
    emoji: "🧘",
    titre: "Dot (moi)",
    texte:
      "Quand tout monte : pose les épaules, bois un peu d’eau, et rappelle-toi qu’un pas petit vaut mieux qu’un grand projet figé. Ici, on valide les efforts, même minuscules.",
  },
  {
    emoji: "👪",
    titre: "Famille",
    texte:
      "Les liens peuvent apaiser ou peser. Nomme ce que tu ressens sans t’accabler : un « je » calme ouvre souvent mieux qu’un reproche en cascade. Cherche un adulte de confiance si ça déborde.",
  },
  {
    emoji: "💰",
    titre: "Argent",
    texte:
      "L’argent crispe — c’est humain. Liste ce qui est urgent vrai vs ce qui crie fort : parfois respirer cinq minutes avant d’agir change la suite. Les structures d’aide locales peuvent aussi débloquer des situations.",
  },
  {
    emoji: "💼",
    titre: "Boss / travail",
    texte:
      "Le cadre pro teste les nerfs. Clarifie une priorité à la fois, documente ce qui est demandé, et pose une limite propre quand c’est possible. Ton bien-mental compte autant que la performance.",
  },
] as const;

export default function GuidePage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ms-fg)]">
          Guide de survie
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ms-muted-fg)]">
          Fiches courtes quand la pression monte — sans jugement, avec le cœur.
        </p>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2">
        {fiches.map((f) => (
          <li key={f.titre} className="ms-card p-5 transition hover:border-[var(--ms-accent)]/25">
            <h2 className="flex items-center gap-2.5 text-base font-semibold text-[var(--ms-fg)]">
              <span className="text-2xl" aria-hidden>
                {f.emoji}
              </span>
              {f.titre}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[var(--ms-muted-fg)]">{f.texte}</p>
            <p className="mt-4 border-t border-[var(--ms-border)] pt-3 text-[0.7rem] text-[var(--ms-muted-fg)]">
              Tu fais de ton mieux — ça suffit.
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
