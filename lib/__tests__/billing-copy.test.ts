import { describe, expect, it } from "vitest";
import { billingAddonLabel, billingLimitDisplay, billingPlanLabel } from "../billing-copy";

describe("billing copy", () => {
  it.each(["billable_patients", "active_professionals", "reminders"])(
    "explains a zero billing meter as usage-based billing: %s", (key) => {
      expect(billingLimitDisplay(key, 0).value).toBe("Conforme o uso");
      expect(billingLimitDisplay(key, 0).hint).toContain("valor depende do uso");
    },
  );

  it("keeps actual quota amounts distinct from billing meters", () => {
    expect(billingLimitDisplay("precheck_consultations", 200).value).toBe("200");
    expect(billingLimitDisplay("professionals", 0).value).toBe("0");
    expect(billingLimitDisplay("messages", -1).value).toBe("Sem limite");
  });

  it("does not expose internal identifiers when catalog entries are unknown", () => {
    expect(billingPlanLabel("future_plan", "future_precheck")).toBe("Plano contratado + PreCheck");
    expect(billingAddonLabel("future_addon")).toBe("Recurso adicional contratado");
    expect(billingLimitDisplay("future_limit", 10).label).toBe("Recurso do plano");
  });

  it("uses Portuguese for plans and patient billing", () => {
    expect(billingPlanLabel("secretaria_basico", "precheck_basic")).toBe("secretarIA Básico + PreCheck Básico");
    expect(billingLimitDisplay("billable_patients", 0).label).toBe("Pacientes com cobrança");
  });
});
