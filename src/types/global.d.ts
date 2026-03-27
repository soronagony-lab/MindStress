export {};

declare global {
  interface Window {
    /** JSON stringifié de la config Firebase (Inforge.dev) */
    __firebase_config?: string;
    /** Identifiant d’application Inforge */
    __app_id?: string;
    /** Token pour signInWithCustomToken (prioritaire sur anonyme) */
    __initial_auth_token?: string;
  }
}
