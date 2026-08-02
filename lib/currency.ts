// currency.ts — pure currency-formatting helpers shared by (site) billing UI
// (e.g. the "Pré-consultas (PreCheck)" spend line on /app/billing). No React or
// browser APIs here, so it's trivially unit-testable — see
// lib/__tests__/currency.test.ts.

// Intl.NumberFormat sometimes inserts a NO-BREAK SPACE (char code 160) between
// the "R$" symbol and the digits (a known Node/ICU quirk for pt-BR currency
// formatting) — normalized to a plain ASCII space below so callers get a
// deterministic string regardless of the runtime's ICU data.
const NO_BREAK_SPACE = String.fromCharCode(160);

const BRL_FORMATTER = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

// Formats an integer amount of BRL CENTS (Stripe's convention, e.g. the
// `spend.topup_cents` field on GET /billing/precheck/usage) as a pt-BR
// currency string: 12345 -> "R$ 123,45". Non-finite or negative input is
// clamped to zero so a malformed backend payload never renders "R$ NaN" or a
// negative amount.
export function formatBRLFromCents(cents: number): string {
  const safeCents = Number.isFinite(cents) && cents > 0 ? cents : 0;
  const formatted = BRL_FORMATTER.format(safeCents / 100);
  return formatted.split(NO_BREAK_SPACE).join(" ");
}
