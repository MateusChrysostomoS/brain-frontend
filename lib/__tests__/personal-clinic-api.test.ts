import { afterEach, expect, it, vi } from "vitest";

afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it("logs into a zero-membership account and sends only its account proof to creation", async () => {
  const requests: { url: string; init: RequestInit }[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    requests.push({ url, init });
    if (url.endsWith("/auth/account/login")) return new Response(JSON.stringify({
      session_kind: "account", account_token: "personal-proof", email: "person@example.com", name: "Person", memberships: [],
    }));
    return new Response(JSON.stringify({ intent_id: "intent-C", operation_id: "op-C", status: "pending_payment", session: { access_token: "not-a-jwt" } }));
  }));
  const api = await import("../manage-api");
  await api.loginPersonalAccount("person@example.com", "Password123");
  const result = await api.createPersonalClinic({ operation_id: "op-C", clinic_name: "Clinic C", whatsapp_phone: "000", catalog_ids: ["precheck_basic"] });
  expect(result.intent_id).toBe("intent-C");
  expect(new Headers(requests[1].init.headers).get("Authorization")).toBe("Bearer personal-proof");
  expect(JSON.parse(String(requests[1].init.body))).toEqual({ operation_id: "op-C", clinic_name: "Clinic C", whatsapp_phone: "000", catalog_ids: ["precheck_basic"] });
});

it("does not replace personal reauthentication with a clinical or reset token", async () => {
  vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify({ detail: "Invalid or expired token" }), { status: 401 })));
  const api = await import("../manage-api");
  await expect(api.createPersonalClinic({ operation_id: "op-C", clinic_name: "C", whatsapp_phone: "000", catalog_ids: ["precheck_basic"] })).rejects.toThrow();
});

it("selects only the explicitly requested membership when continuing to its billing", async () => {
  const selected: unknown[] = [];
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (url.endsWith("/auth/account/login")) return new Response(JSON.stringify({ account_token: "proof", email: "person@example.com", name: "Person" }));
    selected.push(JSON.parse(String(init.body)));
    const claims = btoa(JSON.stringify({ sub: "owner-C", tenant_id: "clinic-C", role: "doctor", account_sid: "sid" }));
    return new Response(JSON.stringify({ access_token: `h.${claims}.s`, user_id: "owner-C" }));
  }));
  const api = await import("../manage-api");
  await api.loginPersonalAccount("person@example.com", "Password123");
  const session = await api.selectPersonalClinic("owner-C");
  expect(session.tenantId).toBe("clinic-C");
  expect(session.accountUserId).toBe("owner-C");
  expect(selected).toEqual([{ user_id: "owner-C" }]);
});

it("a late legacy refresh cannot replace a newly authenticated personal account", async () => {
  let finish!: (response: Response) => void;
  const old = new Promise<Response>(resolve => { finish = resolve; });
  vi.stubGlobal("window", {});
  vi.stubGlobal("fetch", vi.fn(async (url: string) => url.endsWith("/auth/refresh") ? old : new Response(JSON.stringify({ account_token: "new-personal-proof", email: "new@example.com", name: "New" }))));
  const api = await import("../manage-api");
  const boot = api.ensureSession();
  await api.loginPersonalAccount("new@example.com", "Password123");
  finish(new Response(JSON.stringify({ access_token: `h.${btoa(JSON.stringify({ sub: "old-user", tenant_id: "old-A", role: "doctor" }))}.s` })));
  await boot;
  expect(api.getSession()).toBeNull();
  expect((await api.ensurePersonalAccount())?.email).toBe("new@example.com");
});

it("billing boot reauthenticates its explicit C destination before the parent guard", async () => {
  const id = "10000000-0000-4000-8000-000000000062";
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.endsWith("/auth/account/resume")) return new Response(JSON.stringify({ account_token: "proof-C", email: "person@example.com", name: "Person" }));
    if (!url.endsWith("/auth/account/select")) throw new Error("must never refresh the legacy cookie for this billing destination");
    return new Response(JSON.stringify({ access_token: `h.${btoa(JSON.stringify({ sub: id, tenant_id: "clinic-C", role: "doctor", account_sid: "sid" }))}.s` }));
  }));
  const { ensurePortalClinic } = await import("../clinic-session");
  const session = await ensurePortalClinic("/app/billing/", `?vinculo=${id}`);
  expect(session?.tenantId).toBe("clinic-C");
});

it("a creation body finishing after a different account login cannot adopt old C", async () => {
  let body!: ReadableStreamDefaultController<Uint8Array>;
  const delayed = new Response(new ReadableStream<Uint8Array>({ start(controller) { body = controller; } }));
  vi.stubGlobal("fetch", vi.fn(async (url: string, init: RequestInit) => {
    if (url.endsWith("/auth/account/login")) {
      const { email } = JSON.parse(String(init.body));
      return new Response(JSON.stringify({ account_token: `proof-${email}`, email, name: "Person" }));
    }
    return delayed;
  }));
  const api = await import("../manage-api");
  await api.loginPersonalAccount("old@example.com", "Password123");
  const pending = api.createPersonalClinic({ operation_id: "old-operation", clinic_name: "Old C", whatsapp_phone: "000", catalog_ids: ["precheck_basic"] });
  const result = expect(pending).rejects.toThrow("session_changed");
  await vi.waitFor(() => expect(delayed.bodyUsed).toBe(true));
  await api.loginPersonalAccount("new@example.com", "Password123");
  body.enqueue(new TextEncoder().encode(JSON.stringify({ session: { access_token: `h.${btoa(JSON.stringify({ sub: "old-owner", tenant_id: "old-C", account_sid: "old-sid" }))}.s` } })));
  body.close();
  await result;
  expect(api.getSession()).toBeNull();
  expect((await api.ensurePersonalAccount())?.email).toBe("new@example.com");
});

it("a late legacy login cannot overwrite a newer personal login", async () => {
  let finish!: (response: Response) => void;
  const old = new Promise<Response>(resolve => { finish = resolve; });
  vi.stubGlobal("fetch", vi.fn(async (url: string) => url.endsWith("/auth/token") ? old : new Response(JSON.stringify({ account_token: "new-proof", email: "new@example.com", name: "New" }))));
  const api = await import("../manage-api");
  const pending = api.login("old@example.com", "Password123");
  const result = expect(pending).rejects.toThrow("session_changed");
  await api.loginPersonalAccount("new@example.com", "Password123");
  finish(new Response(JSON.stringify({ access_token: "old-clinical-token" })));
  await result;
  expect(api.getSession()).toBeNull();
  expect((await api.ensurePersonalAccount())?.email).toBe("new@example.com");
});

it("a cookie changed to another account cannot silently retry creation as that person", async () => {
  let writes = 0;
  vi.stubGlobal("fetch", vi.fn(async (url: string) => {
    if (url.endsWith("/auth/account/login")) return new Response(JSON.stringify({ account_token: "proof-old", email: "old@example.com", name: "Old" }));
    if (url.endsWith("/auth/account/resume")) return new Response(JSON.stringify({ account_token: "proof-new", email: "new@example.com", name: "New" }));
    writes += 1;
    return writes === 1 ? new Response("{}", { status: 401 }) : new Response(JSON.stringify({ session: { access_token: "wrong-new-clinic" } }));
  }));
  const api = await import("../manage-api");
  await api.loginPersonalAccount("old@example.com", "Password123");
  await expect(api.createPersonalClinic({ operation_id: "old-op", clinic_name: "Old C", whatsapp_phone: "000", catalog_ids: ["precheck_basic"] })).rejects.toThrow("session_changed");
  expect(writes).toBe(1);
  expect(api.getSession()).toBeNull();
});
