/** Profil confidentiel (Firestore privé utilisateur) */
export type PrivateProfile = {
  fullName: string;
  phone: string;
  email: string;
  createdAt: number;
  updatedAt: number;
};

/** Profil public — seul le pseudonyme est exposé dans l’UI (ex. Banc public) */
export type PublicProfile = {
  pseudonym: string;
  updatedAt: number;
};

/** Score Gnan (placeholder métier) */
export type GnanScore = {
  value: number;
  label: string;
  updatedAt: number;
};

/** Diagnostic somatique par zone */
export type SomaticZone = "tete" | "coeur" | "ventre" | "dos";

/**
 * Métriques agrégées — document `metrics/main` sous l’utilisateur.
 * Connexion / déconnexion / inscription profil + usage (sessions, série).
 */
export type UserMetrics = {
  firstSeenAt: number;
  updatedAt: number;
  lastLoginAt: number;
  lastLogoutAt: number | null;
  /** Nombre de clics « Connexion » réussis */
  loginCount: number;
  /** Nombre de déconnexions explicites */
  logoutCount: number;
  /** Ouvertures d’app comptées une fois par session navigateur */
  sessionOpens: number;
  /** Jour civil dernier passage (YYYY-MM-DD local), pour la série */
  lastActiveDay: string;
  /** Jours consécutifs avec au moins une ouverture comptée */
  activeStreakDays: number;
  /** Horodatage quand le formulaire profil a été enregistré (inscription) */
  profileCompletedAt: number | null;
};

/**
 * Snapshot quotidien — document `progress_entries/{yyyy-mm-dd}`.
 */
export type ProgressDayEntry = {
  dayId: string;
  gnan: number;
  somatic: Record<SomaticZone, 0 | 1 | 2 | 3>;
  updatedAt: number;
};

export type SomaticEntry = {
  zone: SomaticZone;
  intensity: 0 | 1 | 2 | 3;
  note?: string;
};

/** Message Banc public — jamais d’email/téléphone/nom réel côté affichage */
export type BancPublicMessage = {
  id: string;
  threadId: string;
  authorUid: string;
  pseudonym: string;
  text: string;
  createdAt: number;
};

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};
