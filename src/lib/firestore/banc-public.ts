"use client";

import { addDoc, collection, getDocs } from "firebase/firestore";
import type { BancPublicMessage } from "@/types/mindstress";
import { getDb } from "@/lib/firebase/client";
import { COLLECTIONS } from "@/lib/firebase/paths";

const THREAD_GLOBAL = "place-publique";

export async function fetchBancMessages(appId: string): Promise<BancPublicMessage[]> {
  const db = getDb();
  const ref = collection(
    db,
    "artifacts",
    appId,
    "public",
    "data",
    COLLECTIONS.bancMessages
  );
  const snap = await getDocs(ref);
  const out: BancPublicMessage[] = [];
  snap.forEach((d) => {
    const data = d.data() as Partial<BancPublicMessage>;
    out.push({
      id: d.id,
      threadId: data.threadId ?? THREAD_GLOBAL,
      authorUid: data.authorUid ?? "",
      pseudonym: data.pseudonym ?? "Anonyme",
      text: data.text ?? "",
      createdAt: typeof data.createdAt === "number" ? data.createdAt : 0,
    });
  });
  out.sort((a, b) => a.createdAt - b.createdAt);
  return out;
}

export async function sendBancMessage(
  appId: string,
  payload: Pick<BancPublicMessage, "authorUid" | "pseudonym" | "text">
): Promise<void> {
  const db = getDb();
  const ref = collection(
    db,
    "artifacts",
    appId,
    "public",
    "data",
    COLLECTIONS.bancMessages
  );
  await addDoc(ref, {
    threadId: THREAD_GLOBAL,
    authorUid: payload.authorUid,
    pseudonym: payload.pseudonym,
    text: payload.text,
    createdAt: Date.now(),
  });
}
