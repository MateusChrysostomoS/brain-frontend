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
    amount: "R$ 300,00",
    unit: "/mês",
    // Must match the plan the deployed STRIPE_PRICE_MAP actually prices (its
    // "secretaria_bronze" key is brain-api's alias for secretaria_bronze_1) and
    // the authenticated CTA's plan prop in page.tsx.
    catalogIds: ["secretaria_bronze_1"],
  },
  combo: {
    // Plain sum of the two plans above — self-explanatory, no discount implied.
    name: "Brain Completo",
    tagline: "secretarIA + PreCheck",
    amount: "R$ 420,00",
    unit: "/mês",
    catalogIds: null,
  },
};
