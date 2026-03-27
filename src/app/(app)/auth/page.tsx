"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useFirebaseAuth } from "@/providers/firebase-provider";
import { saveUserProfiles } from "@/lib/firestore/profiles";

export default function AuthPage() {
  const { user, loading, appId, ready, retryInit } = useFirebaseAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!user || !appId) {
      setFormError("⚠️ Connexion ou identifiant manquant — réessaie depuis l’accueil.");
      return;
    }
    if (!pseudonym.trim() || pseudonym.length < 2) {
      setFormError("✍️ Choisis un pseudonyme d’au moins 2 caractères (affiché sur le Banc public uniquement).");
      return;
    }
    setSaving(true);
    try {
      await saveUserProfiles(
        appId,
        user.uid,
        {
          fullName: fullName.trim(),
          phone: phone.trim(),
          email: email.trim(),
        },
        { pseudonym: pseudonym.trim() }
      );
      setSaved(true);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "❌ Enregistrement impossible pour l’instant.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-lg space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold">
          🔐 Ton espace confidentiel
        </h1>
        <p className="mt-2 text-sm text-[var(--ms-muted-fg)]">
          🛡️ Nom, téléphone et e-mail : <strong>privés</strong>. Le pseudonyme sert sur le Banc public —{" "}
          <strong>jamais</strong> ton identité réelle là-bas. Tu peux avancer tranquille.
        </p>
        <p className="mt-3 rounded-xl border border-[var(--ms-calm)]/25 bg-[var(--ms-calm-dim)] px-3 py-2 text-xs text-[var(--ms-fg)]">
          💡 Astuce : après l’inscription, va au <Link href={ROUTES.bancPublic} className="font-semibold text-[var(--ms-accent)] underline">💬 Banc public</Link> en un clic.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-[var(--ms-muted-fg)]">⏳ Connexion en cours…</p>
      )}
      {!loading && !ready && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => retryInit()}
            className="rounded-full bg-[var(--ms-accent)] px-5 py-2 text-sm font-medium text-[#fffef9]"
          >
            🔄 Réessayer
          </button>
        </div>
      )}

      {ready && user && (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">
              👤 Nom complet <span className="text-[var(--ms-muted-fg)]">(privé)</span>
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-[var(--ms-border)] bg-[var(--ms-surface)] px-3 py-2 text-sm"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              📱 Téléphone <span className="text-[var(--ms-muted-fg)]">(privé)</span>
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-[var(--ms-border)] bg-[var(--ms-surface)] px-3 py-2 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              ✉️ E-mail <span className="text-[var(--ms-muted-fg)]">(privé)</span>
            </label>
            <input
              type="email"
              className="mt-1 w-full rounded-lg border border-[var(--ms-border)] bg-[var(--ms-surface)] px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">
              🎭 Pseudonyme <span className="text-[var(--ms-muted-fg)]">(visible sur le Banc public)</span>
            </label>
            <input
              className="mt-1 w-full rounded-lg border border-[var(--ms-border)] bg-[var(--ms-surface)] px-3 py-2 text-sm"
              value={pseudonym}
              onChange={(e) => setPseudonym(e.target.value)}
              placeholder="ex. Anonyme_Abidjan"
              minLength={2}
            />
          </div>

          {formError && (
            <p className="text-sm text-red-600 dark:text-red-300">{formError}</p>
          )}
          {saved && (
            <p className="text-sm font-medium text-[var(--ms-accent)]">
              ✅ C’est bien enregistré. Merci de ta confiance — on continue ensemble.
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="rounded-full bg-[var(--ms-accent)] px-6 py-2.5 text-sm font-medium text-[#fffef9] disabled:opacity-60"
          >
            {saving ? "⏳ Enregistrement…" : "💾 Enregistrer mon profil"}
          </button>
        </form>
      )}
    </div>
  );
}
