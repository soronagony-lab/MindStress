"use client";

import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import {
  getInforgeFirebaseConfig,
  isFirebaseEmulatorEnabled,
} from "./inforge";

let app: FirebaseApp | null = null;
let emulatorsConnected = false;

function connectEmulatorsIfNeeded(firebaseApp: FirebaseApp) {
  if (emulatorsConnected) return;
  if (!isFirebaseEmulatorEnabled()) return;

  const host = process.env.NEXT_PUBLIC_FIREBASE_EMULATOR_HOST ?? "127.0.0.1";
  const firestorePort = Number(
    process.env.NEXT_PUBLIC_FIRESTORE_EMULATOR_PORT ?? 8080
  );
  const authPort = Number(process.env.NEXT_PUBLIC_AUTH_EMULATOR_PORT ?? 9099);

  const auth = getAuth(firebaseApp);
  connectAuthEmulator(auth, `http://${host}:${authPort}`, {
    disableWarnings: true,
  });

  const db = getFirestore(firebaseApp);
  connectFirestoreEmulator(db, host, firestorePort);

  emulatorsConnected = true;
}

export function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) {
    app = getApps()[0]!;
    connectEmulatorsIfNeeded(app);
    return app;
  }

  const config = getInforgeFirebaseConfig();
  if (!config) {
    throw new Error(
      "MindStress : config Firebase introuvable. En local avec BD locale : mets NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true dans .env.local et lance npm run emulators (voir LOCAL.md)."
    );
  }

  app = initializeApp(config);
  connectEmulatorsIfNeeded(app);
  return app;
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getDb() {
  return getFirestore(getFirebaseApp());
}
