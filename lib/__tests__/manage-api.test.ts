import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../manage-api";

// ---------------------------------------------------------------------------
// Test harness: manage-api.ts guards session-persistence paths on
// `typeof window === "undefined"`, so every test needs a fake `window` +
// `sessionStorage` installed BEFORE the module is imported. The module also
// keeps a module-level single-flight variable (`refreshInFlight`), so each
// test gets a fresh module instance via vi.resetModules() + dynamic import.
// ---------------------------------------------------------------------------

type ManageApiModule = typeof import("../manage-api");

let api: ManageApiModule;
let fetchMock: ReturnType<typeof vi.fn>;

function makeSessionStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
}

beforeEach(async () => {
  vi.resetModules();

  const sessionStorageMock = makeSessionStorage();
  (globalThis as any).sessionStorage = sessionStorageMock;
  (globalThis as any).window = {
    sessionStorage: sessionStorageMock,
    location: { assign: vi.fn() },
  };
  (globalThis as any).atob = (b64: string) =>
    Buffer.from(b64, "base64").toString("binary");

  fetchMock = vi.fn();
  (globalThis as any).fetch = fetchMock;

  api = await import("../manage-api");
});

// --- helpers ---------------------------------------------------------------

function mockResponse(status: number, body: unknown, statusText = ""): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText,
    json: async () => body,
  } as unknown as Response;
}

function b64url(raw: string): string {
  return Buffer.from(raw)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function makeJwt(payload: Record<string, unknown>): string {
  const header = b64url(JSON.stringify({ alg: "none", typ: "JWT" }));
  const body = b64url(JSON.stringify(payload));
  return `${header}.${body}.signature`;
}

function makeSession(overrides: Partial<Session> = {}): Session {
  return {
    token: "old",
    tenantId: "t1",
    email: "doc@clinic.com",
    role: "tenant_owner",
    refreshToken: "r1",
    ...overrides,
  };
}

function entitlementBody() {
  return {
    tenant_id: "t1",
    clinic_name: "Clinic",
    products: { precheck: true, secretaria: false },
    plan: "precheck",
    secretaria_tier: null,
    status: "active",
    addons: {},
    limits: {},
    usage: {},
  };
}

async function expectManageError(
  promise: Promise<unknown>,
  status: number,
  message?: string,
) {
  let threw = false;
  try {
    await promise;
  } catch (err) {
    threw = true;
    expect(err).toBeInstanceOf(api.ManageApiError);
    expect((err as InstanceType<ManageApiModule["ManageApiError"]>).status).toBe(
      status,
    );
    if (message !== undefined) {
      expect((err as Error).message).toBe(message);
    }
  }
  expect(threw).toBe(true);
}

// ---------------------------------------------------------------------------
// refresh-and-retry (via getEntitlements — GET /entitlements does NOT start
// with "/auth/", so it is eligible for the transparent-refresh guard; getMe
// is NOT, see "surprises" in the final report)
// ---------------------------------------------------------------------------

describe("manageFetch refresh-and-retry", () => {
  it("1. happy retry: 401 -> refresh 200 -> retried call 200; session updated", async () => {
    const session = makeSession({ token: "old", refreshToken: "r1" });
    api.saveSession(session);

    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { detail: "token_expired" }))
      .mockResolvedValueOnce(
        mockResponse(200, {
          access_token: "new-jwt",
          token_type: "bearer",
          refresh_token: "r2",
          expires_in: 1800,
        }),
      )
      .mockResolvedValueOnce(mockResponse(200, entitlementBody()));

    const result = await api.getEntitlements(session);

    expect(result.plan).toBe("precheck");
    expect(fetchMock).toHaveBeenCalledTimes(3);

    const call1 = fetchMock.mock.calls[0];
    expect(call1[0]).toBe("/entitlements");
    expect(call1[1].headers.Authorization).toBe("Bearer old");

    const call2 = fetchMock.mock.calls[1];
    expect(call2[0]).toBe("/auth/refresh");
    expect(call2[1].method).toBe("POST");
    expect(JSON.parse(call2[1].body)).toEqual({ refresh_token: "r1" });

    const call3 = fetchMock.mock.calls[2];
    expect(call3[0]).toBe("/entitlements");
    expect(call3[1].headers.Authorization).toBe("Bearer new-jwt");

    const stored = JSON.parse(sessionStorage.getItem(api.SESSION_KEY)!);
    expect(stored.token).toBe("new-jwt");
    expect(stored.refreshToken).toBe("r2");
  });

  it("2. refresh rejection: 401 -> refresh 401 -> clears session, redirects to /login", async () => {
    const session = makeSession({ token: "old", refreshToken: "r1" });
    api.saveSession(session);

    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { detail: "token_expired" }))
      .mockResolvedValueOnce(mockResponse(401, { detail: "refresh_token_revoked" }));

    await expectManageError(api.getEntitlements(session), 401);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sessionStorage.getItem(api.SESSION_KEY)).toBeNull();
    expect(sessionStorage.getItem(api.IMPERSONATION_KEY)).toBeNull();
    expect((window as any).location.assign).toHaveBeenCalledWith("/login");
  });

  it("3. retry-once: 401 -> refresh 200 -> retried call 401 again -> rejects, no second refresh", async () => {
    const session = makeSession({ token: "old", refreshToken: "r1" });
    api.saveSession(session);

    fetchMock
      .mockResolvedValueOnce(mockResponse(401, { detail: "token_expired" }))
      .mockResolvedValueOnce(
        mockResponse(200, {
          access_token: "new-jwt",
          token_type: "bearer",
          refresh_token: "r2",
          expires_in: 1800,
        }),
      )
      .mockResolvedValueOnce(mockResponse(401, { detail: "token_expired" }));

    await expectManageError(api.getEntitlements(session), 401);
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("4. no refresh token -> no refresh attempt", async () => {
    const session = makeSession({ token: "old", refreshToken: undefined });
    api.saveSession(session);

    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: "token_expired" }));

    await expectManageError(api.getEntitlements(session), 401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("5. single-flight: two concurrent 401s share one /auth/refresh call", async () => {
    const session = makeSession({ token: "old", refreshToken: "r1" });
    api.saveSession(session);

    let resolveRefresh!: (res: Response) => void;
    const deferredRefresh = new Promise<Response>((resolve) => {
      resolveRefresh = resolve;
    });

    fetchMock.mockImplementation(async (url: string, opts: any) => {
      const auth = opts?.headers?.Authorization;
      if (url === "/entitlements") {
        if (auth === "Bearer old") return mockResponse(401, { detail: "token_expired" });
        if (auth === "Bearer new-jwt") return mockResponse(200, entitlementBody());
        throw new Error("unexpected auth header: " + auth);
      }
      if (url === "/auth/refresh") return deferredRefresh;
      throw new Error("unexpected url: " + url);
    });

    const p1 = api.getEntitlements(session);
    const p2 = api.getEntitlements(session);

    resolveRefresh(
      mockResponse(200, {
        access_token: "new-jwt",
        token_type: "bearer",
        refresh_token: "r2",
        expires_in: 1800,
      }),
    );

    await Promise.all([p1, p2]);

    const refreshCalls = fetchMock.mock.calls.filter(
      (c: any[]) => c[0] === "/auth/refresh",
    );
    expect(refreshCalls).toHaveLength(1);

    const retriedCalls = fetchMock.mock.calls.filter(
      (c: any[]) => c[0] === "/entitlements" && c[1]?.headers?.Authorization === "Bearer new-jwt",
    );
    expect(retriedCalls).toHaveLength(2);
  });

  it("6. token mismatch guard: passed session token != current stored token -> no refresh", async () => {
    const oldSession = makeSession({ token: "old", refreshToken: "r1" });
    api.saveSession(oldSession);
    // A different session was saved afterwards (e.g. another tab/flow refreshed
    // or replaced it) — the stored session's token no longer matches oldSession.
    const newSession = makeSession({ token: "different-token", refreshToken: "r2" });
    api.saveSession(newSession);

    fetchMock.mockResolvedValueOnce(mockResponse(401, { detail: "token_expired" }));

    await expectManageError(api.getEntitlements(oldSession), 401);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// login / logout
// ---------------------------------------------------------------------------

describe("login / logout", () => {
  it("7. login stores refreshToken and decodes tenant_id/role from the JWT", async () => {
    const jwt = makeJwt({ tenant_id: "tenant-1", role: "tenant_owner", sub: "user-1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, {
        access_token: jwt,
        token_type: "bearer",
        refresh_token: "rtok-1",
        expires_in: 1800,
      }),
    );

    const session = await api.login("doc@clinic.com", "hunter2");

    expect(session.token).toBe(jwt);
    expect(session.refreshToken).toBe("rtok-1");
    expect(session.tenantId).toBe("tenant-1");
    expect(session.role).toBe("tenant_owner");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/auth/token");
    expect(JSON.parse(call[1].body)).toEqual({
      email: "doc@clinic.com",
      password: "hunter2",
    });

    const stored = JSON.parse(sessionStorage.getItem(api.SESSION_KEY)!);
    expect(stored.refreshToken).toBe("rtok-1");
  });

  it("8. logout clears session synchronously and best-effort revokes even on network failure", async () => {
    const session = makeSession({ token: "old", refreshToken: "r1" });
    api.saveSession(session);

    fetchMock.mockRejectedValueOnce(new Error("network down"));

    const logoutPromise = api.logout();

    // Session must be cleared IMMEDIATELY — before the network call settles.
    expect(sessionStorage.getItem(api.SESSION_KEY)).toBeNull();

    await expect(logoutPromise).resolves.toBeUndefined();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/auth/logout");
    expect(JSON.parse(call[1].body)).toEqual({ refresh_token: "r1" });
  });
});

// ---------------------------------------------------------------------------
// billing
// ---------------------------------------------------------------------------

describe("billing", () => {
  it("9. createCheckoutSession success resolves to the Stripe url", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, { url: "https://checkout.stripe.com/xyz" }),
    );

    const url = await api.createCheckoutSession(session, "precheck", [
      "reactivation_pack",
    ]);

    expect(url).toBe("https://checkout.stripe.com/xyz");
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/billing/checkout");
    expect(call[1].method).toBe("POST");
    expect(JSON.parse(call[1].body)).toEqual({
      plan: "precheck",
      addons: ["reactivation_pack"],
    });
    expect(call[1].headers.Authorization).toBe("Bearer tok1");
  });

  it("10. checkout 503 billing_not_configured -> ManageApiError 503", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(503, { detail: "billing_not_configured" }),
    );

    await expectManageError(
      api.createCheckoutSession(session, "precheck"),
      503,
      "billing_not_configured",
    );
  });

  it("11. checkout 422 -> ManageApiError 422", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(
        422,
        { detail: [{ loc: ["body", "plan"], msg: "invalid", type: "value_error" }] },
        "Unprocessable Entity",
      ),
    );

    await expectManageError(api.createCheckoutSession(session, "not-a-plan"), 422);
  });

  it("12. createPortalSession 409 no_billing_account -> ManageApiError 409", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(409, { detail: "no_billing_account" }),
    );

    await expectManageError(
      api.createPortalSession(session),
      409,
      "no_billing_account",
    );
  });
});

// ---------------------------------------------------------------------------
// catalogRequiresWhatsappCoexistence — truth table backing the pre-checkout
// disclosure's PreCheck-only exclusion (CheckoutTrialNotice)
// ---------------------------------------------------------------------------

describe("catalogRequiresWhatsappCoexistence", () => {
  it("PreCheck-only catalog -> false (no secretarIA, no Coexistence promise)", () => {
    expect(api.catalogRequiresWhatsappCoexistence(["precheck"])).toBe(false);
  });

  it("any secretaria_* plan id -> true", () => {
    expect(api.catalogRequiresWhatsappCoexistence(["secretaria_basico"])).toBe(true);
    // Prefix-based (id.startsWith("secretaria")), not a fixed-list lookup — proven with
    // a non-real id so this doesn't silently pass only because "basico" is the one real id.
    expect(api.catalogRequiresWhatsappCoexistence(["secretaria_anything"])).toBe(true);
  });

  it("complete_clinic_combo -> true", () => {
    expect(api.catalogRequiresWhatsappCoexistence(["complete_clinic_combo"])).toBe(true);
  });

  it("mixed list matches if ANY id qualifies", () => {
    expect(
      api.catalogRequiresWhatsappCoexistence(["precheck", "secretaria_basico"]),
    ).toBe(true);
  });

  it("empty list or unrelated ids -> false", () => {
    expect(api.catalogRequiresWhatsappCoexistence([])).toBe(false);
    expect(api.catalogRequiresWhatsappCoexistence(["reactivation_pack"])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// secretarIA hub token
// ---------------------------------------------------------------------------

describe("getSecretariaHubToken", () => {
  it("13a. maps { hub_token, expires_in } -> { hubToken, expiresIn }", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, { hub_token: "hub-abc", token_type: "bearer", expires_in: 600 }),
    );

    const result = await api.getSecretariaHubToken(session);
    expect(result).toEqual({ hubToken: "hub-abc", expiresIn: 600 });
  });

  it("13b. 403 secretaria_not_entitled -> ManageApiError 403", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(403, { detail: "secretaria_not_entitled" }),
    );

    await expectManageError(
      api.getSecretariaHubToken(session),
      403,
      "secretaria_not_entitled",
    );
  });
});

// ---------------------------------------------------------------------------
// Self-service cold signup (public, unauthenticated) — CONTRACTS §14
// ---------------------------------------------------------------------------

describe("getCheckoutTrialDays", () => {
  it("18a. 200 with a valid trial_period_days resolves the number, unauthenticated", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { trial_period_days: 75 }));

    const result = await api.getCheckoutTrialDays();

    expect(result).toBe(75);
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/public/checkout-config");
    expect(call[1].headers.Authorization).toBeUndefined();
  });

  it("18b. non-200 response resolves null instead of throwing", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(500, { detail: "server_error" }));

    await expect(api.getCheckoutTrialDays()).resolves.toBeNull();
  });

  it("18c. malformed body (non-numeric trial_period_days) resolves null", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { trial_period_days: "75" }));

    await expect(api.getCheckoutTrialDays()).resolves.toBeNull();
  });

  it("18d. network failure resolves null instead of rejecting", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network down"));

    await expect(api.getCheckoutTrialDays()).resolves.toBeNull();
  });

  it("18e. trial_period_days === 0 resolves 0 (caller renders nothing, not a fetch failure)", async () => {
    fetchMock.mockResolvedValueOnce(mockResponse(200, { trial_period_days: 0 }));

    await expect(api.getCheckoutTrialDays()).resolves.toBe(0);
  });
});

describe("registerSignup", () => {
  it("14a. registers unauthenticated with the password, returns intentId + a decoded session, persists nothing itself", async () => {
    const jwt = makeJwt({ tenant_id: "tenant-1", role: "tenant_owner", sub: "user-1" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(201, {
        intent_id: "intent-1",
        session: {
          access_token: jwt,
          token_type: "bearer",
          refresh_token: "rtok-1",
          expires_in: 1800,
        },
      }),
    );

    const result = await api.registerSignup({
      name: "Dr. Aurélio Lima",
      clinic_name: "Consultório Aurélio",
      email: "aurelio@clinica.com.br",
      whatsapp_phone: "+5511999998888",
      password: "signup123",
      catalog_ids: ["precheck"],
      website: "",
    });

    expect(result.intentId).toBe("intent-1");
    expect(result.session.token).toBe(jwt);
    expect(result.session.refreshToken).toBe("rtok-1");
    expect(result.session.tenantId).toBe("tenant-1");
    expect(result.session.role).toBe("tenant_owner");
    // Email comes from the submitted payload (the access token carries no email claim).
    expect(result.session.email).toBe("aurelio@clinica.com.br");

    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/public/signup-intents");
    expect(call[1].method).toBe("POST");
    expect(call[1].headers.Authorization).toBeUndefined();
    expect(JSON.parse(call[1].body)).toEqual({
      name: "Dr. Aurélio Lima",
      clinic_name: "Consultório Aurélio",
      email: "aurelio@clinica.com.br",
      whatsapp_phone: "+5511999998888",
      password: "signup123",
      catalog_ids: ["precheck"],
      website: "",
    });

    // Unlike login(), registerSignup does NOT persist — the caller (wizard) saves it.
    expect(sessionStorage.getItem(api.SESSION_KEY)).toBeNull();
  });

  it("14b. 409 email_already_registered -> ManageApiError 409", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(409, { detail: "email_already_registered" }),
    );

    await expectManageError(
      api.registerSignup({
        name: "n",
        clinic_name: "c",
        email: "e@x.com",
        whatsapp_phone: "+551199999999",
        password: "signup123",
        catalog_ids: ["precheck"],
      }),
      409,
      "email_already_registered",
    );
  });

  it("14c. 422 weak password / bad catalog -> ManageApiError 422", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(422, { detail: [{ loc: ["body", "password"], msg: "too weak" }] }),
    );

    await expectManageError(
      api.registerSignup({
        name: "n",
        clinic_name: "c",
        email: "e@x.com",
        whatsapp_phone: "+551199999999",
        password: "12345678",
        catalog_ids: ["precheck"],
      }),
      422,
    );
  });
});

describe("attachSignupIntake", () => {
  it("posts the intake authenticated to /doctor/onboarding/intake (204)", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(mockResponse(204, {}));

    await api.attachSignupIntake(session, {
      whatsapp_usage: "business_recent",
      prior_api: "no",
      fb_page: "yes_admin",
    });

    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/doctor/onboarding/intake");
    expect(call[1].method).toBe("POST");
    expect(call[1].headers.Authorization).toBe("Bearer tok1");
    expect(JSON.parse(call[1].body)).toEqual({
      whatsapp_usage: "business_recent",
      prior_api: "no",
      fb_page: "yes_admin",
    });
  });
});

describe("setPassword", () => {
  it("posts { new_password } (the field the backend requires), authenticated", async () => {
    const session = makeSession({ token: "tok1" });
    fetchMock.mockResolvedValueOnce(mockResponse(204, {}));

    await api.setPassword(session, "newpass123");

    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/auth/set-password");
    expect(call[1].method).toBe("POST");
    expect(call[1].headers.Authorization).toBe("Bearer tok1");
    // Regression guard: the backend SetPasswordIn requires `new_password` (extra=forbid),
    // NOT `password`.
    expect(JSON.parse(call[1].body)).toEqual({ new_password: "newpass123" });
  });
});

describe("createPublicCheckoutSession", () => {
  it("15a. posts { intent_id } and resolves the checkout url", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, { checkout_url: "https://checkout.stripe.com/abc" }),
    );

    const result = await api.createPublicCheckoutSession("intent-1");

    expect(result).toEqual({ checkout_url: "https://checkout.stripe.com/abc" });
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/public/checkout-sessions");
    expect(JSON.parse(call[1].body)).toEqual({ intent_id: "intent-1" });
  });

  it("15b. 503 price_not_configured:<id> -> ManageApiError 503", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(503, { detail: "price_not_configured:precheck" }),
    );

    await expectManageError(
      api.createPublicCheckoutSession("intent-1"),
      503,
      "price_not_configured:precheck",
    );
  });
});

describe("getOnboardingStatus", () => {
  it("16a. builds the query string and passes through the (rotating) response", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, {
        status: "ready",
        products: { secretaria: true, precheck: false },
        onboarding_token: "onb-tok-1",
      }),
    );

    const result = await api.getOnboardingStatus("cs_test_123");

    expect(result).toEqual({
      status: "ready",
      products: { secretaria: true, precheck: false },
      onboarding_token: "onb-tok-1",
    });
    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/public/onboarding-status?session_id=cs_test_123");
  });

  it("16b. pending status with null token", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, { status: "pending", products: null, onboarding_token: null }),
    );

    const result = await api.getOnboardingStatus("cs_test_123");
    expect(result.status).toBe("pending");
    expect(result.onboarding_token).toBeNull();
  });
});

describe("exchangeOnboardingToken", () => {
  it("17a. decodes tenant_id/role from the JWT, does NOT call saveSession", async () => {
    const jwt = makeJwt({ tenant_id: "tenant-9", role: "tenant_owner", email: "new@clinic.com" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, {
        access_token: jwt,
        token_type: "bearer",
        refresh_token: "rtok-9",
        expires_in: 1800,
      }),
    );

    const session = await api.exchangeOnboardingToken("onb-tok-1");

    expect(session.token).toBe(jwt);
    expect(session.refreshToken).toBe("rtok-9");
    expect(session.tenantId).toBe("tenant-9");
    expect(session.role).toBe("tenant_owner");
    expect(session.email).toBe("new@clinic.com");

    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/auth/exchange-onboarding-token");
    expect(JSON.parse(call[1].body)).toEqual({ token: "onb-tok-1" });

    // Unlike login(), this must NOT persist the session — the caller decides.
    expect(sessionStorage.getItem(api.SESSION_KEY)).toBeNull();
  });

  it("17b. 401 invalid_onboarding_token -> ManageApiError 401", async () => {
    fetchMock.mockResolvedValueOnce(
      mockResponse(401, { detail: "invalid_onboarding_token" }),
    );

    await expectManageError(
      api.exchangeOnboardingToken("bad-token"),
      401,
      "invalid_onboarding_token",
    );
  });
});

// ---------------------------------------------------------------------------
// admin — tenant cascade delete
// ---------------------------------------------------------------------------

describe("adminDeleteTenant", () => {
  it("18. DELETEs the tenant path with the admin bearer and returns the result", async () => {
    const session = makeSession({ token: "admtok", role: "admin" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(200, {
        tenant_id: "ten-9",
        deleted: { users: 2, entitlements: 1, refresh_tokens: 3 },
        secretaria: { status: "skipped_unconfigured" },
      }),
    );

    const result = await api.adminDeleteTenant(session, "ten-9");

    expect(result.tenant_id).toBe("ten-9");
    expect(result.deleted.users).toBe(2);
    expect(result.secretaria.status).toBe("skipped_unconfigured");

    const call = fetchMock.mock.calls[0];
    expect(call[0]).toBe("/admin/tenants/ten-9");
    expect(call[1].method).toBe("DELETE");
    expect(call[1].headers.Authorization).toBe("Bearer admtok");
  });

  it("18b. 404 unknown tenant -> ManageApiError 404", async () => {
    const session = makeSession({ token: "admtok", role: "admin" });
    fetchMock.mockResolvedValueOnce(
      mockResponse(404, { detail: "Tenant not found" }),
    );

    await expectManageError(
      api.adminDeleteTenant(session, "missing"),
      404,
      "Tenant not found",
    );
  });
});
