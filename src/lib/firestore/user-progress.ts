"use client";

import { doc, getDoc, setDoc, type Firestore } from "firebase/firestore";
import type { ProgressDayEntry, SomaticZone } from "@/types/mindstress";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/paths";
import { localDayId } from "@/lib/day";

const ZONES: SomaticZone[] = ["tete", "coeur", "ventre", "dos"];

export function defaultSomatic(): Record<SomaticZone, 0 | 1 | 2 | 3> {
  return { tete: 0, coeur: 0, ventre: 0, dos: 0 };
}

function progressDocRef(
  db: Firestore,
  appId: string,
  userId: string,
  dayId: string
) {
  return doc(
    db,
    "artifacts",
    appId,
    "users",
    userId,
    COLLECTIONS.progressEntries,
    dayId
  );
}

/** Lit le snapshot du jour courant (local), sinon null. */
export async function fetchTodayProgress(
  appId: string,
  userId: string
): Promise<ProgressDayEntry | null> {
  const dayId = localDayId();
  const db = getDb();
  const snap = await getDoc(progressDocRef(db, appId, userId, dayId));
  if (!snap.exists()) return null;
  return snap.data() as ProgressDayEntry;
}

/** Enregistre ou fusionne le score Gnan + ressenti pour aujourd’hui. */
export async function saveTodayProgress(
  appId: string,
  userId: string,
  payload: {
    gnan: number;
    somatic: Record<SomaticZone, 0 | 1 | 2 | 3>;
  }
): Promise<void> {
  const db = getDb();
  const dayId = localDayId();
  const now = Date.now();
  const ref = progressDocRef(db, appId, userId, dayId);
  const snap = await getDoc(ref);
  const somatic = { ...defaultSomatic(), ...payload.somatic };
  for (const z of ZONES) {
    const v = somatic[z];
    if (v !== 0 && v !== 1 && v !== 2 && v !== 3) somatic[z] = 0;
  }

  const entry: ProgressDayEntry = {
    dayId,
    gnan: Math.min(100, Math.max(0, Math.round(payload.gnan))),
    somatic: somatic as Record<SomaticZone, 0 | 1 | 2 | 3>,
    updatedAt: now,
  };

  if (!snap.exists()) {
    await setDoc(ref, entry);
    return;
  }
  await setDoc(ref, entry, { merge: true });
}
