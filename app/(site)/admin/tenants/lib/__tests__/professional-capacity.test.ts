import { describe, expect, it } from "vitest";

import { ManageApiError, type ProfessionalCapacity } from "@/lib/manage-api";

import {
  describeBlockedReason,
  describeCapacityError,
  describeUsage,
  parseCapacityInput,
} from "../professional-capacity";

const BASE: ProfessionalCapacity = {
  tenant_id: "11111111-1111-1111-1111-111111111111",
  max_professionals: 3,
  multi_professional: true,
  active_professionals: 2,
  editable: true,
  blocked_reason: null,
  max_allowed: 50,
};

describe("parseCapacityInput", () => {
  it("accepts an integer inside 1..max_allowed and not under the live roster", () => {
    expect(parseCapacityInput(" 4 ", BASE)).toEqual({ ok: true, value: 4 });
    expect(parseCapacityInput("2", BASE)).toEqual({ ok: true, value: 2 });
    expect(parseCapacityInput("50", BASE)).toEqual({ ok: true, value: 50 });
  });

  it("refuses non-integers and out-of-range values", () => {
    for (const raw of ["", "abc", "2.5", "-1", "1e2"]) {
      expect(parseCapacityInput(raw, BASE)).toMatchObject({ ok: false });
    }
    expect(parseCapacityInput("0", BASE)).toEqual({ ok: false, error: "Use um número entre 1 e 50." });
    expect(parseCapacityInput("51", BASE)).toMatchObject({ ok: false });
  });

  it("refuses a cap below the active roster, but not when the roster is unknown", () => {
    expect(parseCapacityInput("1", BASE)).toMatchObject({ ok: false, error: /2 profissionais ativos/ });
    expect(parseCapacityInput("1", { ...BASE, active_professionals: null })).toEqual({
      ok: true,
      value: 1,
    });
  });
});

describe("describeUsage", () => {
  it("shows active of permitted, with singulars", () => {
    expect(describeUsage(BASE)).toBe("2 ativos de 3 permitidos");
    expect(describeUsage({ ...BASE, active_professionals: 1, max_professionals: 1 })).toBe(
      "1 ativo de 1 permitido",
    );
  });

  it("never reads an unknown roster as zero", () => {
    expect(describeUsage({ ...BASE, active_professionals: null })).toBe(
      "3 permitidos (equipe atual indisponível)",
    );
  });
});

describe("describeBlockedReason / describeCapacityError", () => {
  it("explains each server refusal in Portuguese", () => {
    expect(describeBlockedReason(null)).toBeNull();
    expect(describeBlockedReason("stripe_managed")).toMatch(/Stripe/);
    expect(describeCapacityError(new ManageApiError(409, "secretaria_disabled"))).toMatch(
      /Ative a secretarIA/,
    );
    expect(describeCapacityError(new ManageApiError(409, "below_active_professionals"))).toMatch(
      /mais profissionais ativos/,
    );
    expect(describeCapacityError(new ManageApiError(422, "x"))).toBe("Número fora do permitido.");
    expect(describeCapacityError(new Error("boom"))).toMatch(/Tente novamente/);
  });
});
