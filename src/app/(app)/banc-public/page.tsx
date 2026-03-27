"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/lib/routes";
import { doc, getDoc } from "firebase/firestore";
import { useFirebaseAuth } from "@/providers/firebase-provider";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/paths";
import {
  fetchBancMessages,
  sendBancMessage,
} from "@/lib/firestore/banc-public";
import type { BancPublicMessage } from "@/types/mindstress";

export default function BancPublicPage() {
  const { user, appId, ready } = useFirebaseAuth();
  const [items, setItems] = useState<BancPublicMessage[]>([]);
  const [text, setText] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!appId) return;
    setLoading(true);
    setErr(null);
    try {
      const list = await fetchBancMessages(appId);
      setItems(list);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Chargement impossible");
    } finally {
      setLoading(false);
    }
  }, [appId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    async function loadPseudo() {
      if (!user || !appId) return;
      try {
        const db = getDb();
        const ref = doc(
          db,
          "artifacts",
          appId,
          "public",
          "data",
          COLLECTIONS.publicProfiles,
          user.uid
        );
        const snap = await getDoc(ref);
        const p = snap.data()?.pseudonym;
        if (typeof p === "string" && p.trim()) setPseudonym(p.trim());
      } catch {
        /* silencieux */
      }
    }
    if (ready && user && appId) loadPseudo();
  }, [ready, user, appId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !appId || !text.trim()) return;
    const pseudo = pseudonym.trim();
    if (pseudo.length < 2) {
      setErr("✍️ Définis d’abord un pseudonyme dans Profil (au moins 2 caractères).");
      return;
    }
    setSending(true);
    setErr(null);
    try {
      await sendBancMessage(appId, {
        authorUid: user.uid,
        pseudonym: pseudo,
        text: text.trim(),
      });
      setText("");
      await load();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Envoi impossible");
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">
          💬 Banc public
        </h1>
        <p className="mt-2 text-sm text-[var(--ms-muted-fg)]">
          🤝 Échange anonyme : seul ton <strong>pseudonyme</strong> apparaît — jamais ton nom, ton
          numéro ou ton mail. Tu restes protégé(e).
        </p>
        <p className="mt-2 text-xs text-[var(--ms-muted-fg)]">
          👉 Pas encore de pseudo ?{" "}
          <Link href={ROUTES.auth} className="font-semibold text-[var(--ms-accent)] underline">
            Complète ton profil ici
          </Link>{" "}
          en un clic.
        </p>
      </div>

      <div className="rounded-2xl border border-[var(--ms-border)] bg-[var(--ms-surface)] p-4">
        {loading && (
          <p className="text-sm text-[var(--ms-muted-fg)]">⏳ Chargement des messages…</p>
        )}
        {err && (
          <p className="mb-3 text-sm text-red-600 dark:text-red-300">⚠️ {err}</p>
        )}
        <ul className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
          {items.length === 0 && !loading && (
            <li className="rounded-xl border border-dashed border-[var(--ms-border)] px-3 py-6 text-center text-sm text-[var(--ms-muted-fg)]">
              🌱 Sois le premier à laisser un mot d’encouragement — ça compte beaucoup.
            </li>
          )}
          {items.map((m) => (
            <li
              key={m.id}
              className="rounded-xl border border-[var(--ms-border)] bg-[var(--ms-bg)] px-3 py-2 text-sm"
            >
              <p className="text-xs font-semibold text-[var(--ms-accent)]">
                🎭 {m.pseudonym}
              </p>
              <p className="mt-1 whitespace-pre-wrap">{m.text}</p>
            </li>
          ))}
        </ul>

        <form
          onSubmit={onSubmit}
          className="mt-4 flex flex-col gap-2 border-t border-[var(--ms-border)] pt-4"
        >
          <label className="text-xs text-[var(--ms-muted-fg)]">
            🎭 Pseudonyme visible (modifiable dans Profil)
            <input
              className="mt-1 w-full rounded-lg border border-[var(--ms-border)] bg-[var(--ms-bg)] px-3 py-2 text-sm"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <textarea
              className="min-h-[72px] flex-1 rounded-xl border border-[var(--ms-border)] bg-[var(--ms-bg)] px-3 py-2 text-sm"
              placeholder="💚 Un mot d’encouragement ou ton ressenti…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <button
              type="submit"
              disabled={sending || !ready}
              className="self-end rounded-xl bg-[var(--ms-accent)] px-4 py-2 text-sm font-semibold text-[var(--ms-accent-fg)] disabled:opacity-50"
            >
              {sending ? "⏳" : "📤 Publier"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
