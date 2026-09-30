import { describe, expect, it } from "vitest";

import {
  addProductErrorMessage,
  addProductReducer,
  decideCta,
  describeCharge,
  describePlans,
  needsBillingPortal,
  planFamily,
  type AddProductState,
} from "../add-product";

const charge = {
  currency: "brl",
  amount_due_now_cents: 4500,
  next_invoice_cents: 9000,
  next_invoice_date: "2026-10-15",
};

describe("planFamily", () => {
  it.each([
    ["precheck_start", "precheck"],
    ["precheck_basic", "precheck"],
    ["precheck_advanced", "precheck"],
    ["secretaria_basico", "secretaria"],
    ["complete_clinic_combo", "both"],
    ["free", null],
  ])("%s -> %s", (plan, expected) => {
    expect(planFamily(plan)).toBe(expected);
  });
});

describe("decideCta", () => {
  const onlySecretaria = { precheck: false, secretaria: true, status: "active" };
  const onlyPrecheck = { precheck: true, secretaria: false, status: "active" };

  it("offers add-product in both directions for a clinic with exactly one product", () => {
    expect(decideCta(onlySecretaria, "precheck_basic")).toEqual({ kind: "add-product", product: "precheck" });
    expect(decideCta(onlyPrecheck, "secretaria_basico")).toEqual({ kind: "add-product", product: "secretaria" });
  });

  it("keeps the normal checkout for a clinic with no product, the same product, both, or the combo card", () => {
    expect(decideCta(null, "precheck_basic")).toEqual({ kind: "checkout" });
    expect(decideCta({ precheck: false, secretaria: false, status: "inactive" }, "precheck_basic")).toEqual({ kind: "checkout" });
    expect(decideCta(onlyPrecheck, "precheck_advanced")).toEqual({ kind: "checkout" }); // tier swap is the billing page's job
    expect(decideCta({ precheck: true, secretaria: true, status: "active" }, "precheck_basic")).toEqual({ kind: "checkout" });
    expect(decideCta(onlySecretaria, "complete_clinic_combo")).toEqual({ kind: "checkout" });
  });

  it("blocks past_due and trialing BEFORE calling the API, with the spec copy", () => {
    expect(decideCta({ ...onlyPrecheck, status: "past_due" }, "secretaria_basico")).toEqual({
      kind: "blocked",
      message: "Regularize o pagamento para adicionar.",
    });
    expect(decideCta({ ...onlyPrecheck, status: "trialing" }, "secretaria_basico")).toEqual({
      kind: "blocked",
      message: "Disponível quando o período de teste terminar.",
    });
  });

  it("a dead subscription goes to the normal checkout", () => {
    expect(decideCta({ ...onlySecretaria, status: "canceled" }, "precheck_basic")).toEqual({ kind: "checkout" });
    expect(decideCta({ ...onlySecretaria, status: "inactive" }, "precheck_basic")).toEqual({ kind: "checkout" });
  });
});

describe("addProductErrorMessage / needsBillingPortal", () => {
  it.each([
    [409, "product_already_active", "Sua clínica já tem este produto."],
    [409, "subscription_past_due", "Regularize o pagamento para adicionar."],
    [409, "subscription_trialing", "Disponível quando o período de teste terminar."],
    [402, "payment_failed", "O pagamento foi recusado. Confira o cartão e tente novamente."],
    [409, "payment_action_required", "O seu banco pediu uma confirmação adicional. Abra o portal de cobrança para concluir."],
    [409, "payment_method_required", "Cadastre um cartão no portal de cobrança para adicionar."],
    [403, "billing_role_required", "Só o responsável pela clínica pode alterar a assinatura."],
    [403, "product_not_launched", "Este produto ainda não está disponível para contratação."],
    [403, "test_tenant_billing_disabled", "Esta é uma clínica de teste: a contratação pelo site está desativada."],
    [409, "add_product_in_progress", "Já estamos processando a sua solicitação. Aguarde alguns segundos."],
    [502, "preview_unavailable", "Não foi possível calcular o valor agora. Tente novamente."],
    [503, "billing_not_configured", "Cobrança ainda não configurada. Fale com a Brain."],
    [0, "", "Não foi possível adicionar o produto agora. Tente novamente."],
    [500, "anything", "Não foi possível adicionar o produto agora. Tente novamente."],
  ])("%s %s", (status, detail, expected) => {
    expect(addProductErrorMessage(status, detail)).toBe(expected);
  });

  it("only three refusals are fixed in the billing portal", () => {
    expect(needsBillingPortal("payment_action_required")).toBe(true);
    expect(needsBillingPortal("payment_method_required")).toBe(true);
    expect(needsBillingPortal("subscription_past_due")).toBe(true);
    expect(needsBillingPortal("payment_failed")).toBe(false);
    expect(needsBillingPortal("")).toBe(false);
  });
});

describe("describeCharge", () => {
  it("states the proration now and the next invoice (PreCheck, flat)", () => {
    expect(describeCharge("precheck", charge)).toEqual([
      "Cobraremos R$ 45,00 agora, proporcional ao restante do ciclo atual, no cartão da assinatura.",
      "Sua próxima fatura, em 15/10/2026, será de R$ 90,00, na mesma assinatura.",
    ]);
  });

  it("says nothing is charged now and explains usage billing for secretarIA", () => {
    const lines = describeCharge("secretaria", { ...charge, amount_due_now_cents: 0 });
    expect(lines[0]).toBe("Nada será cobrado agora.");
    expect(lines[lines.length - 1]).toBe(
      "A secretarIA é cobrada por uso (pacientes, profissionais e lembretes): o consumo entra na fatura do mês.",
    );
  });

  it("omits what the API did not give, and never invents a date", () => {
    expect(describeCharge("precheck", { currency: "brl", amount_due_now_cents: null, next_invoice_cents: null, next_invoice_date: null })).toEqual([
      "Nada será cobrado agora.",
      "O valor total da próxima fatura ainda não está disponível.",
    ]);
    expect(describeCharge("precheck", { ...charge, next_invoice_date: null })[1]).toBe(
      "Sua próxima fatura será de R$ 90,00, na mesma assinatura.",
    );
  });

  it("does not pretend a non-BRL amount is BRL", () => {
    expect(describeCharge("precheck", { ...charge, currency: "usd" })[0]).toContain("45.00 USD");
  });
});

describe("describePlans", () => {
  const labels = { secretaria_basico: "secretarIA Básico", precheck_basic: "PreCheck Basic" };
  it("names both products of a dual clinic", () => {
    expect(describePlans("secretaria_basico", "precheck_basic", labels)).toBe("secretarIA Básico + PreCheck Basic");
  });
  it("names one plan otherwise, falling back to the raw id", () => {
    expect(describePlans("precheck_basic", null, labels)).toBe("PreCheck Basic");
    expect(describePlans("mystery", null, labels)).toBe("mystery");
  });
});

describe("addProductReducer", () => {
  const idle: AddProductState = { step: "idle" };

  it("walks preview -> confirm -> executing -> done", () => {
    let s = addProductReducer(idle, { type: "open" });
    expect(s).toEqual({ step: "loading-preview" });
    s = addProductReducer(s, { type: "preview-ok", charge, key: "k1" });
    expect(s).toEqual({ step: "confirm", charge, key: "k1" });
    s = addProductReducer(s, { type: "confirm" });
    expect(s).toEqual({ step: "executing", charge, key: "k1" });
    s = addProductReducer(s, { type: "exec-ok", alreadyPresent: false });
    expect(s).toEqual({ step: "done", alreadyPresent: false });
  });

  it("ignores a second click on Confirmar while executing", () => {
    const executing: AddProductState = { step: "executing", charge, key: "k1" };
    expect(addProductReducer(executing, { type: "confirm" })).toBe(executing);
  });

  it("a preview refusal is an error; 409 no_active_subscription asks for the checkout fallback", () => {
    const loading: AddProductState = { step: "loading-preview" };
    const denied = addProductReducer(loading, { type: "preview-fail", status: 409, detail: "subscription_past_due" });
    expect(denied).toMatchObject({ step: "error", portal: true, fallbackToCheckout: false, retryKey: null });
    const noSub = addProductReducer(loading, { type: "preview-fail", status: 409, detail: "no_active_subscription" });
    expect(noSub).toMatchObject({ step: "error", fallbackToCheckout: true });
  });

  it("keeps the idempotency key only when the outcome is unknown (network / 5xx)", () => {
    const executing: AddProductState = { step: "executing", charge, key: "k1" };
    const network = addProductReducer(executing, { type: "exec-fail", status: 0, detail: "" });
    expect(network).toMatchObject({ step: "error", retryKey: "k1" });
    const upstream = addProductReducer(executing, { type: "exec-fail", status: 502, detail: "stripe_error" });
    expect(upstream).toMatchObject({ retryKey: "k1" });
    const declined = addProductReducer(executing, { type: "exec-fail", status: 402, detail: "payment_failed" });
    expect(declined).toMatchObject({ step: "error", retryKey: null, portal: false });
  });

  it("retry re-executes with the SAME key when there is one, else starts over at the preview", () => {
    const executing: AddProductState = { step: "executing", charge, key: "k1" };
    const unknown = addProductReducer(executing, { type: "exec-fail", status: 0, detail: "" });
    expect(addProductReducer(unknown, { type: "retry" })).toEqual({ step: "executing", charge, key: "k1" });
    const declined = addProductReducer(executing, { type: "exec-fail", status: 402, detail: "payment_failed" });
    expect(addProductReducer(declined, { type: "retry" })).toEqual({ step: "loading-preview" });
  });

  it("retries an in-progress request with its original key and displayed charge", () => {
    const executing: AddProductState = { step: "executing", charge, key: "k1" };
    const pending = addProductReducer(executing, { type: "exec-fail", status: 409, detail: "add_product_in_progress" });
    expect(pending).toMatchObject({ retryKey: "k1", charge });
    expect(addProductReducer(pending, { type: "retry" })).toEqual(executing);
  });

  it("requires a fresh preview and consent when the charge changed", () => {
    const executing: AddProductState = { step: "executing", charge, key: "k1" };
    const changed = addProductReducer(executing, { type: "exec-fail", status: 409, detail: "preview_changed" });
    expect(changed).toMatchObject({ retryKey: null, message: "O valor mudou. Confira a nova prévia antes de confirmar." });
    expect(addProductReducer(changed, { type: "retry" })).toEqual({ step: "loading-preview" });
  });

  it("close always returns to idle", () => {
    expect(addProductReducer({ step: "confirm", charge, key: "k1" }, { type: "close" })).toEqual(idle);
    expect(addProductReducer({ step: "done", alreadyPresent: true }, { type: "close" })).toEqual(idle);
  });

  it("finishes when the preview says the product was already present without a charge", () => {
    expect(addProductReducer({ step: "loading-preview" }, { type: "preview-already-present" })).toEqual({
      step: "done", alreadyPresent: true,
    });
    const idle: AddProductState = { step: "idle" };
    expect(addProductReducer(idle, { type: "preview-already-present" })).toBe(idle);
  });
});
