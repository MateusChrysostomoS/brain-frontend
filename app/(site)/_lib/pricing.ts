// pricing.ts — display-only PT-BR pricing shown on the marketing site
// (Stripe-test-mode validation pass). These strings are NOT the commercial
// source of truth — that's brain-api's catalog (services/catalog.py) — this
// module just keeps "R$ ..." literals and catalog id lists out of JSX so
// page.tsx never hardcodes a price string.

export type PricingPlanKey = "precheck" | "secretaria" | "combo";

export type PricingPlan = {
  name: string;
  tagline: string;
  amount: string;
  unit: string;
  // Catalog ids sent as `catalog_ids` on the public self-service signup intent
  // (POST /public/signup-intents). `null` means self-service checkout isn't
  // wired for this plan yet (combo has no Stripe Price configured).
  catalogIds: string[] | null;
};

export const PRICING: Record<PricingPlanKey, PricingPlan> = {
  precheck: {
    name: "Plano PreCheck",
    tagline: "Pré-consulta no WhatsApp",
    amount: "R$ 120,00",
    unit: "/mês",
    catalogIds: ["precheck"],
  },
  secretaria: {
    name: "Plano secretarIA",
    tagline: "Secretária com IA no WhatsApp",
    // secretarIA is fully metered — no flat/anchor monthly fee (2026-07-22 catalog
    // collapse). Billed on active professionals, billable patients, and reminders
    // sent outside the WhatsApp 24h window, so there is no single "R$ X/mês" to show.
    amount: "Pague pelo uso",
    unit: "profissionais, pacientes e lembretes",
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
    catalogIds: null,
  },
};
