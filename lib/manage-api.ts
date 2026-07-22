// manage-api (brain-api) client — typed client for the Brain platform's identity +
// entitlements + demo-capture API. Base URL is env-driven
// (NEXT_PUBLIC_MANAGE_API_BASE_URL); no hardcoded domain. See brain-api/CONTRACTS.md.
//
// Endpoints consumed here:
//   POST /auth/token     -> { access_token, refresh_token, expires_in } (login)
//   POST /auth/refresh   -> new token pair (rotate-on-use)    (internal, via manageFetch)
//   POST /auth/logout    -> revoke the refresh token          (logout)
//   GET  /auth/me        -> identity (user + tenant)          (getMe)
//   GET  /entitlements   -> resolved product access + plan    (getEntitlements)
//   POST /billing/checkout -> Stripe Checkout URL             (createCheckoutSession)
//   POST /billing/portal   -> Stripe Billing Portal URL       (createPortalSession)
//   POST /doctor/secretaria/hub-token -> secretarIA hub token (getSecretariaHubToken)
//   POST /demo-requests  -> lead-capture confirmation         (submitDemoRequest)
//   GET  /public/checkout-config         -> trial length, in days    (getCheckoutTrialDays)
//   POST /public/signup-intents          -> register lead + session  (registerSignup)
//   POST /doctor/onboarding/intake       -> attach wizard intake     (attachSignupIntake)
//   POST /public/checkout-sessions       -> Stripe Checkout URL      (createPublicCheckoutSession)
//   GET  /public/onboarding-status       -> async webhook activation (getOnboardingStatus)
//   POST /auth/exchange-onboarding-token -> real session, one-time   (exchangeOnboardingToken)

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
  // Opaque revocable refresh token (CONTRACTS §2.1a). Optional: sessions stored
  // before this field existed — and the impersonated "Modo médico" doctor session,
  // which deliberately has no refresh leg — simply can't auto-refresh.
  refreshToken?: string;
  // Decoded from the JWT `professional_id` claim (Onboarding & Multi-Professional
  // contract §6) — set when this user is bound to a specific secretarIA
  // professional (a tenant_staff invitee, or an owner who self-bound). null/absent
  // means "not bound to a professional" (e.g. an owner who only administers).
  professionalId?: string | null;
};

// Portal-facing entitlement shape consumed by the /app dashboard shell. Mapped
// from the richer brain-api response (see getEntitlements). The first four fields
// are the original contract (unchanged consumers keep working); status/addons/
// limits are additive — the catalog round formalized them as FULL keysets
// (every add-on id -> bool, every limit key -> int), so UI gating can read them
// directly instead of waiting for a backend 403.
export type Entitlements = {
  precheck: boolean;
  secretaria: boolean;
  plan: string; // catalog plan id (legacy rows may carry an alias like "brain-completo")
  clinicName: string;
  status: string; // "active" | "trialing" | "past_due" | "canceled" | "inactive"
  secretariaTier: string | null; // "ferro" | "bronze_1" | "bronze_2" | null
  addons: Record<string, boolean>;
  limits: Record<string, number>;
};

export type MeResponse = {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    // Onboarding & Multi-Professional contract §6 — mirrors the JWT claim.
    professional_id: string | null;
  };
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
// "Modo médico" (admin doctor-mode) keys: a marker describing the active impersonation, and
// a stash of the admin's own Session so "Voltar ao admin" can restore it without re-login.
// See enterDoctorMode / exitDoctorMode below and CONTRACTS §11.4.
export const IMPERSONATION_KEY = "brain.impersonation";
const ADMIN_STASH_KEY = "brain.admin_session";

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
  // A full logout also leaves doctor-mode: drop the marker + the stashed admin session so no
  // impersonation state outlives the session it belonged to.
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(IMPERSONATION_KEY);
  sessionStorage.removeItem(ADMIN_STASH_KEY);
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

async function rawManageFetch(
  path: string,
  opts: RequestInit = {},
  token?: string,
): Promise<Response> {
  return fetch(MANAGE_API_BASE + path, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: "Bearer " + token } : {}),
      ...(opts.headers || {}),
    },
  });
}

async function parseManageResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    // FastAPI uses { detail: string } (or a list for 422). Surface a string.
    const detail =
      typeof body?.detail === "string" ? body.detail : res.statusText;
    throw new ManageApiError(res.status, detail);
  }
  // 204 (e.g. /auth/logout) has no body.
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// --- Transparent refresh-on-401 (CONTRACTS §2.1a) -------------------------
//
// When an authenticated call 401s with the CURRENT stored session's access token
// and that session has a refresh token, rotate the pair once (single-flight so
// concurrent 401s share one /auth/refresh call) and retry the original request
// exactly once with the new access token. A second 401 propagates — never loop.
// A rejected refresh (revoked/reused/expired) clears the session and routes to
// /login; a NETWORK failure on refresh just lets the original 401 surface
// (transient outage shouldn't force a logout — callers already bounce on 401).

let refreshInFlight: Promise<Session | null> | null = null;

function redirectToLogin(): void {
  if (typeof window !== "undefined") window.location.assign("/login");
}

async function doRefresh(current: Session): Promise<Session | null> {
  let res: Response;
  try {
    res = await rawManageFetch("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token: current.refreshToken }),
    });
  } catch {
    return null; // network blip — don't destroy the session
  }
  if (!res.ok) {
    // Rotate-on-use rejection (revoked, reused, expired, 429): the revocable leg
    // is dead. Clear locally and send the user to log in again.
    clearSession();
    redirectToLogin();
    return null;
  }
  const data = (await res.json()) as TokenResponse;
  // Re-decode professional_id from the FRESH token rather than carrying over
  // `current`'s — an owner can self-bind (or a staff invite can be re-issued)
  // mid-session, and the next refresh is the first chance to pick that up.
  const claims = decodeJwtPayload(data.access_token);
  const session: Session = {
    ...current,
    token: data.access_token,
    refreshToken: data.refresh_token ?? current.refreshToken,
    professionalId: readProfessionalIdClaim(claims),
  };
  saveSession(session);
  return session;
}

function refreshCurrentSession(current: Session): Promise<Session | null> {
  if (!refreshInFlight) {
    refreshInFlight = doRefresh(current).finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

// Token-LIFECYCLE endpoints must never trigger a transparent refresh (a failing
// refresh retrying itself would loop). Plain authenticated reads like /auth/me
// are NOT excluded — they benefit from refresh like any other endpoint.
const NO_REFRESH_PATHS = new Set(["/auth/token", "/auth/refresh", "/auth/logout"]);

async function manageFetch<T>(
  path: string,
  opts: RequestInit = {},
  token?: string,
): Promise<T> {
  const res = await rawManageFetch(path, opts, token);
  if (res.status === 401 && token && !NO_REFRESH_PATHS.has(path)) {
    // Only refresh for the STORED session's own token — a stale/impersonated/
    // foreign token isn't ours to rotate (the "Modo médico" doctor session has
    // no refreshToken and correctly falls through to the plain 401).
    const current = getSession();
    if (current && current.token === token && current.refreshToken) {
      const refreshed = await refreshCurrentSession(current);
      if (refreshed) {
        return parseManageResponse<T>(
          await rawManageFetch(path, opts, refreshed.token),
        );
      }
    }
  }
  return parseManageResponse<T>(res);
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

// §2.1: refresh_token (opaque, revocable) + expires_in (access TTL, seconds) are
// additive fields on the same TokenResponse shape /auth/refresh also returns.
type TokenResponse = {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in?: number;
};

// MANAGE-API CALL SITE #1 — unified login. POST /auth/token { email, password }.
// Stores and returns the Session (access + refresh pair; access is 30 min, the
// refresh flow in manageFetch keeps the session alive past it).
export async function login(email: string, password: string): Promise<Session> {
  const data = await manageFetch<TokenResponse>("/auth/token", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const claims = decodeJwtPayload(data.access_token);
  const tenantId =
    typeof claims?.tenant_id === "string" ? (claims.tenant_id as string) : "";
  const role = typeof claims?.role === "string" ? (claims.role as string) : "";
  const session: Session = {
    token: data.access_token,
    tenantId,
    email,
    role,
    refreshToken: data.refresh_token,
    professionalId: readProfessionalIdClaim(claims),
  };
  saveSession(session);
  return session;
}

// Reads the optional `professional_id` claim (string UUID or absent/null) from
// decoded JWT claims. Shared by every function that builds a Session from a
// freshly minted access token.
function readProfessionalIdClaim(
  claims: Record<string, unknown> | null,
): string | null {
  return typeof claims?.professional_id === "string"
    ? (claims.professional_id as string)
    : null;
}

// MANAGE-API CALL SITE #5 — explicit logout. POST /auth/logout { refresh_token }
// (always 204 server-side — no token-existence oracle). Best-effort: the LOCAL
// session is cleared unconditionally and first, so a network failure can never
// leave the user "stuck logged in". Also revokes the stashed admin session's
// refresh token when logging out from inside "Modo médico" — otherwise that
// (more privileged) revocable leg would silently outlive the logout.
export async function logout(): Promise<void> {
  const tokens: string[] = [];
  if (typeof window !== "undefined") {
    const current = getSession();
    if (current?.refreshToken) tokens.push(current.refreshToken);
    try {
      const stash = sessionStorage.getItem(ADMIN_STASH_KEY);
      const admin = stash ? (JSON.parse(stash) as Session) : null;
      if (admin?.refreshToken) tokens.push(admin.refreshToken);
    } catch {
      // unreadable stash — nothing to revoke
    }
  }
  clearSession();
  await Promise.all(
    tokens.map((refresh_token) =>
      rawManageFetch("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh_token }),
      }).catch(() => undefined),
    ),
  );
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
  secretaria_tier?: string | null;
  status: string;
  addons: Record<string, unknown>;
  limits: Record<string, unknown>;
  usage: Record<string, unknown>;
};

// Coerce the wire keysets defensively (the catalog guarantees full boolean/int
// keysets, but the UI should never crash on a stale row shape).
function coerceAddons(raw: Record<string, unknown>): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(raw || {})) out[k] = v === true;
  return out;
}

function coerceLimits(raw: Record<string, unknown>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(raw || {}))
    out[k] = typeof v === "number" && Number.isFinite(v) ? v : 0;
  return out;
}

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
    status: data.status,
    secretariaTier: data.secretaria_tier ?? null,
    addons: coerceAddons(data.addons),
    limits: coerceLimits(data.limits),
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

// ---------------------------------------------------------------------------
// Self-service cold signup (public, unauthenticated) — Stripe-test-mode
// validation pass. A visitor with no Brain account buys a plan straight from
// the marketing site: create a pending signup intent, start a Stripe Checkout
// session for it, poll for the async webhook activation, then exchange the
// one-time onboarding token for a real session. See docs on the
// /checkout/sucesso page for the polling contract.
// ---------------------------------------------------------------------------

// GET /public/checkout-config — unauthenticated config read backing the
// pre-checkout trial disclosure (CheckoutTrialNotice component). The deployed
// STRIPE_TRIAL_PERIOD_DAYS value lives ONLY on brain-api; this is the single
// place the frontend learns it, so the disclosure copy can never hardcode a
// number that drifts from the real Stripe trial length.
export type CheckoutConfig = {
  trial_period_days: number;
};

// Resolves the trial length in days, or null on ANY failure (network error,
// non-200 status, or a malformed/missing field). Never throws — callers
// render a number-free fallback disclosure instead of breaking the funnel.
export async function getCheckoutTrialDays(): Promise<number | null> {
  try {
    const data = await manageFetch<CheckoutConfig>("/public/checkout-config");
    return typeof data.trial_period_days === "number" &&
      Number.isFinite(data.trial_period_days)
      ? data.trial_period_days
      : null;
  } catch {
    return null;
  }
}

// Onboarding intake — collected by the /cadastro wizard (Feature 0) so brain-api
// can seed a sensible initial onboarding_state/blocker_reason for the tenant
// (services/onboarding.py::provision_tenant_from_intent, contract §8). Optional
// end-to-end: omitting it keeps the old behavior (state starts at `aquecimento`,
// blocker null).
export type SignupIntakeWhatsappUsage =
  | "business_7d_plus"
  | "business_recent"
  | "none";
export type SignupIntakePriorApi = "yes" | "no" | "unknown";
export type SignupIntakeFbPage = "yes_admin" | "yes_unknown_admin" | "no";

export type SignupIntake = {
  whatsapp_usage: SignupIntakeWhatsappUsage;
  prior_api: SignupIntakePriorApi;
  fb_page: SignupIntakeFbPage;
};

export type SignupRegisterPayload = {
  name: string;
  clinic_name: string;
  email: string;
  whatsapp_phone: string;
  // The password the visitor chooses on the FIRST card. Same policy the backend
  // enforces (>= 8 chars, at least one letter and one digit — schemas/signup.py).
  password: string;
  catalog_ids: string[];
  // Honeypot: always sent empty by real visitors (the field is visually
  // hidden in the form). A filled value marks the submission as spam server-side.
  website?: string;
};

export type SignupRegisterResult = {
  intentId: string;
  // A REAL session (access + refresh), built exactly like login() builds one — the
  // visitor is registered and logged in the moment the first card is submitted.
  session: Session;
};

// POST /public/signup-intents — REGISTERS the lead at the first card: brain-api creates
// the tenant + owner user (with this password) + inert entitlement + linked intent, and
// returns a real session. The caller calls saveSession(session) immediately and drives
// checkout with intentId. Throws ManageApiError: 409 `email_already_registered` (route
// the visitor to /login instead) or 422 (weak password / bad catalog_ids selection).
export async function registerSignup(
  payload: SignupRegisterPayload,
): Promise<SignupRegisterResult> {
  const data = await manageFetch<{ intent_id: string; session: TokenResponse }>(
    "/public/signup-intents",
    { method: "POST", body: JSON.stringify(payload) },
  );
  const claims = decodeJwtPayload(data.session.access_token);
  const tenantId =
    typeof claims?.tenant_id === "string" ? (claims.tenant_id as string) : "";
  const role = typeof claims?.role === "string" ? (claims.role as string) : "";
  return {
    intentId: data.intent_id,
    session: {
      token: data.session.access_token,
      tenantId,
      // The access token carries no email claim; use the one just submitted.
      email: payload.email,
      role,
      refreshToken: data.session.refresh_token,
      professionalId: readProfessionalIdClaim(claims),
    },
  };
}

// POST /doctor/onboarding/intake — authenticated (the visitor is logged in from
// registration onward, so the intake rides the session already in hand rather than a
// second public endpoint). Attaches the wizard's eligibility answers to the pending
// signup intent so the Stripe webhook can seed the tenant's initial onboarding state.
// Best-effort server-side (always 204) — callers treat a failure as non-fatal.
export async function attachSignupIntake(
  session: Session,
  intake: SignupIntake,
): Promise<void> {
  await manageFetch<void>(
    "/doctor/onboarding/intake",
    { method: "POST", body: JSON.stringify(intake) },
    session.token,
  );
}

export type PublicCheckoutSessionResult = { checkout_url: string };

// POST /public/checkout-sessions — mints the Stripe Checkout URL for a pending
// signup intent. Throws ManageApiError: 503 `price_not_configured:<id>` (no
// Stripe price configured for the selected catalog id), 502 (Stripe error), or
// 409 (the intent is no longer pending).
export async function createPublicCheckoutSession(
  intentId: string,
): Promise<PublicCheckoutSessionResult> {
  return manageFetch<PublicCheckoutSessionResult>("/public/checkout-sessions", {
    method: "POST",
    body: JSON.stringify({ intent_id: intentId }),
  });
}

export type OnboardingStatus = {
  status: "pending" | "ready" | "failed";
  products: { secretaria: boolean; precheck: boolean } | null;
  // Rotates on EVERY poll — callers must always act on the token from the
  // latest response, never one cached from an earlier poll. Comes back null
  // once it has already been exchanged (single use) or before the tenant is
  // ready.
  onboarding_token: string | null;
};

// GET /public/onboarding-status?session_id=<stripe checkout session id> —
// polled by /checkout/sucesso while the Stripe webhook provisions the tenant
// asynchronously. Never assume "ready" on the first call.
export async function getOnboardingStatus(
  sessionId: string,
): Promise<OnboardingStatus> {
  return manageFetch<OnboardingStatus>(
    `/public/onboarding-status?session_id=${encodeURIComponent(sessionId)}`,
  );
}

// POST /auth/exchange-onboarding-token — trades the one-time onboarding token
// (from the LATEST getOnboardingStatus poll) for a real session, built the
// same way login() builds one (decoded JWT claims + refresh token). Does NOT
// call saveSession() — the caller decides when to persist it, after its own
// routing decision. Throws ManageApiError 401 `invalid_onboarding_token`.
export async function exchangeOnboardingToken(token: string): Promise<Session> {
  const data = await manageFetch<TokenResponse>(
    "/auth/exchange-onboarding-token",
    {
      method: "POST",
      body: JSON.stringify({ token }),
    },
  );
  const claims = decodeJwtPayload(data.access_token);
  const tenantId =
    typeof claims?.tenant_id === "string" ? (claims.tenant_id as string) : "";
  const role = typeof claims?.role === "string" ? (claims.role as string) : "";
  const email =
    typeof claims?.email === "string" ? (claims.email as string) : "";
  return {
    token: data.access_token,
    tenantId,
    email,
    role,
    refreshToken: data.refresh_token,
    professionalId: readProfessionalIdClaim(claims),
  };
}

// POST /auth/exchange-invite-token — trades a professional-invite token (from
// the `{FRONTEND_BASE_URL}/convite?token=...` link emailed by
// POST /doctor/professionals/invites) for a real session, built the same way
// exchangeOnboardingToken builds one. The invitee has no password yet — the
// caller is expected to follow up with setPassword() before treating the
// session as durable. Does NOT call saveSession(); the caller decides when.
// Throws ManageApiError 401 for an invalid/expired/already-used token.
export async function exchangeInviteToken(token: string): Promise<Session> {
  const data = await manageFetch<TokenResponse>("/auth/exchange-invite-token", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  const claims = decodeJwtPayload(data.access_token);
  const tenantId =
    typeof claims?.tenant_id === "string" ? (claims.tenant_id as string) : "";
  const role = typeof claims?.role === "string" ? (claims.role as string) : "";
  const email =
    typeof claims?.email === "string" ? (claims.email as string) : "";
  return {
    token: data.access_token,
    tenantId,
    email,
    role,
    refreshToken: data.refresh_token,
    professionalId: readProfessionalIdClaim(claims),
  };
}

// POST /auth/set-password — sets the real password for a session minted via
// exchangeInviteToken (or any other one-time-token exchange). Bearer-authenticated
// with the session just obtained from the exchange, so the invitee never has to
// log in with a temporary password. Used by the /convite accept flow (Feature D).
export async function setPassword(
  session: Session,
  password: string,
): Promise<void> {
  await manageFetch<void>(
    "/auth/set-password",
    // Backend expects `new_password` (schemas/auth.py SetPasswordIn, extra="forbid").
    { method: "POST", body: JSON.stringify({ new_password: password }) },
    session.token,
  );
}

// ---------------------------------------------------------------------------
// Billing — Stripe checkout + portal (CONTRACTS §13)
//
// IDS ONLY, never prices/features: the brain-api catalog (services/catalog.py,
// CONTRACTS §3.2) is the single commercial source of truth and validates every
// selection server-side (422 on anything unknown/unassignable). These unions just
// give call sites type safety over the same ids.
// ---------------------------------------------------------------------------

// Assignable catalog plan ids (§3.2; secretaria_bronze_2 is a reserved slot and
// "free" is not purchasable — both rejected by the backend with 422).
export type CatalogPlanId =
  | "precheck"
  | "secretaria_ferro"
  | "secretaria_bronze_1"
  | "complete_clinic_combo";

// The formalized add-on keyset (§3.2).
export type CatalogAddonId =
  | "reactivation_pack"
  | "verified_identity"
  | "multi_professional"
  | "multi_unit"
  | "ehr"
  | "pix_whatsapp"
  | "analytics_bi"
  | "human_backup_24_7";

// True when the given catalog ids include a plan that enables the secretarIA
// product — i.e. one that requires WhatsApp Coexistence approval on the
// clinic's number before Stripe billing can start. Mirrors brain-api's
// catalog semantics (services/catalog.py): every "secretaria*" plan id and
// the combo enable secretarIA; a PreCheck-only purchase does not.
// brain-api's trial-cancellation-on-no-approval behavior is scoped the same
// way, so the pre-checkout disclosure (CheckoutTrialNotice) uses this to
// decide whether it applies to a given purchase at all.
export function catalogRequiresWhatsappCoexistence(catalogIds: string[]): boolean {
  return catalogIds.some(
    (id) => id === "complete_clinic_combo" || id.startsWith("secretaria"),
  );
}

// MANAGE-API CALL SITE #6 — Stripe Checkout. POST /billing/checkout (tenant JWT)
// with { plan, addons? } (catalog ids only). Returns the Stripe-hosted Checkout URL
// for a full-page redirect. Throws ManageApiError: 422 unknown/unassignable plan or
// addon, 503 `billing_not_configured` / `price_not_configured:<id>`, 502 Stripe
// failure. Plan-implied addons are silently dropped server-side (a combo already
// charges for them) — sending them is not an error.
export async function createCheckoutSession(
  session: Session,
  plan: CatalogPlanId | string,
  addons?: (CatalogAddonId | string)[],
): Promise<string> {
  const data = await manageFetch<{ url: string }>(
    "/billing/checkout",
    {
      method: "POST",
      body: JSON.stringify({ plan, ...(addons?.length ? { addons } : {}) }),
    },
    session.token,
  );
  return data.url;
}

// MANAGE-API CALL SITE #7 — Stripe Billing Portal. POST /billing/portal (tenant
// JWT). Returns the portal URL for a full-page redirect. Throws ManageApiError:
// 409 `no_billing_account` (tenant never checked out — route them to checkout
// instead), 503/502 as above.
export async function createPortalSession(session: Session): Promise<string> {
  const data = await manageFetch<{ url: string }>(
    "/billing/portal",
    { method: "POST" },
    session.token,
  );
  return data.url;
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

// Result of the secretarIA hub handoff: a purpose-scoped hub token + lifetime (s).
export type SecretariaHubToken = { hubToken: string; expiresIn: number };

// MANAGE-API CALL SITE #8 — secretarIA doctor-hub handoff. POST
// /doctor/secretaria/hub-token (Bearer brain JWT). Same shape as the PreCheck SSO
// handoff (#3): brain-api verifies the tenant's secretarIA entitlement LIVE and
// mints a short-lived purpose-scoped token (scope="secretaria_hub", CONTRACTS
// §12.2) that secretarIA's hub introspects back against brain-api. It is NOT a
// user JWT and NOT refreshable via /auth/refresh — on expiry, mint again (see
// lib/secretaria-hub.ts). Throws ManageApiError 403 `secretaria_not_entitled`.
export async function getSecretariaHubToken(
  session: Session,
): Promise<SecretariaHubToken> {
  const data = await manageFetch<{
    hub_token: string;
    token_type: string;
    expires_in: number;
  }>("/doctor/secretaria/hub-token", { method: "POST" }, session.token);
  return { hubToken: data.hub_token, expiresIn: data.expires_in };
}

// ---------------------------------------------------------------------------
// Admin "Modo médico" — act as a clinic's doctor (CONTRACTS §11.4)
// ---------------------------------------------------------------------------

// What the doctor portal reads to render its "you are impersonating" banner.
export type ImpersonationMarker = { clinicName: string; adminEmail: string };

type ImpersonationTokenResponse = {
  access_token: string;
  token_type: string;
  tenant_id: string;
  clinic_name: string;
  email: string;
  role: string;
  expires_in: number;
};

// MANAGE-API CALL SITE #4 — admin "Modo médico". POST /admin/impersonate/token (Bearer
// admin JWT). brain-api mints a tenant-scoped DOCTOR token for the configured demo clinic;
// the returned token is shape-identical to that doctor's own login, so the doctor portal +
// PreCheck SSO accept it unchanged. Admin-only (403 otherwise); 404
// (`impersonation_target_unavailable`) when the demo clinic is not seeded/configured.
async function fetchImpersonationDoctor(
  adminSession: Session,
): Promise<{ session: Session; clinicName: string }> {
  const data = await manageFetch<ImpersonationTokenResponse>(
    "/admin/impersonate/token",
    { method: "POST" },
    adminSession.token,
  );
  const session: Session = {
    token: data.access_token,
    tenantId: data.tenant_id,
    email: data.email,
    role: data.role,
  };
  return { session, clinicName: data.clinic_name };
}

// Enter "Modo médico": mint the doctor session, STASH the admin session first (so a failure
// before this point leaves the admin intact), swap the doctor session into `brain.session`,
// and record the banner marker. The caller routes to /doctor/dashboard on success. Throws
// ManageApiError (401 admin session expired, 403 not admin, 404 demo clinic unavailable) for
// the caller to surface inline.
export async function enterDoctorMode(adminSession: Session): Promise<void> {
  const { session, clinicName } = await fetchImpersonationDoctor(adminSession);
  if (typeof window === "undefined") return;
  sessionStorage.setItem(ADMIN_STASH_KEY, JSON.stringify(adminSession));
  saveSession(session);
  const marker: ImpersonationMarker = {
    clinicName,
    adminEmail: adminSession.email,
  };
  sessionStorage.setItem(IMPERSONATION_KEY, JSON.stringify(marker));
}

// The active impersonation, or null. Read AFTER mount (sessionStorage is client-only).
export function getImpersonation(): ImpersonationMarker | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(IMPERSONATION_KEY);
    return raw ? (JSON.parse(raw) as ImpersonationMarker) : null;
  } catch {
    return null;
  }
}

// Leave "Modo médico": restore the stashed admin session and clear the doctor session +
// marker. Returns true if an admin session was restored (caller routes to /admin/dashboard);
// false if there was nothing to restore (caller falls back to /login).
export function exitDoctorMode(): boolean {
  if (typeof window === "undefined") return false;
  const raw = sessionStorage.getItem(ADMIN_STASH_KEY);
  sessionStorage.removeItem(IMPERSONATION_KEY);
  sessionStorage.removeItem(ADMIN_STASH_KEY);
  if (!raw) {
    clearSession();
    return false;
  }
  try {
    saveSession(JSON.parse(raw) as Session);
    return true;
  } catch {
    clearSession();
    return false;
  }
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

// Result of DELETE /admin/tenants/{id}: brain-owned rows removed per table, plus the
// cross-DB secretaria leg status (deleted | absent | kept_has_data |
// skipped_unconfigured | failed). A non-"deleted" secretaria status never means the
// brain deletion failed — that already committed. See brain-api schemas/admin.py.
export type AdminTenantDeleteResult = {
  tenant_id: string;
  deleted: Record<string, number>;
  secretaria: { status: string };
};

// DELETE /admin/tenants/{id} — IRREVERSIBLE. Deletes the clinic and everything brain-api
// owns for it (users, entitlements, usage, PreCheck links, signup records, refresh
// tokens; LGPD audit rows survive), then best-effort deletes its row in secretaria's DB.
// Throws ManageApiError 404 if the tenant no longer exists.
export function adminDeleteTenant(
  session: Session,
  tenantId: string,
): Promise<AdminTenantDeleteResult> {
  return manageFetch<AdminTenantDeleteResult>(
    `/admin/tenants/${tenantId}`,
    { method: "DELETE" },
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

// ---------------------------------------------------------------------------
// Doctor onboarding API (role=tenant_owner|tenant_staff) — Onboarding &
// Multi-Professional contract §7. Drives the /app/onboarding eligibility
// screen (Feature 2) and the compact banner on /secretaria/configuracao.
// ---------------------------------------------------------------------------

export type OnboardingState =
  | "pending"
  | "aquecimento"
  | "aguardando_elegibilidade"
  | "aguardando_acao_manual"
  | "conectado"
  | "ativo";

export type OnboardingBlockerReason =
  | "atividade_insuficiente"
  | "numero_em_outro_bsp"
  | "sem_acesso_admin_waba"
  | "sem_pagina_facebook"
  | "outro";

export type OnboardingConfigStatus =
  | "incompleta"
  | "configurado_aguardando_numero"
  | "completa";

export type OnboardingLastAttempt = {
  attempt_id: string;
  result: "pass" | "fail";
  blocker_reason: OnboardingBlockerReason | null;
  error_code: string | null;
  created_at: string;
};

export type EmbeddedSignupConfig = {
  configured: boolean;
  app_id: string | null;
  config_id: string | null;
};

export type DoctorOnboarding = {
  onboarding_state: OnboardingState;
  blocker_reason: OnboardingBlockerReason | null;
  config_status: OnboardingConfigStatus;
  connected: boolean;
  mode_resolved: boolean;
  secretaria_provisioned: boolean;
  next_retry_at: string | null;
  retry_paused: boolean;
  config_reminder_paused: boolean;
  last_attempt: OnboardingLastAttempt | null;
  embedded_signup: EmbeddedSignupConfig;
};

// GET /doctor/onboarding — current onboarding state + Embedded Signup config.
// Side effects on the backend are fail-soft (lazy provisioning retry, config
// pull, ativo-transition check) — this call is safe to poll/refetch freely.
export function getDoctorOnboarding(session: Session): Promise<DoctorOnboarding> {
  return manageFetch<DoctorOnboarding>("/doctor/onboarding", {}, session.token);
}

export type OnboardingAttemptPayload = {
  attempt_id: string; // client-generated via crypto.randomUUID() — idempotency key
  result: "pass" | "fail";
  code?: string | null;
  phone_number_id?: string | null;
  waba_id?: string | null;
  error_code?: string | null;
};

export type OnboardingAttemptResult = {
  attempt_id: string;
  replayed: boolean;
  onboarding_state: OnboardingState;
  blocker_reason: OnboardingBlockerReason | null;
};

// POST /doctor/onboarding/attempts — reports the outcome of one "Tentar ativar
// agora" Embedded Signup round-trip (Meta JS SDK FB.login response). Idempotent
// on attempt_id: a replayed attempt_id returns the same result without a second
// state transition, so a flaky network retry can never double-apply.
export function postOnboardingAttempt(
  session: Session,
  payload: OnboardingAttemptPayload,
): Promise<OnboardingAttemptResult> {
  return manageFetch<OnboardingAttemptResult>(
    "/doctor/onboarding/attempts",
    { method: "POST", body: JSON.stringify(payload) },
    session.token,
  );
}

// POST /doctor/onboarding/resolve-blocker — the "Já resolvi" button for manual-
// action blockers (numero_em_outro_bsp / sem_acesso_admin_waba /
// sem_pagina_facebook / outro). Re-enters `aquecimento` and clears blocker_reason.
export function resolveOnboardingBlocker(
  session: Session,
): Promise<Pick<DoctorOnboarding, "onboarding_state" | "blocker_reason">> {
  return manageFetch<Pick<DoctorOnboarding, "onboarding_state" | "blocker_reason">>(
    "/doctor/onboarding/resolve-blocker",
    { method: "POST" },
    session.token,
  );
}

export type OnboardingPausePayload = {
  retries?: boolean | null;
  config_reminders?: boolean | null;
};

// POST /doctor/onboarding/pause — owner-only kill switches for the retry-nudge
// and config-reminder email crons (`true` = paused). Omitted fields are left
// unchanged server-side. Callers should refetch getDoctorOnboarding() after
// this to pick up the authoritative retry_paused/config_reminder_paused state.
export function pauseOnboarding(
  session: Session,
  payload: OnboardingPausePayload,
): Promise<unknown> {
  return manageFetch<unknown>(
    "/doctor/onboarding/pause",
    { method: "POST", body: JSON.stringify(payload) },
    session.token,
  );
}

// ---------------------------------------------------------------------------
// Doctor professionals API (role=tenant_owner|tenant_staff) — Onboarding &
// Multi-Professional contract §7. Backs the "Profissionais" section on
// /secretaria/configuracao (Feature C3).
// ---------------------------------------------------------------------------

// One professional as seen from brain-api's proxy of secretaria's config-status
// (contract §4.3) plus its own user linkage (email/invite state).
export type DoctorProfessional = {
  id: string;
  name: string;
  is_active: boolean;
  has_calendar: boolean;
  has_hours: boolean;
  has_services: boolean;
  complete: boolean;
  linked_user_email: string | null;
  invite_pending: boolean;
};

export function getDoctorProfessionals(
  session: Session,
): Promise<DoctorProfessional[]> {
  return manageFetch<DoctorProfessional[]>("/doctor/professionals", {}, session.token);
}

export type ProfessionalInvitePayload = {
  name: string;
  email: string;
  specialty?: string | null;
};

export type ProfessionalInviteResult = {
  // Copyable link the owner shares with the invitee: {FRONTEND_BASE_URL}/convite?token=...
  invite_link: string;
};

// POST /doctor/professionals/invites — owner-only. Creates the secretaria
// professional row, a tenant_staff User bound to it, and emails
// `professional_invite` (fail-soft) with the same link this returns. Throws
// ManageApiError 409 `email_already_registered`.
export function createProfessionalInvite(
  session: Session,
  payload: ProfessionalInvitePayload,
): Promise<ProfessionalInviteResult> {
  return manageFetch<ProfessionalInviteResult>(
    "/doctor/professionals/invites",
    { method: "POST", body: JSON.stringify(payload) },
    session.token,
  );
}

export type SelfProfessionalPayload = {
  name?: string | null;
  specialty?: string | null;
};

export type SelfProfessionalResult = {
  professional_id: string;
};

// POST /doctor/professionals/self — owner-only. Answers "Você também atende
// pacientes, ou só administra a clínica?" by creating/attaching a professional
// named after the owner (or the clinic) and binding it to the OWNER's own user
// row. The caller should re-fetch the session's /auth/me (or re-login) to pick
// up the new professional_id claim — this endpoint does not mint a new token.
export function createSelfProfessional(
  session: Session,
  payload: SelfProfessionalPayload,
): Promise<SelfProfessionalResult> {
  return manageFetch<SelfProfessionalResult>(
    "/doctor/professionals/self",
    { method: "POST", body: JSON.stringify(payload) },
    session.token,
  );
}
