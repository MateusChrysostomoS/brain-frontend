// Pure logic behind the "E-mail da clínica" card on /admin/tenants?id=… , kept out of the
// component so it is testable in vitest's node environment (no jsdom here).
// Contract: GET/PATCH /admin/tenants/{id}/contact-email (brain-api; the value lives in the
// secretarIA). Same split as ./professional-capacity: the server stays the authority,
// this only answers before the round-trip and words the failures.

import { ManageApiError } from "@/lib/manage-api";

const INVALID_EMAIL_TEXT = "Digite um e-mail válido, como contato@clinica.com.br.";

// Pragmatic shape check, not RFC 5322: one "@", no spaces, a dotted domain with no empty
// label. brain-api answers 422 invalid_contact_email for anything this lets through.
const EMAIL_SHAPE = /^[^\s@,;]+@[^\s@,;]+$/;

export type ContactEmailInputResult =
  | { ok: true; value: string | null }
  | { ok: false; error: string };

// Trim + lowercase, same normalisation the server applies. Empty means "clear" (null).
export function parseContactEmailInput(raw: string): ContactEmailInputResult {
  const text = raw.trim().toLowerCase();
  if (text === "") return { ok: true, value: null };
  if (text.length > 254 || !EMAIL_SHAPE.test(text)) return { ok: false, error: INVALID_EMAIL_TEXT };
  const domain = text.slice(text.indexOf("@") + 1);
  const labels = domain.split(".");
  if (labels.length < 2 || labels.some((label) => label === "")) {
    return { ok: false, error: INVALID_EMAIL_TEXT };
  }
  return { ok: true, value: text };
}

// Drives the disabled state of "Salvar e-mail". A draft that does not parse counts as
// changed on purpose: the button stays usable so submitting shows the reason.
export function contactEmailChanged(raw: string, saved: string | null): boolean {
  const parsed = parseContactEmailInput(raw);
  if (!parsed.ok) return true;
  return parsed.value !== saved;
}

export function describeCurrentContactEmail(email: string | null): string {
  return email ?? "Nenhum e-mail cadastrado — a clínica não recebe avisos por e-mail";
}

// Same verb as the button ("Salvar e-mail" -> "E-mail salvo").
export function describeContactEmailSaved(email: string | null): string {
  return email === null ? "E-mail removido" : "E-mail salvo";
}

// The clinic exists in brain-api but has no secretarIA record (e.g. PreCheck-only):
// there is nothing to edit, so the card swaps the form for an explanation.
export function isSecretariaRecordMissing(error: unknown): boolean {
  return (
    error instanceof ManageApiError &&
    error.status === 404 &&
    error.message === "secretaria_tenant_not_found"
  );
}

export const SECRETARIA_RECORD_MISSING_TEXT =
  "Esta clínica ainda não existe na secretarIA, então não há e-mail para cadastrar.";

function describeKnownFailure(error: unknown): string | null {
  if (error instanceof ManageApiError) {
    if (isSecretariaRecordMissing(error)) return SECRETARIA_RECORD_MISSING_TEXT;
    if (error.status === 404) return "Clínica não encontrada.";
    if (error.status === 422) {
      return "O servidor não aceitou esse e-mail. Confira o endereço e tente de novo.";
    }
    if (error.status === 502) {
      return "Não foi possível falar com a secretarIA agora. Tente de novo em instantes.";
    }
    if (error.status === 403) return "Você não tem permissão para esta ação.";
  }
  return null;
}

export function describeContactEmailError(error: unknown): string {
  return describeKnownFailure(error) ?? "Não foi possível salvar. Tente novamente.";
}

// Same reasons as saving, for the first read of the card.
export function describeContactEmailLoadError(error: unknown): string {
  return describeKnownFailure(error) ?? "Não foi possível carregar o e-mail. Tente novamente.";
}
