// manage-api (brain-api) client — typed client for the Brain platform's identity +
// entitlements + demo-capture API. Base URL is env-driven
// (NEXT_PUBLIC_MANAGE_API_BASE_URL); no hardcoded domain. See brain-api/CONTRACTS.md.
//
// Endpoints consumed here:
//   POST /auth/token     -> { access_token, token_type }      (login)
//   GET  /auth/me        -> identity (user + tenant)          (getMe)
//   GET  /entitlements   -> resolved product access + plan    (getEntitlements)
//   POST /demo-requests  -> lead-capture confirmation         (submitDemoRequest)

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Session = {
  token: string;
  tenantId: string;
  email: string;
};

// Portal-facing entitlement shape consumed by the /app dashboard shell. Mapped
// from the richer brain-api response (see getEntitlements).
export type Entitlements = {
  precheck: boolean;
  secretaria: boolean;
  plan: string; // "brain-completo" | "precheck" | "secretaria" | "free"
  clinicName: string;
};

export type MeResponse = {
  user: { id: string; email: string; name: string; role: string };
  tenant: { id: string; clinic_name: string } | null;
};

// Demo-request enums mirror the brain-api contract (CONTRACTS.md §4).
export type DemoProfile =
  | "clinica_privada"
  | "medico_autonomo"
  | "secretaria_municipal"
  | "hospital"
  | "outro";
export type DemoProductInterest = "precheck" | "secretaria" | "ambos";
export type DemoSource = "brain" | "secretaria" | "precheck";

export type DemoRequestPayload = {
  name: string;
  email: string;
  clinic?: string | null;
  profile?: DemoProfile | null;
  product_interest?: DemoProductInterest | null;
  message?: string | null;
  source?: DemoSource | null;
};

export type DemoRequestConfirmation = {
  id: string;
  status: string;
  message: string;
};

// ---------------------------------------------------------------------------
// Config + session storage
// ---------------------------------------------------------------------------

// Base URL for brain-api. Inlined at build time from the env var. Empty in dev
// (set NEXT_PUBLIC_MANAGE_API_BASE_URL to the brain-api origin, e.g.
// http://localhost:8000 locally or the deployed URL in production).
export const MANAGE_API_BASE = process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? "";

// sessionStorage key holding the logged-in Session (set by login, read by /app).
export const SESSION_KEY = "brain.session";

export function saveSession(session: Session): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession(): void {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SESSION_KEY);
}

// ---------------------------------------------------------------------------
// Low-level fetch
// ---------------------------------------------------------------------------

async function manageFetch<T>(
  path: string,
  opts: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await fetch(MANAGE_API_BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(opts.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI uses { detail: string } (or a list for 422). Surface a string.
    const detail =
      typeof body?.detail === "string" ? body.detail : res.statusText;
    throw new Error(detail);
  }
  return res.json() as Promise<T>;
}

// Decode (without verifying) a JWT payload to read the tenant_id claim. The
// token is verified server-side on every request; this is only used to populate
// the local Session for display/scoping.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split(".")[1];
    if (!part || typeof atob === "undefined") return null;
    const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 ? "=".repeat(4 - (b64.length % 4)) : "";
    return JSON.parse(atob(b64 + pad)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

type TokenResponse = { access_token: string; token_type: string };

// MANAGE-API CALL SITE #1 — unified login. POST /auth/token { email, password }.
// Stores and returns the Session.
export async function login(email: string, password: string): Promise<Session> {
  const data = await manageFetch<TokenResponse>("/auth/token", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const claims = decodeJwtPayload(data.access_token);
  const tenantId =
    typeof claims?.tenant_id === "string" ? (claims.tenant_id as string) : "";
  const session: Session = { token: data.access_token, tenantId, email };
  saveSession(session);
  return session;
}

// GET /auth/me — authenticated identity (no secrets). Optional helper.
export async function getMe(session: Session): Promise<MeResponse> {
  return manageFetch<MeResponse>("/auth/me", {}, session.token);
}

type EntitlementResponse = {
  tenant_id: string;
  clinic_name: string;
  products: { precheck: boolean; secretaria: boolean };
  plan: string;
  status: string;
  addons: Record<string, unknown>;
  limits: Record<string, unknown>;
  usage: Record<string, unknown>;
};

// MANAGE-API CALL SITE #2 — dashboard shell boot(). GET /entitlements (Bearer).
// Maps the brain-api response onto the portal-facing Entitlements shape.
export async function getEntitlements(session: Session): Promise<Entitlements> {
  const data = await manageFetch<EntitlementResponse>(
    "/entitlements",
    {},
    session.token,
  );
  return {
    precheck: data.products.precheck,
    secretaria: data.products.secretaria,
    plan: data.plan,
    clinicName: data.clinic_name,
  };
}

// POST /demo-requests — public "Agendar demo" lead capture.
export async function submitDemoRequest(
  payload: DemoRequestPayload,
): Promise<DemoRequestConfirmation> {
  return manageFetch<DemoRequestConfirmation>("/demo-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
