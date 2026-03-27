"use client";

import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS, USER_SINGLE_DOC_ID } from "@/lib/firebase/paths";

const PRIVATE_DOC = USER_SINGLE_DOC_ID;

/**
 * Supprime les données Firestore de l’utilisateur (profil, métriques, progression).
 * À appeler avant `signOut` / `deleteUser` si tu veux effacer la trace côté BD.
 */
export async function deleteUserFirestoreData(
  appId: string,
  userId: string
): Promise<void> {
  const db = getDb();

  const progressCol = collection(
    db,
    "artifacts",
    appId,
    "users",
    userId,
    COLLECTIONS.progressEntries
  );
  const progressSnap = await getDocs(progressCol);
  const deletes: Promise<void>[] = [];
  progressSnap.forEach((d) => {
    deletes.push(deleteDoc(d.ref));
  });

  const privateProfile = doc(
    db,
    "artifacts",
    appId,
    "users",
    userId,
    COLLECTIONS.privateProfile,
    PRIVATE_DOC
  );
  const metrics = doc(
    db,
    "artifacts",
    appId,
    "users",
    userId,
    COLLECTIONS.userMetrics,
    PRIVATE_DOC
  );
  const publicProfile = doc(
    db,
    "artifacts",
    appId,
    "public",
    "data",
    COLLECTIONS.publicProfiles,
    userId
  );

  deletes.push(deleteDoc(privateProfile));
  deletes.push(deleteDoc(metrics));
  deletes.push(deleteDoc(publicProfile));

  await Promise.all(deletes);
}
