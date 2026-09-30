// add-product.ts — the pure logic behind "Adicionar à minha assinatura" (TASK C, spec
// 2026-09-29 §5.10). No React, no window, no fetch: the node-environment vitest covers it.
//
// A clinic that owns ONE product and looks at the plan card of the OTHER adds it to the
// subscription it already pays for (POST /billing/add-product: preview, then confirm) instead
// of opening a second checkout. Everything commercial (the amounts) comes from the backend's
// preview; nothing here computes a price, and the combo's 15 % discount is never applied
// (decision D3).

import { formatBRLFromCents } from "./currency";
import type { AddProductCharge } from "./manage-api";

export type ProductFamily = "precheck" | "secretaria";

// Which product family a catalog plan id sells ("both" = the combo, which is not sold through
// add-product).
export function planFamily(plan: string): ProductFamily | "both" | null {
  if (plan === "complete_clinic_combo") return "both";
  if (plan.startsWith("secretaria")) return "secretaria";
  if (plan.startsWith("precheck")) return "precheck";
  return null;
}

export type OwnedEntitlement = { precheck: boolean; secretaria: boolean; status: string };

export type CtaDecision =
  | { kind: "checkout" }
  | { kind: "add-product"; product: ProductFamily }
  | { kind: "blocked"; message: string };

const PAST_DUE_MESSAGE = "Regularize o pagamento para adicionar.";
const TRIALING_MESSAGE = "Disponível quando o período de teste terminar.";

// What the click on a plan card should do for a logged-in tenant. The UI cannot tell a paid
// subscription from a courtesy grant: for an active clinic with the OTHER product it tries
// add-product, and the backend's 409 `no_active_subscription` sends a courtesy clinic to the
// normal checkout (see `AddProductDialog`).
export function decideCta(ent: OwnedEntitlement | null, plan: string): CtaDecision {
  if (!ent) return { kind: "checkout" };
  const family = planFamily(plan);
  if (family === null || family === "both") return { kind: "checkout" };
  const exactlyOne = ent.precheck !== ent.secretaria;
  const ownsTheOther = family === "precheck" ? ent.secretaria : ent.precheck;
  if (!exactlyOne || !ownsTheOther) return { kind: "checkout" };
  if (ent.status === "past_due") return { kind: "blocked", message: PAST_DUE_MESSAGE };
  if (ent.status === "trialing") return { kind: "blocked", message: TRIALING_MESSAGE };
  if (ent.status !== "active") return { kind: "checkout" };
  return { kind: "add-product", product: family };
}

const GENERIC_ERROR = "Não foi possível adicionar o produto agora. Tente novamente.";

// `detail` is ManageApiError.message — FastAPI's stable `detail` code.
export function addProductErrorMessage(status: number, detail: string): string {
  switch (detail) {
    case "product_already_active":
      return "Sua clínica já tem este produto.";
    case "subscription_past_due":
      return PAST_DUE_MESSAGE;
    case "subscription_trialing":
      return TRIALING_MESSAGE;
    case "payment_failed":
      return "O pagamento foi recusado. Confira o cartão e tente novamente.";
    case "payment_action_required":
      return "O seu banco pediu uma confirmação adicional. Abra o portal de cobrança para concluir.";
    case "payment_method_required":
      return "Cadastre um cartão no portal de cobrança para adicionar.";
    case "billing_role_required":
      return "Só o responsável pela clínica pode alterar a assinatura.";
    case "product_not_launched":
      return "Este produto ainda não está disponível para contratação.";
    case "test_tenant_billing_disabled":
      return "Esta é uma clínica de teste: a contratação pelo site está desativada.";
    case "add_product_in_progress":
      return "Já estamos processando a sua solicitação. Aguarde alguns segundos.";
    case "preview_quote_required":
    case "preview_quote_invalid":
    case "preview_quote_expired":
    case "preview_changed":
      return "O valor mudou. Confira a nova prévia antes de confirmar.";
    case "preview_unavailable":
      return "Não foi possível calcular o valor agora. Tente novamente.";
    case "billing_not_configured":
      return "Cobrança ainda não configurada. Fale com a Brain.";
    default:
      return status === 503 ? "Cobrança ainda não configurada. Fale com a Brain." : GENERIC_ERROR;
  }
}

// Refusals the customer fixes in the Stripe Billing Portal (card, 3-D Secure, overdue invoice).
export function needsBillingPortal(detail: string): boolean {
  return (
    detail === "payment_action_required" ||
    detail === "payment_method_required" ||
    detail === "subscription_past_due"
  );
}

function formatMoney(cents: number, currency: string): string {
  // Only BRL is formatted as money; anything else is shown as-is rather than mislabeled.
  if (currency.toLowerCase() === "brl") return formatBRLFromCents(cents);
  return `${(cents / 100).toFixed(2)} ${currency.toUpperCase()}`;
}

// "2026-10-15" -> "15/10/2026" without going through Date (no timezone shift).
function formatIsoDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${day}/${month}/${year}`;
}

// The confirmation dialog's lines, from the backend's PREVIEW (decision D5: the exact Stripe
// numbers, never an estimate).
export function describeCharge(product: ProductFamily, charge: AddProductCharge): string[] {
  const money = (cents: number) => formatMoney(cents, charge.currency);
  const lines: string[] = [];
  const now = charge.amount_due_now_cents;
  if (now !== null && now > 0) {
    lines.push(
      `Cobraremos ${money(now)} agora, proporcional ao restante do ciclo atual, no cartão da assinatura.`,
    );
  } else {
    lines.push("Nada será cobrado agora.");
  }
  if (charge.next_invoice_cents !== null) {
    const when = charge.next_invoice_date ? `, em ${formatIsoDate(charge.next_invoice_date)},` : "";
    lines.push(`Sua próxima fatura${when} será de ${money(charge.next_invoice_cents)}, na mesma assinatura.`);
  }
  if (charge.next_invoice_cents === null) {
    lines.push("O valor total da próxima fatura ainda não está disponível.");
  }
  if (product === "secretaria") {
    lines.push(
      "A secretarIA é cobrada por uso (pacientes, profissionais e lembretes): o consumo entra na fatura do mês.",
    );
  }
  return lines;
}

// "secretarIA Básico + PreCheck Basic" for a clinic with both products.
export function describePlans(
  plan: string,
  precheckPlan: string | null,
  labels: Record<string, string>,
): string {
  const main = labels[plan] ?? plan;
  return precheckPlan ? `${main} + ${labels[precheckPlan] ?? precheckPlan}` : main;
}

// --- The dialog's state machine (pure, so double clicks and retries are tested) ---------------

export type AddProductState =
  | { step: "idle" }
  | { step: "loading-preview" }
  | { step: "confirm"; charge: AddProductCharge; key: string }
  | { step: "executing"; charge: AddProductCharge; key: string }
  | { step: "done"; alreadyPresent: boolean }
  | {
      step: "error";
      message: string;
      portal: boolean;
      fallbackToCheckout: boolean;
      // Set only when the outcome of the update is UNKNOWN (network / 5xx): the retry must reuse
      // the same Idempotency-Key so the customer is never charged twice.
      retryKey: string | null;
      charge: AddProductCharge | null;
    };

export type AddProductAction =
  | { type: "open" }
  | { type: "preview-already-present" }
  | { type: "preview-ok"; charge: AddProductCharge; key: string }
  | { type: "preview-fail"; status: number; detail: string }
  | { type: "confirm" }
  | { type: "exec-ok"; alreadyPresent: boolean }
  | { type: "exec-fail"; status: number; detail: string }
  | { type: "retry" }
  | { type: "close" };

function errorState(
  status: number,
  detail: string,
  retryKey: string | null,
  charge: AddProductCharge | null,
): AddProductState {
  return {
    step: "error",
    message: addProductErrorMessage(status, detail),
    portal: needsBillingPortal(detail),
    fallbackToCheckout: detail === "no_active_subscription",
    retryKey,
    charge,
  };
}

export function addProductReducer(state: AddProductState, action: AddProductAction): AddProductState {
  switch (action.type) {
    case "open":
      return { step: "loading-preview" };
    case "preview-already-present":
      return state.step === "loading-preview" ? { step: "done", alreadyPresent: true } : state;
    case "preview-ok":
      return state.step === "loading-preview"
        ? { step: "confirm", charge: action.charge, key: action.key }
        : state;
    case "preview-fail":
      return state.step === "loading-preview" ? errorState(action.status, action.detail, null, null) : state;
    case "confirm":
      // A second click while executing (or from any other step) changes nothing.
      return state.step === "confirm" ? { step: "executing", charge: state.charge, key: state.key } : state;
    case "exec-ok":
      return state.step === "executing" ? { step: "done", alreadyPresent: action.alreadyPresent } : state;
    case "exec-fail": {
      if (state.step !== "executing") return state;
      const unknownOutcome = action.status === 0 || action.status >= 500 ||
        (action.status === 409 && action.detail === "add_product_in_progress");
      return errorState(action.status, action.detail, unknownOutcome ? state.key : null, state.charge);
    }
    case "retry":
      if (state.step !== "error") return state;
      return state.retryKey !== null && state.charge !== null
        ? { step: "executing", charge: state.charge, key: state.retryKey }
        : { step: "loading-preview" };
    case "close":
      return { step: "idle" };
  }
}
