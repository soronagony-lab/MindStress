"use client";

import { doc, setDoc } from "firebase/firestore";
import type { PrivateProfile, PublicProfile } from "@/types/mindstress";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS, USER_SINGLE_DOC_ID } from "@/lib/firebase/paths";

export async function saveUserProfiles(
  appId: string,
  userId: string,
  privateData: Omit<PrivateProfile, "createdAt" | "updatedAt">,
  publicData: Pick<PublicProfile, "pseudonym">
): Promise<void> {
  const db = getDb();
  const now = Date.now();

  const privateRef = doc(
    db,
    "artifacts",
    appId,
    "users",
    userId,
    COLLECTIONS.privateProfile,
    USER_SINGLE_DOC_ID
  );

  const publicRef = doc(
    db,
    "artifacts",
    appId,
    "public",
    "data",
    COLLECTIONS.publicProfiles,
    userId
  );

  await setDoc(
    privateRef,
    {
      ...privateData,
      createdAt: now,
      updatedAt: now,
    },
    { merge: true }
  );

  await setDoc(
    publicRef,
    {
      pseudonym: publicData.pseudonym,
      updatedAt: now,
    },
    { merge: true }
  );
}
