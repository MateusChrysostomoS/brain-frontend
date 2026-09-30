// checkout-cta.ts — pure decisions behind PlanCheckoutCta (no window, no router),
// so the node-environment vitest setup covers them.
//
// Existing-account signal: the Brain-Message console links its clinics here with
// `origem=console` (spec 2026-09-29 §5.1). That person HAS an account — sending
// them to /cadastro fails with email_already_registered — so without a session
// they go to /login and come back to the plans. The console's refresh cookie is
// host-only and never reaches this origin, so `origem` is the only cross-origin
// signal there is; a same-origin cookie session is already found by
// ensureSession() before this is ever asked.

export const CONSOLE_ORIGIN = "console";
export const PLANS_NEXT_PATH = "/#planos";

export function anonymousCheckoutRoute(input: {
  origem: string | null;
  plan: string;
  catalogIds: string[];
}): string {
  if (input.origem === CONSOLE_ORIGIN) {
    const params = new URLSearchParams({ next: PLANS_NEXT_PATH, origem: CONSOLE_ORIGIN });
    return `/login?${params.toString()}`;
  }
  const params = new URLSearchParams({ plan: input.plan, catalog: input.catalogIds.join(",") });
  return `/cadastro?${params.toString()}`;
}

// `detail` is ManageApiError.message — FastAPI's `detail` string (a stable code).
export function checkoutErrorMessage(status: number, detail: string): string {
  // A live subscription already exists; decideCta normally routes to add-product first.
  if (status === 409 && detail === "has_active_subscription") {
    return "Sua clínica já tem uma assinatura ativa. Recarregue a página para adicionar outro produto a ela.";
  }
  if (status === 403 && detail === "test_tenant_billing_disabled") {
    return "Esta é uma clínica de teste: a contratação pelo site está desativada.";
  }
  if (status === 503) return "Cobrança ainda não configurada. Fale com a Brain.";
  if (status === 422) return "Plano indisponível no momento.";
  return "Não foi possível iniciar o checkout. Tente novamente.";
}
