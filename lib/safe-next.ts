// safe-next.ts — the ONLY place that decides whether a `?next=` value may be
// followed after /login (open-redirect guard, spec 2026-09-29 §5.2 / §9).
//
// Rule: a same-origin RELATIVE path — starts with exactly one "/", never "//",
// never a backslash (browsers treat "\" like "/"), never whitespace/control
// characters (browsers strip tab/newline, which can turn "/\t/x" into "//x"),
// and the same checks hold for every percent-decoded form of the value, so an
// encoded "//" cannot slip through a later decode. Anything else is ignored and
// the caller falls back to the role home. Pure: no window, no router.

const MAX_NEXT_LENGTH = 512;
const MAX_DECODE_ROUNDS = 3;
// Resolution probe only — never navigated to.
const PROBE_ORIGIN = "https://brain-frontend.invalid";

function isSafeForm(form: string): boolean {
  if (!form.startsWith("/") || form.startsWith("//")) return false;
  if (form.includes("\\")) return false;
  if (/[\u0000-\u001f\u007f\s]/.test(form)) return false;
  return true;
}

export function safeNextPath(raw: string | null | undefined): string | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > MAX_NEXT_LENGTH) return null;

  const forms: string[] = [raw];
  let current = raw;
  for (let round = 0; round < MAX_DECODE_ROUNDS; round += 1) {
    let decoded: string;
    try {
      decoded = decodeURIComponent(current);
    } catch {
      return null; // malformed percent-encoding
    }
    if (decoded === current) break;
    forms.push(decoded);
    current = decoded;
  }
  // Still changing after the last allowed round: encoded deeper than any real
  // link of ours ever is — refuse rather than guess.
  try {
    if (decodeURIComponent(current) !== current) return null;
  } catch {
    return null;
  }

  if (!forms.every(isSafeForm)) return null;

  let resolved: URL;
  try {
    resolved = new URL(raw, PROBE_ORIGIN);
  } catch {
    return null;
  }
  if (resolved.origin !== PROBE_ORIGIN) return null;
  return raw;
}

// Where /login sends a freshly signed-in person: a safe `next` wins; otherwise
// the role home (RBAC task 3A: admins to the admin portal, every clinic role —
// doctor/manager and the legacy tenant_owner/tenant_staff — to the doctor portal).
export function postLoginRoute(role: string, next: string | null | undefined): string {
  const safe = safeNextPath(next);
  if (safe) return safe;
  return role === "admin" ? "/admin/dashboard" : "/doctor/dashboard";
}
