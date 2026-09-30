import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Session } from "../manage-api";

// Same harness idea as manage-api.test.ts: manage-api.ts touches `window`/sessionStorage, so a
// fake is installed BEFORE a fresh import of the module.
type ManageApiModule = typeof import("../manage-api");

let api: ManageApiModule;
let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(async () => {
  vi.resetModules();
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
    key: (i: number) => Array.from(store.keys())[i] ?? null,
    get length() {
      return store.size;
    },
  };
  (globalThis as any).sessionStorage = storage;
  (globalThis as any).window = { sessionStorage: storage, location: { assign: vi.fn() } };
  fetchMock = vi.fn();
  (globalThis as any).fetch = fetchMock;
  api = await import("../manage-api");
});

function ok(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: "",
    json: async () => body,
  } as unknown as Response;
}

const session = { token: "tok", tenantId: "t1", email: "a@b.c", role: "manager" } as Session;

describe("addProductToSubscription", () => {
  it("forwards return_to in the body and reads return_query from the answer", async () => {
    fetchMock.mockResolvedValueOnce(
      ok(200, { status: "added", product: "secretaria", charge: null, entitlement: null, return_query: "origem=console" }),
    );
    const res = await api.addProductToSubscription(
      session,
      { product: "secretaria", confirm: true, return_to: "console" },
      "11111111-1111-4111-8111-111111111111",
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ return_to: "console" });
    expect(res.return_query).toBe("origem=console");
  });
  it("previews with a plain POST and no Idempotency-Key", async () => {
    fetchMock.mockResolvedValueOnce(ok(200, { status: "preview", product: "secretaria", charge: null, entitlement: null }));

    const res = await api.addProductToSubscription(session, { product: "secretaria", confirm: false });

    expect(res.status).toBe("preview");
    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url).endsWith("/billing/add-product")).toBe(true);
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ product: "secretaria", confirm: false });
    expect(init.headers.Authorization).toBe("Bearer tok");
    expect(init.headers["Idempotency-Key"]).toBeUndefined();
  });

  it("confirms with the Idempotency-Key header and the PreCheck tier", async () => {
    fetchMock.mockResolvedValueOnce(ok(200, { status: "added", product: "precheck", charge: null, entitlement: null }));

    await api.addProductToSubscription(
      session,
      { product: "precheck", plan: "precheck_basic", confirm: true },
      "3d0f5f1e-0000-4000-8000-000000000001",
    );

    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toEqual({ product: "precheck", plan: "precheck_basic", confirm: true });
    expect(init.headers["Idempotency-Key"]).toBe("3d0f5f1e-0000-4000-8000-000000000001");
  });

  it("surfaces the backend's stable detail code with its HTTP status", async () => {
    fetchMock.mockResolvedValueOnce(ok(409, { detail: "subscription_past_due" }));
    await expect(api.addProductToSubscription(session, { product: "secretaria", confirm: false })).rejects.toMatchObject({
      name: "ManageApiError",
      status: 409,
      message: "subscription_past_due",
    });
  });
});

describe("getEntitlements", () => {
  it("maps precheck_plan (dual clinic) and defaults it to null", async () => {
    const base = {
      tenant_id: "t1",
      clinic_name: "Clinic",
      products: { precheck: true, secretaria: true },
      plan: "secretaria_basico",
      secretaria_tier: "basico",
      status: "active",
      addons: {},
      limits: {},
      usage: {},
    };
    fetchMock.mockResolvedValueOnce(ok(200, { ...base, precheck_plan: "precheck_basic" }));
    expect((await api.getEntitlements(session)).precheckPlan).toBe("precheck_basic");
    fetchMock.mockResolvedValueOnce(ok(200, base));
    expect((await api.getEntitlements(session)).precheckPlan).toBeNull();
  });
});
