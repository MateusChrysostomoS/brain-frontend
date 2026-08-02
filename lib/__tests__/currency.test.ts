import { describe, expect, it } from "vitest";
import { formatBRLFromCents } from "../currency";

// formatBRLFromCents backs the "Compras avulsas: R$ XX,XX" spend line on the
// /app/billing PreCheck section (spend.topup_cents from GET
// /billing/precheck/usage). The NBSP-normalization case guards against a
// known Node/ICU quirk (Intl.NumberFormat("pt-BR", {style:"currency",...})
// inserts a NO-BREAK SPACE, char code 160, between "R$" and the digits).
describe("formatBRLFromCents", () => {
  it("formats a whole-reais amount", () => {
    expect(formatBRLFromCents(12300)).toBe("R$ 123,00");
  });

  it("formats an amount with cents", () => {
    expect(formatBRLFromCents(12345)).toBe("R$ 123,45");
  });

  it("formats a sub-real amount", () => {
    expect(formatBRLFromCents(150)).toBe("R$ 1,50");
  });

  it("zero cents -> R$ 0,00", () => {
    expect(formatBRLFromCents(0)).toBe("R$ 0,00");
  });

  it("negative input clamps to zero instead of rendering a negative amount", () => {
    expect(formatBRLFromCents(-500)).toBe("R$ 0,00");
  });

  it("non-finite input clamps to zero instead of rendering 'R$ NaN'", () => {
    expect(formatBRLFromCents(NaN)).toBe("R$ 0,00");
    expect(formatBRLFromCents(Infinity)).toBe("R$ 0,00");
  });

  it("never contains a NO-BREAK SPACE (char code 160) — only plain ASCII spaces", () => {
    const result = formatBRLFromCents(999999);
    expect(result.includes(String.fromCharCode(160))).toBe(false);
  });
});
