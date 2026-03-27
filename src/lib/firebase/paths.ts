/**
 * Chemins Firestore imposés par Inforge — ne pas modifier.
 * Pas d’orderBy/limit côté requête : filtrer/trier en mémoire si besoin.
 */

export const COLLECTIONS = {
  /** Sous-collection privée : artifacts/{appId}/users/{userId}/profile */
  privateProfile: "profile",
  /** Collection publique : artifacts/{appId}/public/data/profiles */
  publicProfiles: "profiles",
  bancMessages: "banc_messages",
  drMindThreads: "dr_mind_threads",
  gnanScores: "gnan_scores",
  somatic: "somatic_entries",
} as const;
