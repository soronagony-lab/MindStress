"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { useFirebaseAuth } from "@/providers/firebase-provider";
import {
  fetchUserProfiles,
  saveUserProfiles,
} from "@/lib/firestore/profiles";
import { deleteUserFirestoreData } from "@/lib/firestore/user-lifecycle";
import { markProfileCompleted } from "@/lib/firestore/user-metrics";

export default function AuthPage() {
  const { user, loading, appId, ready, retryInit, signOut } = useFirebaseAuth();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pseudonym, setPseudonym] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [purgeBusy, setPurgeBusy] = useState(false);
  const [hydrating, setHydrating] = useState(true);
  const [alreadyRegistered, setAlreadyRegistered] = useState(false);

  useEffect(() => {
    if (!ready || !user || !appId) {
      setHydrating(!ready);
      return;
    }
    let cancelled = false;
    setHydrating(true);
    void (async () => {
      try {
        const { private: priv, public: pub } = await fetchUserProfiles(
          appId,
          user.uid
        );
        if (cancelled) return;
        if (priv) {
          setFullName(priv.fullName ?? "");
          setPhone(priv.phone ?? "");
          setEmail(priv.email ?? "");
        }
        if (pub?.pseudonym?.trim()) {
          setPseudonym(pub.pseudonym);
          setAlreadyRegistered(true);
        }
        setSaved(false);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setHydrating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, appId]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!user || !appId) {
      setFormError(
        "Connexion ou identifiant manquant — réessaie depuis l’accueil."
      );
      return;
    }
    if (!pseudonym.trim() || pseudonym.length < 2) {
      setFormError(
        "Choisis un pseudonyme d’au moins 2 caractères (affiché sur le Banc public uniquement)."
      );
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
      await markProfileCompleted(appId, user.uid);
      setSaved(true);
      setAlreadyRegistered(true);
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Enregistrement impossible pour l’instant."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[var(--ms-accent-dim)] px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wider text-[var(--ms-accent)]">
            {alreadyRegistered ? "Profil" : "Première inscription"}
          </span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-[var(--ms-fg)]">
          {alreadyRegistered && !saved
            ? "Ton profil MindStress"
            : "Bienvenue — crée ton profil"}
        </h1>
        <p className="text-sm leading-relaxed text-[var(--ms-muted-fg)]">
          Tu es connecté avec un compte anonyme sécurisé. Complète ce formulaire
          pour <strong className="text-[var(--ms-fg)]">finaliser ton inscription</strong> :{" "}
          tes coordonnées restent <strong>privées</strong> ; seul un{" "}
          <strong>pseudonyme</strong> apparaît sur le Banc public.
        </p>

        <ol className="ms-card flex flex-wrap gap-4 p-4 text-xs text-[var(--ms-muted-fg)]">
          <li className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--ms-accent)] text-[0.7rem] font-bold text-[var(--ms-accent-fg)]">
              1
            </span>
            <span>Connexion (déjà faite)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[var(--ms-border)] bg-[var(--ms-elevated)] text-[0.7rem] font-bold text-[var(--ms-fg)]">
              2
            </span>
            <span>Infos + pseudonyme ci-dessous</span>
          </li>
        </ol>
      </header>

      {loading && (
        <p className="text-sm text-[var(--ms-muted-fg)]">Connexion en cours…</p>
      )}
      {!loading && !ready && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => retryInit()}
            className="rounded-full bg-[var(--ms-accent)] px-5 py-2 text-sm font-medium text-[var(--ms-accent-fg)]"
          >
            Réessayer
          </button>
        </div>
      )}

      {ready && user && (
        <>
          {hydrating && (
            <p className="text-sm text-[var(--ms-muted-fg)]">
              Chargement de ton profil…
            </p>
          )}

          {!hydrating && saved && (
            <div className="ms-card space-y-4 border-[var(--ms-accent)]/30 bg-[var(--ms-accent-dim)] px-5 py-6">
              <p className="font-display text-lg font-semibold text-[var(--ms-fg)]">
                Inscription enregistrée
              </p>
              <p className="text-sm text-[var(--ms-muted-fg)]">
                Tu peux explorer l’app : accueil, Dr. Mind, Banc public avec ton
                pseudonyme.
              </p>
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Link
                  href={ROUTES.home}
                  className="ms-btn-primary min-h-[44px] flex-1 px-5 py-2.5 text-center text-sm"
                >
                  Aller à l’accueil
                </Link>
                <Link
                  href={ROUTES.bancPublic}
                  className="ms-btn-secondary min-h-[44px] flex-1 px-5 py-2.5 text-center text-sm"
                >
                  Banc public
                </Link>
              </div>
            </div>
          )}

          {!hydrating && (
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">
                  Nom complet <span className="text-[var(--ms-muted-fg)]">(privé)</span>
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
                  Téléphone <span className="text-[var(--ms-muted-fg)]">(privé)</span>
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
                  E-mail <span className="text-[var(--ms-muted-fg)]">(privé)</span>
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
                  Pseudonyme{" "}
                  <span className="text-[var(--ms-muted-fg)]">(visible sur le Banc public)</span>
                </label>
                <input
                  className="mt-1 w-full rounded-lg border border-[var(--ms-border)] bg-[var(--ms-surface)] px-3 py-2 text-sm"
                  value={pseudonym}
                  onChange={(e) => setPseudonym(e.target.value)}
                  placeholder="ex. Anonyme_Abidjan"
                  minLength={2}
                  required
                />
              </div>

              {formError && (
                <p className="text-sm text-red-600 dark:text-red-300" role="alert">
                  {formError}
                </p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-full bg-[var(--ms-accent)] px-6 py-3 text-sm font-semibold text-[var(--ms-accent-fg)] disabled:opacity-60 sm:w-auto"
              >
                {saving
                  ? "Enregistrement…"
                  : alreadyRegistered
                    ? "Mettre à jour mon profil"
                    : "Valider mon inscription"}
              </button>
            </form>
          )}
        </>
      )}

      {ready && user && !hydrating && (
        <div className="rounded-2xl border border-red-500/25 bg-red-500/5 p-5">
          <h2 className="text-sm font-semibold text-[var(--ms-fg)]">
            Données & compte
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-[var(--ms-muted-fg)]">
            Supprime tes données Firestore sur ce compte et déconnecte-toi. Un
            nouveau compte anonyme sera créé à la prochaine connexion.
          </p>
          <button
            type="button"
            disabled={purgeBusy}
            onClick={() => {
              if (!appId || !user) return;
              if (
                !window.confirm(
                  "Effacer toutes tes données MindStress sur ce compte et te déconnecter ?"
                )
              ) {
                return;
              }
              setPurgeBusy(true);
              void (async () => {
                try {
                  await deleteUserFirestoreData(appId, user.uid);
                  await signOut();
                } catch (e) {
                  setFormError(
                    e instanceof Error ? e.message : "Suppression impossible pour l’instant."
                  );
                } finally {
                  setPurgeBusy(false);
                }
              })();
            }}
            className="mt-4 rounded-full border border-red-500/40 bg-transparent px-4 py-2 text-xs font-medium text-red-700 dark:text-red-300 disabled:opacity-60"
          >
            {purgeBusy ? "…" : "Effacer mes données et me déconnecter"}
          </button>
        </div>
      )}
    </div>
  );
}
