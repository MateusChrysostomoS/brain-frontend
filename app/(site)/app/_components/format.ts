// format.ts — pure, dependency-free formatting and date-range helpers shared by the
// /app dashboard panels (PreCheckPanel, SecretariaPanel). No React here, plain
// functions only, so they're trivially unit-testable if that's ever needed.
//
// Dates are formatted MANUALLY (not via Intl.DateTimeFormat) so the "dd/MM HH:mm"
// shape is deterministic across environments (Node/vitest vs. the browser can
// disagree on locale/ICU formatting details) — everything here reads the Date
// object's LOCAL getters, i.e. the viewer's browser-local time/day, matching the
// "browser-local day" semantics the dashboard panels need for their date filters.

// Zero-pads a number to 2 digits ("7" -> "07").
function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

// "2026-07-22T11:00:00Z" -> "22/07 08:00" (browser-local time). Returns "" for an
// absent/unparseable value so callers can render their own fallback copy.
export function formatDateTimePtBR(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getDate())}/${pad2(d.getMonth() + 1)} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// "2026-07-22T11:00:00Z" -> "08:00" (browser-local time). Returns "" when unparseable.
export function formatTimePtBR(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

// Whole minutes between two ISO timestamps, or null if either is missing/invalid/
// non-positive — callers should render nothing rather than a fabricated duration.
export function durationMinutes(
  startIso: string | null | undefined,
  endIso: string | null | undefined,
): number | null {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null;
  return Math.round((end - start) / 60000);
}

// True when both dates fall on the same browser-local calendar day.
function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

// True when `iso` is "today", browser-local. Backs both panels' "Hoje" tiles/filters.
export function isTodayLocal(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  return isSameLocalDay(d, new Date());
}

// True when `iso` falls within the last `days` calendar days, INCLUDING today
// (days=7 == today + the 6 previous days). Browser-local. Backs PreCheckPanel's
// "7 dias" / "30 dias" date pills.
export function isWithinLastDays(iso: string | null | undefined, days: number): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1));
  return d.getTime() >= cutoff.getTime();
}

// True when `iso` falls between today 00:00 (browser-local) and 7 days from now —
// SecretariaPanel's "Semana" pill. Forward-looking (an agenda, not a report): it
// shows the week AHEAD, not the calendar Mon-Sun week.
export function isWithinNextWeek(iso: string | null | undefined): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfWindow = new Date(startOfToday);
  endOfWindow.setDate(endOfWindow.getDate() + 7);
  return d.getTime() >= startOfToday.getTime() && d.getTime() < endOfWindow.getTime();
}

// Diacritic- and case-insensitive normalization for client-side search
// ("José" and "jose" both normalize to "jose"). `\p{Diacritic}` is a Unicode
// property escape (plain ASCII in source, no embedded combining characters) that
// matches every combining mark NFD decomposition can produce.
function normalizeForSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

// True when `haystack` contains `needle` after diacritic/case normalization. An
// empty/whitespace-only needle always matches (no active search).
export function matchesSearch(haystack: string, needle: string): boolean {
  const q = needle.trim();
  if (!q) return true;
  return normalizeForSearch(haystack).includes(normalizeForSearch(q));
}

// pt-BR singular/plural noun suffix: pluralize(1, "consulta") -> "consulta",
// pluralize(2, "consulta") -> "consultas". Every noun pluralized on this page is
// regular (just add "s"), so no irregular-plural table is needed.
export function pluralize(count: number, singular: string): string {
  return count === 1 ? singular : `${singular}s`;
}
