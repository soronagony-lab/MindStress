"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
  signOut as firebaseSignOut,
  type User,
} from "firebase/auth";
import { getFirebaseApp, getFirebaseAuth } from "@/lib/firebase/client";
import {
  getAppId,
  getInforgeFirebaseConfig,
  getInitialAuthToken,
} from "@/lib/firebase/inforge";
import {
  recordAuthLogin,
  recordAuthLogout,
  recordSessionOpen,
} from "@/lib/firestore/user-metrics";

type FirebaseContextValue = {
  user: User | null;
  loading: boolean;
  error: Error | null;
  appId: string | null;
  ready: boolean;
  authBusy: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Relance l’initialisation (ex. après correction du .env local) */
  retryInit: () => void;
};

const FirebaseContext = createContext<FirebaseContextValue | undefined>(
  undefined
);

export function FirebaseProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);

  const init = useCallback(async () => {
    setError(null);
    setLoading(true);

    try {
      const cfg = getInforgeFirebaseConfig();
      if (!cfg) {
        throw new Error(
          "Configuration Firebase absente. BD locale : NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true + npm run emulators. Sinon : .env.local avec NEXT_PUBLIC_FIREBASE_CONFIG (voir LOCAL.md)."
        );
      }

      getFirebaseApp();
      const auth = getFirebaseAuth();
      const token = getInitialAuthToken();

      if (token) {
        await signInWithCustomToken(auth, token);
      } else {
        await signInAnonymously(auth);
      }

      setAppId(getAppId());
      setReady(true);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
      setReady(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  const retryInit = useCallback(() => {
    void init();
  }, [init]);

  const signIn = useCallback(async () => {
    if (!ready) return;
    setAuthBusy(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const token = getInitialAuthToken();
      if (token) {
        await signInWithCustomToken(auth, token);
      } else {
        await signInAnonymously(auth);
      }
      const uid = auth.currentUser?.uid;
      const aid = getAppId();
      if (uid && aid) {
        try {
          await recordAuthLogin(aid, uid);
        } catch {
          /* métriques non bloquantes */
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setAuthBusy(false);
    }
  }, [ready]);

  const signOutUser = useCallback(async () => {
    if (!ready) return;
    setAuthBusy(true);
    setError(null);
    try {
      const auth = getFirebaseAuth();
      const uid = auth.currentUser?.uid;
      const aid = appId ?? getAppId();
      if (uid && aid) {
        try {
          await recordAuthLogout(aid, uid);
        } catch {
          /* métriques non bloquantes */
        }
      }
      if (typeof sessionStorage !== "undefined" && uid) {
        sessionStorage.removeItem(`ms_metrics_sess_${uid}`);
        sessionStorage.removeItem(`ms_login_sess_${uid}`);
      }
      await firebaseSignOut(auth);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setAuthBusy(false);
    }
  }, [ready, appId]);

  useEffect(() => {
    if (!ready) return;

    let unsub: (() => void) | undefined;
    try {
      const auth = getFirebaseAuth();
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u);
      });
    } catch {
      /* déjà géré par init */
    }
    return () => unsub?.();
  }, [ready]);

  /** Première connexion comptée par session d’onglet (rechargement inclus). */
  useEffect(() => {
    if (!ready || !user || !appId) return;
    if (typeof sessionStorage === "undefined") return;
    const key = `ms_login_sess_${user.uid}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, "1");
    void recordAuthLogin(appId, user.uid).catch(() => {});
  }, [ready, user, appId]);

  /** Une ouverture d’app par session navigateur + série (jour local). */
  useEffect(() => {
    if (!ready || !user || !appId) return;
    void recordSessionOpen(appId, user.uid).catch(() => {});
  }, [ready, user, appId]);

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user,
      loading,
      error,
      appId,
      ready,
      authBusy,
      signIn,
      signOut: signOutUser,
      retryInit,
    }),
    [user, loading, error, appId, ready, authBusy, signIn, signOutUser, retryInit]
  );

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export function useFirebaseAuth() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error("useFirebaseAuth doit être utilisé sous FirebaseProvider");
  }
  return ctx;
}
