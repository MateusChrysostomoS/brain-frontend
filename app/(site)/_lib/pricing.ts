// pricing.ts — display-only PT-BR pricing shown on the marketing site
// (Stripe-test-mode validation pass). These strings are NOT the commercial
// source of truth — that's brain-api's catalog (services/catalog.py) — this
// module just keeps "R$ ..." literals and catalog id lists out of JSX so
// page.tsx never hardcodes a price string.

// ── Cota mensal de pré-consultas por faixa do PreCheck ──────────────────────
//
// UM lugar só, de propósito: a cota é decisão comercial que ainda vai mudar, e a
// duplicação já custou uma divergência silenciosa de um mês. Editar os dois
// números abaixo acerta a landing (/#planos) e o passo de escolha de plano do
// /cadastro juntos — nenhum outro arquivo repete o valor.
//
// ⚠️ ELES TÊM DE BATER com o que a brain-api concede de verdade:
// `PRECHECK_BASIC_CONSULTATIONS_PER_MONTH` e
// `PRECHECK_ADVANCED_CONSULTATIONS_PER_MONTH`, env do serviço
// `secretaria_brain-api` no EasyPanel. Quem enforce é o backend
// (services/precheck_billing.py); isto aqui é só o que prometemos. Mexer só aqui
// promete o que não se entrega; mexer só lá entrega o que não se cobrou — mude
// os dois na mesma rodada.
//
// 2026-09-02: alinhados em 100/300, que é o que o ambiente deployado já
// concedia. A tabela comercial de 02/08 dizia 50/150 e as env vars nunca foram
// setadas para isso, então a vitrine prometeu METADE do que o backend liberava.
export const PRECHECK_QUOTA = { basic: 100, advanced: 300 } as const;

export type PricingPlanKey =
  | "precheck"
  | "precheckAdvanced"
  | "secretaria"
  | "combo";

export type PricingPlan = {
  name: string;
  tagline: string;
  amount: string;
  unit: string;
  // Os bullets do card. Vivem AQUI e não no JSX de page.tsx porque a mesma lista
  // é lida pelo passo de escolha de plano do /cadastro (cadastro/lib/plans.ts).
  // Duplicar a promessa comercial em dois arquivos é exatamente como a vitrine e
  // o checkout passam a dizer coisas diferentes sobre o que o médico compra.
  features: string[];
  // Catalog ids sent as `catalog_ids` on the public self-service signup intent
  // (POST /public/signup-intents). `null` means self-service checkout isn't
  // wired for this plan yet (combo has no Stripe Price configured).
  catalogIds: string[] | null;
};

export const PRICING: Record<PricingPlanKey, PricingPlan> = {
  precheck: {
    name: "PreCheck Basic",
    tagline: "Pré-consulta no WhatsApp",
    amount: "R$ 59,99",
    unit: "/mês",
    features: [
      `${PRECHECK_QUOTA.basic} pré-consultas por mês`,
      "Anamnese guiada por IA",
      "Resumo estruturado + alertas",
      "Painel clínico PreCheck",
    ],
    // Renamed from the legacy bare "precheck" id — see cadastro/lib/plans.ts.
    catalogIds: ["precheck_basic"],
  },
  // Second purchasable PreCheck tier (2026-08-01 PreCheck-billing split). Both
  // tiers are fully active in brain-api's catalog and differ ONLY in the monthly
  // consultation quota (PLAN_PRECHECK_BASIC/ADVANCED, base_limits
  // LIMIT_PRECHECK_CONSULTATIONS), so this renders as a real fourth PriceCard
  // rather than the secondary text link it used to be — a plan the site never
  // priced could not be compared, only stumbled into.
  //
  // As cotas dos dois cards do PreCheck vêm de PRECHECK_QUOTA no topo deste
  // arquivo — ver lá por que elas moram num lugar só e o que mais precisa mudar
  // junto.
  precheckAdvanced: {
    name: "PreCheck Advanced",
    tagline: "Mais volume de pré-consultas",
    // Display-only, like every amount in this file: the charged value is the
    // Stripe Price behind STRIPE_PRICE_MAP["precheck_advanced"], not this string.
    amount: "R$ 169,99",
    unit: "/mês",
    features: [
      `${PRECHECK_QUOTA.advanced} pré-consultas por mês`,
      "Tudo do PreCheck Basic",
      "Pré-consultas avulsas quando precisar",
      "Upgrade imediato pelo painel",
    ],
    catalogIds: ["precheck_advanced"],
  },
  secretaria: {
    name: "Plano secretarIA",
    tagline: "Secretária com IA no WhatsApp",
    // secretarIA is fully metered — no flat/anchor monthly fee (2026-07-22 catalog
    // collapse). Billed on active professionals, billable patients, and reminders
    // sent outside the WhatsApp 24h window, so there is no single "R$ X/mês" to show.
    amount: "Pague pelo uso",
    unit: "profissionais, pacientes e lembretes",
    features: [
      "Respostas com o seu contexto",
      "Agendar, cancelar e remarcar",
      "Sincronização com Google Calendar",
      "Painel da secretarIA",
    ],
    // Must match the plan the deployed STRIPE_PRICE_MAP actually prices and the
    // authenticated CTA's plan prop in page.tsx.
    catalogIds: ["secretaria_basico"],
  },
  combo: {
    // secretarIA no longer has a flat monthly fee (see above), so this can't be a
    // plain sum of the two plans anymore. Self-service checkout isn't wired for the
    // combo (catalogIds: null below) — framed as "sob consulta" instead of stale math.
    name: "Brain Completo",
    tagline: "secretarIA + PreCheck",
    amount: "Sob consulta",
    unit: "PreCheck fixo + secretarIA por uso",
    features: [
      "Tudo do PreCheck",
      "Tudo da secretarIA",
      "Os dois produtos integrados",
      "Implantação assistida",
    ],
    catalogIds: null,
  },
};
