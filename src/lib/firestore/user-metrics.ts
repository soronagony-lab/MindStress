"use client";

import {
  doc,
  getDoc,
  increment,
  setDoc,
  updateDoc,
  type Firestore,
} from "firebase/firestore";
import type { UserMetrics } from "@/types/mindstress";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS, USER_SINGLE_DOC_ID } from "@/lib/firebase/paths";
import { localDayId, previousLocalDayId } from "@/lib/day";

function metricsDocRef(db: Firestore, appId: string, userId: string) {
  return doc(
    db,
    "artifacts",
    appId,
    "users",
    userId,
    COLLECTIONS.userMetrics,
    USER_SINGLE_DOC_ID
  );
}

function defaultMetrics(now: number, today: string): UserMetrics {
  return {
    firstSeenAt: now,
    updatedAt: now,
    lastLoginAt: now,
    lastLogoutAt: null,
    loginCount: 0,
    logoutCount: 0,
    sessionOpens: 0,
    lastActiveDay: today,
    activeStreakDays: 1,
    profileCompletedAt: null,
  };
}

/** Première connexion au document métriques (si absent). */
async function ensureMetricsDoc(
  db: Firestore,
  appId: string,
  userId: string
): Promise<void> {
  const ref = metricsDocRef(db, appId, userId);
  const snap = await getDoc(ref);
  if (snap.exists()) return;
  const now = Date.now();
  const today = localDayId();
  await setDoc(ref, defaultMetrics(now, today));
}

/** Après un clic « Connexion » réussi. */
export async function recordAuthLogin(
  appId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  await ensureMetricsDoc(db, appId, userId);
  const now = Date.now();
  await updateDoc(metricsDocRef(db, appId, userId), {
    loginCount: increment(1),
    lastLoginAt: now,
    updatedAt: now,
  });
}

/** Avant `signOut` : déconnexion explicite. */
export async function recordAuthLogout(
  appId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  const ref = metricsDocRef(db, appId, userId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return;
  const now = Date.now();
  await updateDoc(ref, {
    logoutCount: increment(1),
    lastLogoutAt: now,
    updatedAt: now,
  });
}

/** Une fois par session navigateur : ouverture + série active (jour civil local). */
export async function recordSessionOpen(
  appId: string,
  userId: string
): Promise<void> {
  const sessionKey = `ms_metrics_sess_${userId}`;
  if (typeof sessionStorage !== "undefined") {
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
  }

  const db = getDb();
  await ensureMetricsDoc(db, appId, userId);
  const ref = metricsDocRef(db, appId, userId);
  const now = Date.now();
  const today = localDayId();

  const snap = await getDoc(ref);
  const data = snap.data() as UserMetrics | undefined;
  if (!data) return;

  const lastDay = data.lastActiveDay ?? "";
  let streak = data.activeStreakDays ?? 0;

  if (lastDay === today) {
    await updateDoc(ref, {
      sessionOpens: increment(1),
      lastLoginAt: now,
      updatedAt: now,
    });
    return;
  }

  const prev = previousLocalDayId(today);
  if (lastDay && prev && lastDay === prev) {
    streak = Math.max(1, streak + 1);
  } else if (lastDay !== today) {
    streak = 1;
  }

  await updateDoc(ref, {
    sessionOpens: increment(1),
    lastLoginAt: now,
    lastActiveDay: today,
    activeStreakDays: streak,
    updatedAt: now,
  });
}

/** Après enregistrement du formulaire profil (inscription) — ne fixe la date qu’une fois. */
export async function markProfileCompleted(
  appId: string,
  userId: string
): Promise<void> {
  const db = getDb();
  await ensureMetricsDoc(db, appId, userId);
  const ref = metricsDocRef(db, appId, userId);
  const snap = await getDoc(ref);
  const existing = snap.data() as UserMetrics | undefined;
  if (existing?.profileCompletedAt) return;
  const now = Date.now();
  await updateDoc(ref, {
    profileCompletedAt: now,
    updatedAt: now,
  });
}

export async function fetchUserMetrics(
  appId: string,
  userId: string
): Promise<UserMetrics | null> {
  const db = getDb();
  const snap = await getDoc(metricsDocRef(db, appId, userId));
  if (!snap.exists()) return null;
  return snap.data() as UserMetrics;
}
