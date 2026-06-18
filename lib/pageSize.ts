// Dashboard preference: how many summary bars to show per page.
// Persisted in localStorage so the user's choice sticks across sessions.

export type PageSize = number | "all";

const PAGE_SIZE_KEY = "precheck_page_size";

// Default ("pattern") limit and the presets offered in the UI.
export const DEFAULT_PAGE_SIZE = 20;
export const PAGE_SIZE_OPTIONS: PageSize[] = [20, 50, 100, "all"];

export function getStoredPageSize(): PageSize {
  if (typeof window === "undefined") return DEFAULT_PAGE_SIZE;
  try {
    const raw = localStorage.getItem(PAGE_SIZE_KEY);
    if (raw === "all") return "all";
    const n = Number(raw);
    return PAGE_SIZE_OPTIONS.includes(n) ? n : DEFAULT_PAGE_SIZE;
  } catch {
    return DEFAULT_PAGE_SIZE;
  }
}

export function setStoredPageSize(size: PageSize): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PAGE_SIZE_KEY, String(size));
  } catch {
    /* storage unavailable (private mode) — the choice just won't persist */
  }
}
