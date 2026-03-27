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
