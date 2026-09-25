import { describe, expect, it, vi } from "vitest";

import {
  ManageApiError,
  type AdminTenantCreate,
  type AdminTenantCreated,
} from "@/lib/manage-api";

import {
  EMPTY_CREATE_TENANT_FORM,
  buildCreateTenantPayload,
  submitCreateTenant,
  validateCreateTenantForm,
  type CreateTenantForm,
} from "../create-tenant";

const FILLED: CreateTenantForm = {
  clinicName: "  Clínica Teste  ",
  email: " gestor@exemplo.com ",
  name: " Gestor Teste ",
  password: "senha1234",
  precheck: false,
  secretaria: true,
};

function createdFrom(payload: AdminTenantCreate): AdminTenantCreated {
  return {
    tenant_id: "11111111-1111-1111-1111-111111111111",
    clinic_name: payload.clinic_name,
    is_test: true,
    entitlements: {
      tenant_id: "11111111-1111-1111-1111-111111111111",
      precheck_enabled: payload.precheck,
      secretaria_enabled: payload.secretaria,
      plan: "secretaria_basico",
      status: "active",
      addons: {},
      limits: {},
      usage: {},
      period_start: null,
      period_end: null,
      stripe_customer_id: null,
      stripe_subscription_id: null,
      updated_at: null,
    },
    owner: {
      id: "22222222-2222-2222-2222-222222222222",
      tenant_id: "11111111-1111-1111-1111-111111111111",
      clinic_name: payload.clinic_name,
      email: payload.email,
      name: payload.name,
      role: "manager",
      created_at: "2026-09-25T00:00:00Z",
      is_manager: true,
      is_owner: true,
    },
  };
}

describe("validateCreateTenantForm", () => {
  it("requires clinic name, email, name and password", () => {
    expect(validateCreateTenantForm(EMPTY_CREATE_TENANT_FORM)).toMatch(/Preencha/);
    for (const key of ["clinicName", "email", "name", "password"] as const) {
      expect(validateCreateTenantForm({ ...FILLED, [key]: key === "password" ? "" : "   " }))
        .toMatch(/Preencha/);
    }
  });

  it("mirrors the server password rule (8-72, letter + digit)", () => {
    expect(validateCreateTenantForm({ ...FILLED, password: "a1" })).toMatch(/8 e 72/);
    expect(validateCreateTenantForm({ ...FILLED, password: "a1".repeat(37) })).toMatch(/8 e 72/);
    expect(validateCreateTenantForm({ ...FILLED, password: "12345678" })).toMatch(/letra/);
    expect(validateCreateTenantForm({ ...FILLED, password: "abcdefgh" })).toMatch(/letra/);
  });

  it("accepts any product combination, including none", () => {
    for (const precheck of [false, true]) {
      for (const secretaria of [false, true]) {
        expect(validateCreateTenantForm({ ...FILLED, precheck, secretaria })).toBeNull();
      }
    }
  });
});

describe("buildCreateTenantPayload", () => {
  it("sends exactly the six contract fields, trimmed (password untouched)", () => {
    const payload = buildCreateTenantPayload({ ...FILLED, password: " senha1234 " });
    expect(Object.keys(payload).sort()).toEqual(
      ["clinic_name", "email", "name", "password", "precheck", "secretaria"].sort(),
    );
    expect(payload).toEqual({
      clinic_name: "Clínica Teste",
      email: "gestor@exemplo.com",
      name: "Gestor Teste",
      password: " senha1234 ",
      precheck: false,
      secretaria: true,
    });
  });
});

describe("submitCreateTenant", () => {
  it("submits and returns the created tenant on success", async () => {
    const create = vi.fn(async (p: AdminTenantCreate) => createdFrom(p));
    const result = await submitCreateTenant(FILLED, create);
    expect(create).toHaveBeenCalledTimes(1);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.created.tenant_id).toBe("11111111-1111-1111-1111-111111111111");
      expect(result.created.entitlements.secretaria_enabled).toBe(true);
      expect(result.created.entitlements.precheck_enabled).toBe(false);
    }
  });

  it("the product checkboxes drive the payload flags", async () => {
    const combos: Array<[boolean, boolean]> = [
      [false, false],
      [true, false],
      [false, true],
      [true, true],
    ];
    for (const [precheck, secretaria] of combos) {
      const create = vi.fn(async (p: AdminTenantCreate) => createdFrom(p));
      await submitCreateTenant({ ...FILLED, precheck, secretaria }, create);
      expect(create.mock.calls[0][0]).toMatchObject({ precheck, secretaria });
    }
  });

  it("shows the duplicate-email 409 in pt-BR and keeps the cause", async () => {
    const err = new ManageApiError(409, "Email already registered");
    const create = vi.fn(async () => {
      throw err;
    });
    const result = await submitCreateTenant(FILLED, create);
    expect(result).toEqual({ ok: false, error: "Este e-mail já está cadastrado.", cause: err });
  });

  it("maps a server 422 to the generic validation message", async () => {
    const create = vi.fn(async () => {
      throw new ManageApiError(422, "unprocessable");
    });
    const result = await submitCreateTenant(FILLED, create);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/Dados inválidos/);
  });

  it("never calls the API when required fields are missing", async () => {
    const create = vi.fn(async (p: AdminTenantCreate) => createdFrom(p));
    const result = await submitCreateTenant({ ...FILLED, email: "" }, create);
    expect(create).not.toHaveBeenCalled();
    expect(result.ok).toBe(false);
  });
});
