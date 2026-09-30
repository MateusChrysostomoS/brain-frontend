import { describe, expect, it } from "vitest";

import {
  CONSOLE_ORIGIN,
  PLANS_NEXT_PATH,
  anonymousCheckoutRoute,
  checkoutErrorMessage,
} from "../checkout-cta";
import { safeNextPath } from "../safe-next";

describe("anonymousCheckoutRoute", () => {
  it("sends a visitor coming from the console to /login, back to the plans", () => {
    const route = anonymousCheckoutRoute({
      origem: CONSOLE_ORIGIN,
      plan: "precheck_basic",
      catalogIds: ["precheck_basic"],
    });
    expect(route).toBe("/login?next=%2F%23planos&origem=console");
  });

  it("the next it builds is one /login will actually follow", () => {
    expect(safeNextPath(PLANS_NEXT_PATH)).toBe("/#planos");
  });

  it.each([[null], [""], ["Console"], ["email"]])(
    "keeps the new-lead /cadastro wizard for origem=%s",
    (origem) => {
      const route = anonymousCheckoutRoute({
        origem,
        plan: "precheck_basic",
        catalogIds: ["precheck_basic", "precheck_start"],
      });
      expect(route).toBe("/cadastro?plan=precheck_basic&catalog=precheck_basic%2Cprecheck_start");
    },
  );
});

describe("checkoutErrorMessage", () => {
  it("explains an existing subscription (409 has_active_subscription)", () => {
    expect(checkoutErrorMessage(409, "has_active_subscription")).toBe(
      "Sua clínica já tem uma assinatura ativa. Recarregue a página para adicionar outro produto a ela.",
    );
  });

  it("does not mistake another 409 for an existing subscription", () => {
    expect(checkoutErrorMessage(409, "No tenant in context")).toBe(
      "Não foi possível iniciar o checkout. Tente novamente.",
    );
  });

  it("explains the test clinic refusal (403 test_tenant_billing_disabled)", () => {
    expect(checkoutErrorMessage(403, "test_tenant_billing_disabled")).toBe(
      "Esta é uma clínica de teste: a contratação pelo site está desativada.",
    );
  });

  it("keeps the existing 503 / 422 / fallback copy", () => {
    expect(checkoutErrorMessage(503, "billing_not_configured")).toBe(
      "Cobrança ainda não configurada. Fale com a Brain.",
    );
    expect(checkoutErrorMessage(422, "unknown_or_unassignable_plan:x")).toBe(
      "Plano indisponível no momento.",
    );
    expect(checkoutErrorMessage(0, "")).toBe("Não foi possível iniciar o checkout. Tente novamente.");
    expect(checkoutErrorMessage(502, "stripe_error")).toBe(
      "Não foi possível iniciar o checkout. Tente novamente.",
    );
  });
});
