"use client";

import { doc, setDoc } from "firebase/firestore";
import type { PrivateProfile, PublicProfile } from "@/types/mindstress";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/paths";

const PRIVATE_DOC = "main";

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
    PRIVATE_DOC
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
