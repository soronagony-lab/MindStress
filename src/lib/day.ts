/** Identifiant de jour civil local `YYYY-MM-DD` (Firestore, métriques). */
export function localDayId(d: Date = new Date()): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Jour précédent (local), même format. */
export function previousLocalDayId(dayId: string): string | null {
  const [y, m, d] = dayId.split("-").map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() - 1);
  return localDayId(dt);
}
