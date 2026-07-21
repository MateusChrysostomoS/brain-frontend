"use client";

// SummaryStep — Step 5: review + submit. Creates the signup intent (with the
// collected `intake`), starts the Stripe Checkout session for it, and
// redirects. Mirrors PlanCheckoutCta's former anonymous-signup-modal flow —
// same error branches (409 existing account, 503 price not configured, 422
// validation, honeypot passthrough). Also renders CheckoutTrialNotice right
// above the submit button — this is the cold-signup funnel's last screen
// before Stripe's hosted Checkout page, so the billing/trial disclosure must
// be visible here. Passes `plan.catalogIds` (the wizard's actual selection)
// so the notice renders nothing for a PreCheck-only signup.

import { useState } from "react";
import Link from "next/link";
import { StepHeading, StepActions } from "./WizardShell";
import {
  createPublicCheckoutSession,
  createSignupIntent,
  ManageApiError,
} from "@/lib/manage-api";
import { CheckoutTrialNotice } from "../../_components/CheckoutTrialNotice";
import type { ResolvedPlan } from "../lib/plans";
import type { WizardAnswers } from "../lib/types";

const USAGE_LABEL: Record<string, string> = {
  business_7d_plus: "Já uso há mais de 7 dias",
  business_recent: "Comecei a usar recentemente",
  none: "Ainda não uso — vou dedicar um número novo",
};
const PRIOR_API_LABEL: Record<string, string> = {
  yes: "Sim, já foi usado com outra API",
  no: "Não, nunca foi usado com uma API",
  unknown: "Não sei dizer",
};
const FB_PAGE_LABEL: Record<string, string> = {
  yes_admin: "Sim, sou administrador(a)",
  yes_unknown_admin: "Sim, mas não sei se sou administrador(a)",
  no: "Ainda não tenho uma Página",
};

type SummaryStepProps = {
  answers: WizardAnswers;
  plan: ResolvedPlan;
  onBack: () => void;
};

export function SummaryStep({ answers, plan, onBack }: SummaryStepProps) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showLoginLink, setShowLoginLink] = useState(false);

  async function handleSubmit() {
    setError(null);
    setShowLoginLink(false);
    setSubmitting(true);
    try {
      const { intent_id } = await createSignupIntent({
        name: answers.contact.name.trim(),
        clinic_name: answers.contact.clinicName.trim(),
        email: answers.contact.email.trim(),
        whatsapp_phone: answers.contact.whatsappPhone.trim(),
        catalog_ids: plan.catalogIds,
        website: answers.contact.website,
        intake: {
          whatsapp_usage: answers.whatsappUsage!,
          prior_api: answers.priorApi!,
          fb_page: answers.fbPage!,
        },
      });
      const { checkout_url } = await createPublicCheckoutSession(intent_id);
      window.location.assign(checkout_url);
      // Leave `submitting` true — the browser is navigating away to Stripe.
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      if (status === 409) {
        setError("Você já tem conta Brain — entre para contratar.");
        setShowLoginLink(true);
      } else if (status === 503) {
        setError("Cobrança ainda não configurada. Fale com a Brain.");
      } else if (status === 422) {
        setError("Não foi possível validar os dados. Confira e tente novamente.");
      } else {
        setError("Não foi possível continuar agora. Tente novamente.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div>
      <StepHeading title="Confira e finalize." desc="Revise seus dados antes de ir para o pagamento." />

      <div style={{ marginBottom: 4 }}>
        <Row label="Plano" value={`${plan.label} · ${plan.tagline}`} />
        <Row label="Nome" value={answers.contact.name} />
        <Row label="Clínica" value={answers.contact.clinicName} />
        <Row label="E-mail" value={answers.contact.email} />
        <Row label="WhatsApp" value={answers.contact.whatsappPhone} />
        <Row label="Uso do WhatsApp Business App" value={USAGE_LABEL[answers.whatsappUsage ?? ""] ?? "—"} />
        <Row label="Número usado com API antes" value={PRIOR_API_LABEL[answers.priorApi ?? ""] ?? "—"} />
        <Row label="Página no Facebook" value={FB_PAGE_LABEL[answers.fbPage ?? ""] ?? "—"} />
      </div>

      {error && (
        <p role="alert" style={{ fontSize: 12.5, color: "var(--danger, #c0392b)", marginTop: 16 }}>
          {error}
          {showLoginLink && (
            <>
              {" "}
              <Link href="/login">Entrar</Link>
            </>
          )}
        </p>
      )}

      {/* Pre-checkout billing disclosure — this submit creates the signup
          intent + Stripe Checkout session and redirects straight there.
          Renders nothing for a PreCheck-only selection (see
          catalogRequiresWhatsappCoexistence). */}
      <CheckoutTrialNotice catalogIds={plan.catalogIds} />

      <StepActions
        onBack={onBack}
        onNext={handleSubmit}
        nextLabel={submitting ? "Processando…" : "Ir para pagamento"}
        nextDisabled={submitting}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="cad-summary-row">
      <span className="cad-summary-label">{label}</span>
      <span className="cad-summary-value">{value}</span>
    </div>
  );
}
