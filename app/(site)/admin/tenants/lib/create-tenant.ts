// Pure logic behind the "Criar clínica de teste" panel on /admin/tenants, kept out of
// the component so it is testable in vitest's node environment (no jsdom here).
// Contract: brain-api docs/CHECKPOINT_admin_test_tenant.md (POST /admin/tenants).
// TEMPORARY — removed before the real launch together with the backend route.

import {
  ManageApiError,
  type AdminTenantCreate,
  type AdminTenantCreated,
} from "@/lib/manage-api";

export type CreateTenantForm = {
  clinicName: string;
  email: string;
  name: string;
  password: string;
  precheck: boolean;
  secretaria: boolean;
};

export const EMPTY_CREATE_TENANT_FORM: CreateTenantForm = {
  clinicName: "",
  email: "",
  name: "",
  password: "",
  precheck: false,
  secretaria: false,
};

// Client-side mirror of the server rules, only to give a useful message before the
// round-trip; brain-api stays the authority (422 on anything this lets through).
export function validateCreateTenantForm(form: CreateTenantForm): string | null {
  if (!form.clinicName.trim() || !form.email.trim() || !form.name.trim() || !form.password) {
    return "Preencha nome da clínica, e-mail, nome e senha.";
  }
  if (form.password.length < 8 || form.password.length > 72) {
    return "A senha precisa ter entre 8 e 72 caracteres.";
  }
  if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    return "A senha precisa ter pelo menos uma letra e um número.";
  }
  return null;
}

// Exactly the six fields of AdminTenantCreateIn (extra="forbid" server-side).
export function buildCreateTenantPayload(form: CreateTenantForm): AdminTenantCreate {
  return {
    clinic_name: form.clinicName.trim(),
    email: form.email.trim(),
    name: form.name.trim(),
    password: form.password,
    precheck: form.precheck,
    secretaria: form.secretaria,
  };
}

export function describeCreateTenantError(error: unknown): string {
  if (error instanceof ManageApiError) {
    // The server's 409 detail is "Email already registered" (English) — say it in pt-BR.
    if (error.status === 409) return "Este e-mail já está cadastrado.";
    if (error.status === 422) return "Dados inválidos. Verifique os campos.";
    if (error.status === 403) return "Você não tem permissão para esta ação.";
  }
  return "Algo deu errado. Tente novamente.";
}

export type CreateTenantResult =
  | { ok: true; created: AdminTenantCreated }
  | { ok: false; error: string; cause?: unknown };

// Validate → build payload → call. `create` is injected (the real one is
// adminCreateTenant bound to the session) so tests never touch the network.
export async function submitCreateTenant(
  form: CreateTenantForm,
  create: (payload: AdminTenantCreate) => Promise<AdminTenantCreated>,
): Promise<CreateTenantResult> {
  const invalid = validateCreateTenantForm(form);
  if (invalid) return { ok: false, error: invalid };
  try {
    const created = await create(buildCreateTenantPayload(form));
    return { ok: true, created };
  } catch (e) {
    return { ok: false, error: describeCreateTenantError(e), cause: e };
  }
}
