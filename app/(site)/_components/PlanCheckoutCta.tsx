"use client";

// PlanCheckoutCta — the interactive "buy" button rendered inside a PriceCard via
// its optional `cta` prop. PriceCard itself stays a pure server component; all
// session checks, both Stripe Checkout calls, and error/pending UI live here.
//
// Two flows share this one button:
// - Session exists (logged-in tenant) → unchanged from before: POST
//   /billing/checkout via createCheckoutSession, then a full-page redirect to
//   the returned Stripe Checkout URL. Admins (no tenant to bill) get an inline
//   notice instead of navigating.
// - No session (anonymous visitor) → open a compact signup modal (name,
//   clinic_name, email, whatsapp), pre-tagged with the card's `catalogIds`.
//   POST /public/signup-intents → POST /public/checkout-sessions → redirect.
//
// Imports PortalShell.css directly (rather than relying on another route to
// have loaded it first) so the reused `.portal-modal-*` classes are always
// available wherever this component renders.
import { useCallback, useState, type CSSProperties, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createCheckoutSession,
  createPublicCheckoutSession,
  createSignupIntent,
  getSession,
  ManageApiError,
  type CatalogAddonId,
  type CatalogPlanId,
} from "@/lib/manage-api";
import { Modal } from "./Modal";
import "./PortalShell.css";

export type PlanCheckoutCtaProps = {
  plan: CatalogPlanId;
  addons?: CatalogAddonId[];
  // Primary button label (e.g. "Contratar PreCheck").
  label: string;
  // Button style — mirrors PriceCard's featured/outline split.
  featured?: boolean;
  // Optional secondary link kept from the card's original static CTA
  // (e.g. "Falar com a Brain" / "Agendar demonstração").
  secondaryHref?: string;
  secondaryLabel?: string;
  // Catalog ids sent as `catalog_ids` on the public signup intent when no
  // session exists. Independent of `plan`/`addons` (the authenticated billing
  // enum) — the anonymous cold-signup flow speaks the broader public catalog.
  catalogIds: string[];
};

// Inline alert style shared by every branch below — mirrors the ssoError pattern
// in app/(site)/app/page.tsx so error copy reads consistently across the app.
const alertStyle: CSSProperties = {
  fontSize: 12.5,
  lineHeight: 1.4,
  color: "var(--danger, #c0392b)",
  margin: "8px 0 0",
};

// Visually-hidden honeypot input style — off-screen rather than display:none
// so simple bots that skip hidden fields still fill it in.
const honeypotStyle: CSSProperties = {
  position: "absolute",
  left: -9999,
  width: 1,
  height: 1,
  opacity: 0,
};

// Signup-modal form field state.
type SignupFields = {
  name: string;
  clinicName: string;
  email: string;
  whatsapp: string;
  website: string; // honeypot — must stay empty
};

const EMPTY_FIELDS: SignupFields = {
  name: "",
  clinicName: "",
  email: "",
  whatsapp: "",
  website: "",
};

export function PlanCheckoutCta({
  plan,
  addons,
  label,
  featured,
  secondaryHref,
  secondaryLabel,
  catalogIds,
}: PlanCheckoutCtaProps) {
  const router = useRouter();

  // --- Authenticated (tenant) checkout state ---
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminNotice, setAdminNotice] = useState(false);

  // --- Anonymous signup-modal state ---
  const [modalOpen, setModalOpen] = useState(false);
  const [fields, setFields] = useState<SignupFields>(EMPTY_FIELDS);
  const [submitting, setSubmitting] = useState(false);
  const [signupError, setSignupError] = useState<string | null>(null);
  const [showLoginLink, setShowLoginLink] = useState(false);

  function updateField(key: keyof SignupFields, value: string) {
    setFields((prev) => ({ ...prev, [key]: value }));
  }

  function openModal() {
    setFields(EMPTY_FIELDS);
    setSignupError(null);
    setShowLoginLink(false);
    setModalOpen(true);
  }

  // Stable reference: Modal's focus effect depends on `onClose`, so an inline
  // function here would re-focus the dialog card on every keystroke (each
  // `fields` update re-renders this component and would mint a new callback),
  // yanking focus out of the input being typed into.
  const closeModal = useCallback(() => {
    if (submitting) return; // don't let Esc/overlay abandon an in-flight submit
    setModalOpen(false);
  }, [submitting]);

  async function handleClick() {
    setError(null);
    setAdminNotice(false);

    const session = getSession();
    if (!session) {
      // No account yet — the self-service signup modal replaces the old
      // redirect-to-/login behavior for anonymous visitors.
      openModal();
      return;
    }
    if (session.role === "admin") {
      // Admin accounts are platform-level and own no tenant — nothing to bill.
      setAdminNotice(true);
      return;
    }
    if (!session.tenantId) {
      router.push("/login");
      return;
    }

    setPending(true);
    try {
      const url = await createCheckoutSession(session, plan, addons);
      window.location.assign(url);
      // Leave `pending` true — the browser is navigating away to Stripe.
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      setError(
        status === 503
          ? "Cobrança ainda não configurada. Fale com a Brain."
          : status === 422
            ? "Plano indisponível no momento."
            : "Não foi possível iniciar o checkout. Tente novamente.",
      );
      setPending(false);
    }
  }

  async function handleSignupSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSignupError(null);
    setShowLoginLink(false);
    setSubmitting(true);
    try {
      const { intent_id } = await createSignupIntent({
        name: fields.name.trim(),
        clinic_name: fields.clinicName.trim(),
        email: fields.email.trim(),
        whatsapp_phone: fields.whatsapp.trim(),
        catalog_ids: catalogIds,
        website: fields.website, // honeypot — stays empty for real visitors
      });
      const { checkout_url } = await createPublicCheckoutSession(intent_id);
      window.location.assign(checkout_url);
      // Leave `submitting` true — the browser is navigating away to Stripe.
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      if (status === 409) {
        setSignupError("Você já tem conta Brain — entre para contratar.");
        setShowLoginLink(true);
      } else if (status === 503) {
        setSignupError("Cobrança ainda não configurada. Fale com a Brain.");
      } else if (status === 422) {
        setSignupError("Não foi possível validar os dados. Confira e tente novamente.");
      } else {
        setSignupError("Não foi possível continuar agora. Tente novamente.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        className={"btn btn--block" + (featured ? " btn--primary" : " btn--outline")}
        onClick={handleClick}
        disabled={pending}
      >
        {pending ? "Abrindo checkout…" : label}
      </button>

      {secondaryHref && secondaryLabel && (
        <Link
          href={secondaryHref}
          className="btn btn--ghost btn--block btn--sm"
          style={{ marginTop: 8 }}
        >
          {secondaryLabel}
        </Link>
      )}

      {adminNotice && (
        <p role="alert" style={alertStyle}>
          Entre com a conta da clínica para contratar.
        </p>
      )}
      {error && (
        <p role="alert" style={alertStyle}>
          {error}
        </p>
      )}

      {/* Anonymous cold-signup modal — name/clinic/email/whatsapp, then off to
          Stripe Checkout for the intent's catalog_ids. */}
      <Modal open={modalOpen} title={label} onClose={closeModal}>
        <form onSubmit={handleSignupSubmit}>
          <label className="field-l">
            <span>Nome</span>
            <input
              className="input"
              type="text"
              placeholder="Dr. Aurélio Lima"
              value={fields.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </label>

          <label className="field-l mt-m">
            <span>Clínica</span>
            <input
              className="input"
              type="text"
              placeholder="Consultório Dr. Aurélio Lima"
              value={fields.clinicName}
              onChange={(e) => updateField("clinicName", e.target.value)}
              required
            />
          </label>

          <label className="field-l mt-m">
            <span>E-mail</span>
            <input
              className="input"
              type="email"
              placeholder="voce@clinica.com.br"
              value={fields.email}
              onChange={(e) => updateField("email", e.target.value)}
              required
            />
          </label>

          <label className="field-l mt-m">
            <span>WhatsApp</span>
            <input
              className="input"
              type="tel"
              placeholder="(11) 91234-5678"
              value={fields.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              required
            />
          </label>

          {/* Honeypot — real visitors never see or fill this field. */}
          <input
            type="text"
            name="website"
            value={fields.website}
            onChange={(e) => updateField("website", e.target.value)}
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            style={honeypotStyle}
          />

          {signupError && (
            <p role="alert" style={{ ...alertStyle, marginTop: 14 }}>
              {signupError}
              {showLoginLink && (
                <>
                  {" "}
                  <Link href="/login">Entrar</Link>
                </>
              )}
            </p>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={closeModal}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn btn--primary"
              style={{ flex: 1 }}
              disabled={submitting}
            >
              {submitting ? "Processando…" : "Ir para pagamento"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
