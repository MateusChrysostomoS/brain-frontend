// plans.ts — resolves the `?plan=` / `?catalog=` query params the /cadastro
// wizard is opened with (see PlanCheckoutCta, which now navigates here instead
// of opening its inline modal for anonymous visitors). Display-only labels;
// the commercial source of truth stays brain-api's catalog (services/catalog.py).

import type { CatalogPlanId } from "@/lib/manage-api";
import { PRICING, type PricingPlan } from "../../_lib/pricing";
import { isPurchaseGated } from "../../_lib/launch";

// Plans this wizard can actually check out. Deliberately excludes the combo
// (`complete_clinic_combo`, catalogIds: null in _lib/pricing.ts) — Phase 2
// (PreCheck/combo Stripe Prices) is out of scope, so combo stays unpurchasable
// even if a stray `?plan=complete_clinic_combo` link is ever created.
//
// PreCheck is now three purchasable tiers (precheck_start/precheck_basic/
// precheck_advanced, 2026-09-03) — see resolvePlan below for the
// `?plan=precheck` backward-compat mapping.
const PURCHASABLE_PLANS: Record<string, { label: string; tagline: string }> = {
  precheck_start: {
    label: "PreCheck Start",
    tagline: "Cota mensal de pré-consultas no WhatsApp",
  },
  precheck_basic: {
    label: "PreCheck Basic",
    tagline: "O dobro do volume mensal do Start",
  },
  precheck_advanced: {
    label: "PreCheck Advanced",
    tagline: "Cota mensal maior de pré-consultas no WhatsApp",
  },
  secretaria_basico: {
    label: "secretarIA Básico",
    tagline: "Converse e agende no WhatsApp — pague só pelo que usar",
  },
};

export type ResolvedPlan = {
  planId: CatalogPlanId | string;
  label: string;
  tagline: string;
  catalogIds: string[];
};

// Resolves the plan + catalog_ids to submit from the wizard's query params.
// Returns null when `plan` is missing or not a known purchasable id — the page
// shows an inline error instead of guessing.
export function resolvePlan(searchParams: URLSearchParams): ResolvedPlan | null {
  const rawPlanId = searchParams.get("plan");
  if (!rawPlanId) return null;
  // Backward-compat: a stale marketing link/bookmark may still carry the
  // legacy bare "precheck" id — treat it as the current entry-level tier.
  const planId = rawPlanId === "precheck" ? "precheck_basic" : rawPlanId;
  const meta = PURCHASABLE_PLANS[planId];
  if (!meta) return null;

  const catalogParam = searchParams.get("catalog");
  const catalogIds = catalogParam
    ? catalogParam.split(",").map((s) => s.trim()).filter(Boolean)
    : [planId];

  return { planId, label: meta.label, tagline: meta.tagline, catalogIds };
}

// ── Escolha de plano dentro da família (passo `plan` do wizard) ──────────────

// Preço/bullets por id de plano, derivados de PRICING em vez de redigitados: a
// vitrine e o wizard têm de prometer a MESMA coisa. `catalogIds[0]` é o id do
// plano em toda entrada que tem checkout ligado (o combo tem `null` e cai fora).
const PRICING_BY_PLAN_ID: Record<string, PricingPlan> = Object.fromEntries(
  Object.values(PRICING)
    .filter((p) => (p.catalogIds?.length ?? 0) > 0)
    .map((p) => [p.catalogIds![0], p]),
);

// Trocas legítimas: planos que são alternativas comerciais entre si, do MESMO
// produto. Hoje só o PreCheck tem faixas (três, desde 2026-09-03); secretarIA
// tem uma única e por isso não vira escolha (uma lista de um item não é uma
// decisão, é um obstáculo). A ordem aqui é a que o passo de escolha renderiza:
// da menor cota para a maior, igual à vitrine.
//
// Por que a escolha vive AQUI, antes do primeiro card, e não depois:
// `PATCH /public/signup-intents/{id}` recusa mudança de plano com
// `plan_change_not_allowed` (brain-api services/signup.py::update_intent_catalog).
// O plano viaja no POST que CRIA a conta — este é o último instante em que ele
// ainda pode mudar sem apagar e refazer o cadastro.
const PLAN_FAMILIES: readonly (readonly string[])[] = [
  ["precheck_start", "precheck_basic", "precheck_advanced"],
];

// Um plano oferecível no passo de escolha: o ResolvedPlan que o wizard usaria,
// mais o que a pessoa precisa ver para escolher.
export type PlanChoice = ResolvedPlan & {
  amount: string;
  unit: string;
  features: string[];
};

// As alternativas que o passo de escolha deve mostrar para `plan`.
// Devolve [] quando não há decisão a tomar (família desconhecida, ou uma só
// opção comprável) — o wizard então pula o passo inteiro.
//
// `incoming.catalogIds` pode carregar add-ons vindos de um `?catalog=`; eles são
// HERDADOS pela alternativa em vez de descartados. Nenhuma família com escolha
// oferece add-ons hoje, mas perder um `?catalog=` em silêncio ao trocar de faixa
// seria uma cobrança a menos que ninguém veria.
export function planChoices(incoming: ResolvedPlan): PlanChoice[] {
  const familia = PLAN_FAMILIES.find((f) => f.includes(incoming.planId));
  if (!familia) return [];

  const addons = incoming.catalogIds.filter(
    (id) => id !== incoming.planId && !(id in PURCHASABLE_PLANS),
  );

  const opcoes = familia.flatMap((planId) => {
    const meta = PURCHASABLE_PLANS[planId];
    const preco = PRICING_BY_PLAN_ID[planId];
    // Um plano que a vitrine não precifica não pode ser comparado — e um plano
    // ainda barrado pelo portão de lançamento não pode ser vendido.
    if (!meta || !preco || isPurchaseGated([planId])) return [];
    return [
      {
        planId,
        label: meta.label,
        tagline: meta.tagline,
        catalogIds: [planId, ...addons],
        amount: preco.amount,
        unit: preco.unit,
        features: preco.features,
      },
    ];
  });

  return opcoes.length > 1 ? opcoes : [];
}

// True for any PreCheck plan variant (precheck_basic, precheck_advanced, and —
// defensively — the legacy bare "precheck" id). PreCheck has no WhatsApp/Meta
// eligibility questionnaire to answer: that flow exists only to gate
// secretarIA's WhatsApp Coexistence requirement, so CadastroWizard and
// SummaryStep both use this to skip/hide it for a PreCheck purchase.
export function isPrecheckPlan(plan: ResolvedPlan): boolean {
  return plan.planId.startsWith("precheck");
}
