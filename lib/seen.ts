// Tracks which summary IDs the user has already opened — drives the "NOVO" badge.

const SEEN_KEY = "precheck_seen_ids";

export function getSeenIds(): Set<number> {
  if (typeof window === "undefined") return new Set();
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function markSeen(id: number): void {
  if (typeof window === "undefined") return;
  const ids = getSeenIds();
  if (ids.has(id)) return;
  ids.add(id);
  localStorage.setItem(SEEN_KEY, JSON.stringify([...ids]));
}
