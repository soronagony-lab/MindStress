/** Chemins officiels de l’app — utiliser ces constantes pour éviter les liens cassés. */
export const ROUTES = {
  home: "/home",
  drMind: "/dr-mind",
  bancPublic: "/banc-public",
  guide: "/guide",
  auth: "/auth",
  landing: "/",
} as const;

export type RouteKey = keyof typeof ROUTES;
