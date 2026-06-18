// manage-api (brain-api) client — typed stubs for the Brain platform.
// Base URL from env (NEXT_PUBLIC_MANAGE_API_BASE_URL); relative "/api/manage"
// fallback keeps it domain-agnostic. Replace the stub bodies with real fetch
// calls when the backend lands. Search "MANAGE-API CALL SITE" for call sites.

export type Session = {
  token: string;
  tenantId: string;
  email: string;
};

export type Entitlements = {
  precheck: boolean;
  secretaria: boolean;
  plan: string; // "brain-completo" | "precheck" | "secretaria"
  clinicName: string;
};

export const MANAGE_API_BASE =
  process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL || "/api/manage";

// sessionStorage key holding the logged-in Session (set by login, read by /app).
export const SESSION_KEY = "brain.session";

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// MANAGE-API CALL SITE #1 — unified login.
// Real impl: POST `${MANAGE_API_BASE}/auth/login` { email, password } -> Session
export async function login(email: string, password: string): Promise<Session> {
  // === STUB: no backend yet. Replace with a real fetch. ===
  void password; // part of the real contract; unused by the stub
  await delay(650);
  return {
    token: "stub.jwt.token",
    tenantId: "tenant_demo",
    email: email || "dra.demo@clinica.com.br",
  };
}

// MANAGE-API CALL SITE #2 — dashboard shell boot().
// Real impl: GET `${MANAGE_API_BASE}/tenant/entitlements` (Bearer) -> Entitlements
// Stub reads ?ent=both|precheck|secretaria so every shell state stays reviewable.
export async function getEntitlements(
  session?: Session | null,
): Promise<Entitlements> {
  void session; // the real impl sends session.token as a Bearer header
  await delay(400);
  const mode =
    (typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("ent")
      : null) || "both";
  return {
    precheck: mode === "both" || mode === "precheck",
    secretaria: mode === "both" || mode === "secretaria",
    plan: mode === "both" ? "brain-completo" : mode,
    clinicName: "Consultório Dr. Aurélio Lima",
  };
}
