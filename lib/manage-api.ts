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

// Brain role names (mirror brain-api). `admin` is platform-level (no tenant);
// tenant_owner/tenant_staff are tenant-scoped doctor users.
export type Role = "admin" | "tenant_owner" | "tenant_staff";

export type Session = {
  token: string;
  tenantId: string;
  email: string;
  // Decoded from the JWT `role` claim at login — drives post-login portal routing
  // (admin -> /admin/dashboard, tenant_owner|tenant_staff -> /doctor/dashboard).
  role: string;
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
// Strip any trailing slash so `MANAGE_API_BASE + "/auth/token"` can never become
// `//auth/token` (which the API treats as a different, non-existent route).
export const MANAGE_API_BASE = (
  process.env.NEXT_PUBLIC_MANAGE_API_BASE_URL ?? ""
).replace(/\/+$/, "");

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

// Error carrying the HTTP status so callers can branch on it (e.g. the SSO handoff
// distinguishes 403 `precheck_not_entitled` from 409 `precheck_account_not_linked`).
// `.message` is FastAPI's `detail` string (a stable machine code for typed errors), so
// existing callers that only read `.message` keep working.
export class ManageApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ManageApiError";
    this.status = status;
  }
}

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
    throw new ManageApiError(res.status, detail);
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
  const role = typeof claims?.role === "string" ? (claims.role as string) : "";
  const session: Session = { token: data.access_token, tenantId, email, role };
  saveSession(session);
  return session;
}

// GET /auth/me — authenticated identity (no secrets). Optional helper.
export async function getMe(session: Session): Promise<MeResponse> {
  return manageFetch<MeResponse>("/auth/me", {}, session.token);
}

export type EntitlementResponse = {
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

// Result of the PreCheck SSO handoff: a PreCheck-compatible token + its lifetime (s).
export type PrecheckSsoToken = { token: string; expiresIn: number };

// MANAGE-API CALL SITE #3 — "Abrir PreCheck" handoff. POST /sso/precheck/token (Bearer
// brain JWT). brain-api verifies the tenant owns PreCheck and that the user has a linked
// PreCheck account, then mints a token PreCheck's backend already trusts (shared
// SECRET_KEY). The caller stores it as PreCheck's `precheck_token` (same-origin
// localStorage) and routes to /dashboard — no second login. Throws ManageApiError with
// status 403 (`precheck_not_entitled`) or 409 (`precheck_account_not_linked`).
export async function getPrecheckSsoToken(
  session: Session,
): Promise<PrecheckSsoToken> {
  const data = await manageFetch<{
    token: string;
    token_type: string;
    expires_in: number;
  }>("/sso/precheck/token", { method: "POST" }, session.token);
  return { token: data.token, expiresIn: data.expires_in };
}

// ---------------------------------------------------------------------------
// Admin API (role=admin) — RBAC task Part 3B
//
// Every call sends the admin's Bearer token; brain-api re-checks the `admin` role
// server-side (router-level require_role("admin")). Tenant ids here are RESOURCE path
// params on admin (cross-tenant) routes — never a scoping bypass.
// ---------------------------------------------------------------------------

// Uniform paginated envelope returned by every admin list endpoint.
export type Page<T> = {
  items: T[];
  total: number;
  skip: number;
  limit: number;
};

export type AdminTenant = {
  id: string;
  clinic_name: string;
  created_at: string;
  plan: string;
  status: string;
  precheck_enabled: boolean;
  secretaria_enabled: boolean;
  users_count: number;
};

export type EntitlementAdmin = {
  tenant_id: string;
  precheck_enabled: boolean;
  secretaria_enabled: boolean;
  plan: string;
  status: string;
  addons: Record<string, unknown>;
  limits: Record<string, unknown>;
  usage: Record<string, unknown>;
  period_start: string | null;
  period_end: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  updated_at: string | null;
};

export type AdminTenantDetail = {
  id: string;
  clinic_name: string;
  created_at: string;
  updated_at: string;
  users_count: number;
  entitlements: EntitlementAdmin;
};

// Partial entitlement update — only the fields present are applied server-side.
export type EntitlementPatch = {
  precheck_enabled?: boolean;
  secretaria_enabled?: boolean;
  plan?: string;
  status?: string;
  addons?: Record<string, unknown>;
  limits?: Record<string, unknown>;
};

export type AdminUser = {
  id: string;
  tenant_id: string | null;
  clinic_name: string | null; // null => "Platform Admin"
  email: string;
  name: string;
  role: string;
  created_at: string;
};

export type AdminUserCreate = {
  email: string;
  name: string;
  password: string;
  role: Role;
  tenant_id?: string | null; // required for tenant roles; omitted for admin
};

export type AdminDemoRequest = {
  id: string;
  name: string;
  email: string;
  clinic: string | null;
  profile: string | null;
  product_interest: string | null;
  message: string | null;
  source: string | null;
  status: string;
  created_at: string;
};

export type DemoRequestStatus = "contacted" | "converted" | "dismissed";

// One inbound lead as returned by PreCheck (proxied via brain-api GET /admin/inbound).
export type PrecheckInbound = {
  id: number;
  name: string;
  email: string;
  clinic_name: string | null;
  profile: string | null;
  message: string | null;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
};

export type PrecheckInboundList = {
  items: PrecheckInbound[];
  total: number;
  skip: number;
  limit: number;
  has_next?: boolean;
  stub?: boolean; // true when brain-api has no PreCheck upstream configured
};

// Build a `?skip=&limit=` query string for the paginated list endpoints.
function pageQuery(skip: number, limit: number): string {
  return `?skip=${skip}&limit=${limit}`;
}

export function adminListTenants(
  session: Session,
  skip = 0,
  limit = 50,
): Promise<Page<AdminTenant>> {
  return manageFetch<Page<AdminTenant>>(
    "/admin/tenants" + pageQuery(skip, limit),
    {},
    session.token,
  );
}

export function adminGetTenant(
  session: Session,
  tenantId: string,
): Promise<AdminTenantDetail> {
  return manageFetch<AdminTenantDetail>(
    `/admin/tenants/${tenantId}`,
    {},
    session.token,
  );
}

export function adminGetEntitlements(
  session: Session,
  tenantId: string,
): Promise<EntitlementAdmin> {
  return manageFetch<EntitlementAdmin>(
    `/admin/tenants/${tenantId}/entitlements`,
    {},
    session.token,
  );
}

export function adminPatchEntitlements(
  session: Session,
  tenantId: string,
  patch: EntitlementPatch,
): Promise<EntitlementAdmin> {
  return manageFetch<EntitlementAdmin>(
    `/admin/tenants/${tenantId}/entitlements`,
    { method: "PATCH", body: JSON.stringify(patch) },
    session.token,
  );
}

export function adminListUsers(
  session: Session,
  skip = 0,
  limit = 50,
): Promise<Page<AdminUser>> {
  return manageFetch<Page<AdminUser>>(
    "/admin/users" + pageQuery(skip, limit),
    {},
    session.token,
  );
}

export function adminCreateUser(
  session: Session,
  payload: AdminUserCreate,
): Promise<AdminUser> {
  return manageFetch<AdminUser>(
    "/admin/users",
    { method: "POST", body: JSON.stringify(payload) },
    session.token,
  );
}

export function adminListDemoRequests(
  session: Session,
  skip = 0,
  limit = 50,
): Promise<Page<AdminDemoRequest>> {
  return manageFetch<Page<AdminDemoRequest>>(
    "/admin/demo_requests" + pageQuery(skip, limit),
    {},
    session.token,
  );
}

export function adminPatchDemoRequest(
  session: Session,
  id: string,
  status: DemoRequestStatus,
): Promise<AdminDemoRequest> {
  return manageFetch<AdminDemoRequest>(
    `/admin/demo_requests/${id}`,
    { method: "PATCH", body: JSON.stringify({ status }) },
    session.token,
  );
}

export function adminGetInbound(
  session: Session,
  skip = 0,
  limit = 50,
): Promise<PrecheckInboundList> {
  return manageFetch<PrecheckInboundList>(
    "/admin/inbound" + pageQuery(skip, limit),
    {},
    session.token,
  );
}

// ---------------------------------------------------------------------------
// Doctor API (role=tenant_owner|tenant_staff) — RBAC task Part 3C
//
// The tenant is ALWAYS derived server-side from the JWT — these calls never send a
// tenant_id. Anamneses are proxied by brain-api to PreCheck.
// ---------------------------------------------------------------------------

export type DoctorMe = {
  user: { id: string; email: string; name: string; role: string };
  tenant: { id: string; clinic_name: string };
  entitlements: EntitlementResponse;
};

// One anamnesis row (list). `summary_preview` is a 120-char teaser — no full PHI.
export type Anamnesis = {
  id: number;
  patient_name: string;
  created_at: string;
  status: string;
  summary_preview: string;
};

export type AnamnesisList = {
  items: Anamnesis[];
  total: number;
  skip: number;
  limit: number;
  stub?: boolean; // true when brain-api has no PreCheck upstream configured
};

export type AnamnesisDetail = {
  id: number;
  patient_name: string;
  created_at: string;
  updated_at: string;
  status: string;
  ai_summary: string;
  final_summary: string | null;
  structured_data: Record<string, unknown>;
};

export function getDoctorMe(session: Session): Promise<DoctorMe> {
  return manageFetch<DoctorMe>("/doctor/me", {}, session.token);
}

export function listAnamneses(
  session: Session,
  skip = 0,
  limit = 50,
): Promise<AnamnesisList> {
  return manageFetch<AnamnesisList>(
    "/doctor/anamneses" + pageQuery(skip, limit),
    {},
    session.token,
  );
}

export function getAnamnesis(
  session: Session,
  id: number,
): Promise<AnamnesisDetail> {
  return manageFetch<AnamnesisDetail>(
    `/doctor/anamneses/${id}`,
    {},
    session.token,
  );
}
