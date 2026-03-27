"use client";

/**
 * Émulateur Firebase : BD Firestore + Auth **100 % locales** (voir `npm run emulators`).
 */
export function isFirebaseEmulatorEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true";
}

/** Config factice pour l’émulateur si aucune autre config n’est fournie. */
function getDemoEmulatorConfig(): Record<string, unknown> {
  return {
    apiKey: "demo-key-not-used-with-emulator",
    authDomain: "demo-mindstress.firebaseapp.com",
    projectId: "demo-mindstress",
    storageBucket: "demo-mindstress.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:000000000000000000000",
  };
}

/**
 * Ordre de lecture (aligné local / Vercel / Inforge.dev) :
 * 1. Globales Inforge injectées sur `window` en production hébergée Inforge
 * 2. `NEXT_PUBLIC_FIREBASE_CONFIG` — JSON minifié sur une ligne
 * 3. `NEXT_PUBLIC_FIREBASE_CONFIG_B64` — même JSON encodé en base64 (pratique sur Vercel sans guillemets)
 * 4. Si `NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true` et rien d’autre → config démo (émulateur)
 */
function parseConfigJson(raw: string): Record<string, unknown> | null {
  const t = raw.trim();
  if (!t) return null;
  try {
    return JSON.parse(t) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function decodeB64Config(b64: string): Record<string, unknown> | null {
  const t = b64.trim().replace(/\s/g, "");
  if (!t || typeof atob === "undefined") return null;
  try {
    return parseConfigJson(atob(t));
  } catch {
    return null;
  }
}

export function getInforgeFirebaseConfig(): Record<string, unknown> | null {
  if (typeof window === "undefined") return null;

  const fromWindow = window.__firebase_config;
  if (fromWindow && typeof fromWindow === "string") {
    const parsed = parseConfigJson(fromWindow);
    if (parsed) return parsed;
  }

  const fromEnv = process.env.NEXT_PUBLIC_FIREBASE_CONFIG;
  if (fromEnv) {
    const parsed = parseConfigJson(fromEnv);
    if (parsed) return parsed;
  }

  const fromB64 = process.env.NEXT_PUBLIC_FIREBASE_CONFIG_B64;
  if (fromB64) {
    const parsed = decodeB64Config(fromB64);
    if (parsed) return parsed;
  }

  if (isFirebaseEmulatorEnabled()) {
    return getDemoEmulatorConfig();
  }

  return null;
}

export function getAppId(): string | null {
  if (typeof window !== "undefined" && window.__app_id) {
    return window.__app_id;
  }
  const env = process.env.NEXT_PUBLIC_APP_ID;
  if (env && env.length > 0) return env;
  if (isFirebaseEmulatorEnabled()) return "local";
  return null;
}

export function getInitialAuthToken(): string | null {
  if (typeof window !== "undefined" && window.__initial_auth_token) {
    return window.__initial_auth_token;
  }
  const env = process.env.NEXT_PUBLIC_INITIAL_AUTH_TOKEN;
  return env && env.length > 0 ? env : null;
}
