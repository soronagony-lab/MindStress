/**
 * Chemins Firestore imposés par Inforge — ne pas modifier.
 * Pas d’orderBy/limit côté requête : filtrer/trier en mémoire si besoin.
 */

export const COLLECTIONS = {
  /** Sous-collection privée : artifacts/{appId}/users/{userId}/profile/{docId} */
  privateProfile: "profile",
  /** Métriques compte : artifacts/{appId}/users/{userId}/metrics/main */
  userMetrics: "metrics",
  /** Historique progression : artifacts/{appId}/users/{userId}/progress_entries/{yyyy-mm-dd} */
  progressEntries: "progress_entries",
  /** Collection publique : artifacts/{appId}/public/data/profiles */
  publicProfiles: "profiles",
  bancMessages: "banc_messages",
  drMindThreads: "dr_mind_threads",
} as const;

/** ID de document unique pour profil / métriques agrégées */
export const USER_SINGLE_DOC_ID = "main" as const;
