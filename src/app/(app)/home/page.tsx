"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ROUTES } from "@/lib/routes";
import { fetchUserMetrics } from "@/lib/firestore/user-metrics";
import {
  defaultSomatic,
  fetchTodayProgress,
  saveTodayProgress,
} from "@/lib/firestore/user-progress";
import { useFirebaseAuth } from "@/providers/firebase-provider";
import type { SomaticZone } from "@/types/mindstress";

const zones: { id: SomaticZone; label: string; emoji: string; hint: string }[] = [
  { id: "tete", label: "Tête", emoji: "🧠", hint: "tensions, migraines, pensées qui tournent" },
  { id: "coeur", label: "Cœur", emoji: "❤️", hint: "palpitations, angoisse, tristesse" },
  { id: "ventre", label: "Ventre", emoji: "🍽️", hint: "nœuds, appétit, estomac serré" },
  { id: "dos", label: "Dos", emoji: "🧘", hint: "raideur, fatigue portée dans le dos" },
];

const shortcuts = [
  {
    href: ROUTES.drMind,
    emoji: "✨",
    title: "Parler à Dr. Mind",
    sub: "Un échange calme, tout de suite",
  },
  {
    href: ROUTES.bancPublic,
    emoji: "💬",
    title: "Banc public",
    sub: "Anonyme & en confiance",
  },
  {
    href: ROUTES.guide,
    emoji: "📖",
    title: "Guide de survie",
    sub: "Astuces quand ça serre",
  },
  {
    href: ROUTES.auth,
    emoji: "👤",
    title: "Mon profil",
    sub: "Complète ton inscription",
  },
] as const;

const SAVE_MS = 900;

export default function HomePage() {
  const { user, appId, ready } = useFirebaseAuth();
  const [gnan, setGnan] = useState(42);
  const [intensity, setIntensity] = useState<Record<SomaticZone, 0 | 1 | 2 | 3>>({
    tete: 1,
    coeur: 0,
    ventre: 1,
    dos: 0,
  });
  const progressReady = useRef(false);
  const [metricsHint, setMetricsHint] = useState<string | null>(null);

  useEffect(() => {
    progressReady.current = false;
    if (!ready || !user || !appId) return;
    let cancelled = false;
    void (async () => {
      try {
        const [today, m] = await Promise.all([
          fetchTodayProgress(appId, user.uid),
          fetchUserMetrics(appId, user.uid),
        ]);
        if (cancelled) return;
        if (today) {
          setGnan(today.gnan);
          setIntensity({ ...defaultSomatic(), ...today.somatic });
        }
        if (m) {
          setMetricsHint(
            `Série : ${m.activeStreakDays} j · Connexions : ${m.loginCount} · Ouvertures : ${m.sessionOpens}`
          );
        } else {
          setMetricsHint(null);
        }
      } finally {
        if (!cancelled) progressReady.current = true;
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, appId]);

  const persist = useCallback(() => {
    if (!ready || !user || !appId || !progressReady.current) return;
    void saveTodayProgress(appId, user.uid, { gnan, somatic: intensity }).catch(
      () => {}
    );
  }, [ready, user, appId, gnan, intensity]);

  useEffect(() => {
    if (!ready || !user || !appId) return;
    const t = setTimeout(persist, SAVE_MS);
    return () => clearTimeout(t);
  }, [ready, user, appId, gnan, intensity, persist]);

  const somaticSummary = useMemo(() => {
    return zones.map((z) => ({
      zone: z.label,
      niveau: intensity[z.id],
    }));
  }, [intensity]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-[var(--ms-fg)]">
          👋 Bonjour, prends un instant pour toi
        </h1>
        <p className="mt-2 text-sm text-[var(--ms-muted-fg)]">
          🌲 Comme un bol d’air vert : pas de jugement, à ton rythme. Chaque petit pas compte pour
          alléger le stress et retrouver un peu de légèreté.
        </p>
        {user && appId && metricsHint && (
          <p className="mt-3 text-xs text-[var(--ms-muted-fg)]/80">{metricsHint}</p>
        )}
      </div>

      <section className="ms-card p-5 md:p-6">
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ms-muted-fg)]">
          Par où commencer
        </h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {shortcuts.map((s) => (
            <li key={s.href}>
              <Link
                href={s.href}
                className="flex items-center gap-3 rounded-xl border border-[var(--ms-border)] bg-[var(--ms-elevated)] p-4 transition hover:border-[var(--ms-accent)]/40 hover:shadow-md"
              >
                <span className="text-2xl" aria-hidden>
                  {s.emoji}
                </span>
                <span>
                  <span className="block font-semibold text-[var(--ms-fg)]">{s.title}</span>
                  <span className="text-xs text-[var(--ms-muted-fg)]">{s.sub}</span>
                </span>
                <span className="ml-auto text-[var(--ms-accent)]" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="ms-card p-6">
        <h2 className="text-lg font-semibold text-[var(--ms-fg)]">
          Score Gnan
        </h2>
        <p className="mt-1 text-sm text-[var(--ms-muted-fg)]">
          🎯 Un repère simple pour ta journée — ajuste comme tu le sens, sans te mettre la pression.
          {user && appId ? " Enregistré automatiquement pour aujourd’hui." : ""}
        </p>
        <div className="mt-4 flex flex-wrap items-end gap-4">
          <div className="text-5xl font-bold tabular-nums">{gnan}</div>
          <label className="flex min-w-[200px] flex-1 flex-col gap-2 text-sm">
            <span className="text-[var(--ms-muted-fg)]">👆 Glisse pour mettre à jour</span>
            <input
              type="range"
              min={0}
              max={100}
              value={gnan}
              onChange={(e) => setGnan(Number(e.target.value))}
              className="w-full accent-[var(--ms-accent)]"
            />
          </label>
        </div>
      </section>

      <section className="ms-card p-6">
        <h2 className="text-lg font-semibold text-[var(--ms-fg)]">
          Ressenti du moment
        </h2>
        <p className="mt-1 text-sm text-[var(--ms-muted-fg)]">
          Pour chaque zone : 0 = 😌 tranquille · 3 = 😣 très présent. Ton corps a le droit de parler.
        </p>
        <ul className="mt-6 space-y-5">
          {zones.map((z) => (
            <li key={z.id} className="rounded-xl bg-[var(--ms-muted)]/40 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="font-medium">
                    <span className="mr-2" aria-hidden>
                      {z.emoji}
                    </span>
                    {z.label}
                  </p>
                  <p className="text-xs text-[var(--ms-muted-fg)]">{z.hint}</p>
                </div>
                <div className="flex gap-1">
                  {([0, 1, 2, 3] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() =>
                        setIntensity((prev) => ({ ...prev, [z.id]: n }))
                      }
                      className={`h-9 min-w-[2.25rem] rounded-lg text-sm font-medium transition-colors ${
                        intensity[z.id] === n
                          ? "bg-[var(--ms-accent)] text-[var(--ms-accent-fg)]"
                          : "border border-[var(--ms-border)] bg-[var(--ms-surface)] hover:border-[var(--ms-accent)]"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-[var(--ms-muted-fg)]">
          📝 Résumé :{" "}
          {somaticSummary.map((s) => `${s.zone}=${s.niveau}`).join(", ")}
        </p>
      </section>
    </div>
  );
}
