// Pure logic behind the "Profissionais" card on /admin/tenants?id=… (TASK-063), kept out
// of the component so it is testable in vitest's node environment (no jsdom here).
// Contract: brain-api docs/CHECKPOINT_admin_professional_capacity.md.

import {
  ManageApiError,
  type CapacityBlockedReason,
  type ProfessionalCapacity,
} from "@/lib/manage-api";

const BLOCKED_TEXT: Record<CapacityBlockedReason, string> = {
  stripe_managed:
    "Esta clínica tem assinatura no Stripe: a quantidade de profissionais vem do plano pago.",
  secretaria_disabled:
    "Ative a secretarIA nesta clínica para definir quantos profissionais ela pode ter.",
};

export function describeBlockedReason(reason: CapacityBlockedReason | null): string | null {
  return reason ? BLOCKED_TEXT[reason] : null;
}

// "2 ativos de 3 permitidos" — or just the cap when the live roster could not be read.
export function describeUsage(capacity: ProfessionalCapacity): string {
  const cap = capacity.max_professionals;
  const permitted = cap === 1 ? "1 permitido" : `${cap} permitidos`;
  if (capacity.active_professionals === null) return `${permitted} (equipe atual indisponível)`;
  const active = capacity.active_professionals;
  return `${active} ${active === 1 ? "ativo" : "ativos"} de ${permitted}`;
}

export type CapacityInputResult = { ok: true; value: number } | { ok: false; error: string };

// Client-side mirror of the server rules, only to answer before the round-trip;
// brain-api stays the authority (422/409 on anything this lets through).
export function parseCapacityInput(
  raw: string,
  capacity: ProfessionalCapacity,
): CapacityInputResult {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return { ok: false, error: "Digite um número inteiro." };
  const value = Number(text);
  if (value < 1 || value > capacity.max_allowed) {
    return { ok: false, error: `Use um número entre 1 e ${capacity.max_allowed}.` };
  }
  const active = capacity.active_professionals;
  if (active !== null && value < active) {
    return {
      ok: false,
      error: `A clínica já tem ${active} profissionais ativos. Desative alguém antes de baixar o limite.`,
    };
  }
  return { ok: true, value };
}

export function describeCapacityError(error: unknown): string {
  if (error instanceof ManageApiError) {
    if (error.status === 409) {
      if (error.message === "below_active_professionals") {
        return "A clínica tem mais profissionais ativos do que esse limite. Desative alguém antes.";
      }
      const blocked = describeBlockedReason(error.message as CapacityBlockedReason);
      if (blocked) return blocked;
    }
    if (error.status === 422) return "Número fora do permitido.";
    if (error.status === 404) return "Clínica não encontrada.";
    if (error.status === 403) return "Você não tem permissão para esta ação.";
  }
  return "Não foi possível salvar. Tente novamente.";
}
