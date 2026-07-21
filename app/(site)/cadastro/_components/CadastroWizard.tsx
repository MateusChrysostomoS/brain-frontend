"use client";

// CadastroWizard — owns all step state and the branching transition table for
// the /cadastro flow (Feature 0). Steps are pushed onto a history stack on
// every forward move so "Voltar" always returns to the exact previous step,
// including the two conditional guided screens.

import { useState } from "react";
import { WizardShell } from "./WizardShell";
import { ContactStep } from "./ContactStep";
import { WhatsappUsageStep } from "./WhatsappUsageStep";
import { DedicatedNumberGuide } from "./DedicatedNumberGuide";
import { PriorApiStep } from "./PriorApiStep";
import { FacebookPageStep } from "./FacebookPageStep";
import { PageCreationGuide } from "./PageCreationGuide";
import { SummaryStep } from "./SummaryStep";
import { EMPTY_ANSWERS, type StepId, type WizardAnswers } from "../lib/types";
import type { ResolvedPlan } from "../lib/plans";

// Ordinal position per step, used only for the progress bar (0..6). Branches
// that skip a conditional screen simply jump two positions instead of one —
// a minor visual jump, not worth a fully dynamic step count.
const PROGRESS: Record<StepId, number> = {
  contact: 0,
  usage: 1,
  dedicated_number: 2,
  prior_api: 3,
  fb_page: 4,
  page_creation: 5,
  summary: 6,
};
const LAST_INDEX = 6;

const PROGRESS_LABEL: Record<StepId, string> = {
  contact: "Dados de contato",
  usage: "Uso do WhatsApp",
  dedicated_number: "Número dedicado",
  prior_api: "Histórico do número",
  fb_page: "Página no Facebook",
  page_creation: "Criar Página",
  summary: "Revisão",
};

// The branching transition table (spec §A): Q1 "none" detours through the
// dedicated-number guide; Q4 "no" detours through the page-creation guide.
function nextStepId(current: StepId, answers: WizardAnswers): StepId {
  switch (current) {
    case "contact":
      return "usage";
    case "usage":
      return answers.whatsappUsage === "none" ? "dedicated_number" : "prior_api";
    case "dedicated_number":
      return "prior_api";
    case "prior_api":
      return "fb_page";
    case "fb_page":
      return answers.fbPage === "no" ? "page_creation" : "summary";
    case "page_creation":
    case "summary":
      return "summary";
  }
}

type CadastroWizardProps = {
  plan: ResolvedPlan;
};

export function CadastroWizard({ plan }: CadastroWizardProps) {
  const [answers, setAnswers] = useState<WizardAnswers>(EMPTY_ANSWERS);
  const [step, setStep] = useState<StepId>("contact");
  const [history, setHistory] = useState<StepId[]>([]);

  function goNext() {
    setHistory((h) => [...h, step]);
    setStep(nextStepId(step, answers));
  }

  function goBack() {
    if (history.length === 0) return;
    setStep(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
  }

  function patchContact(patch: Partial<WizardAnswers["contact"]>) {
    setAnswers((a) => ({ ...a, contact: { ...a.contact, ...patch } }));
  }

  return (
    <WizardShell progress={PROGRESS[step] / LAST_INDEX} progressLabel={PROGRESS_LABEL[step]}>
      {step === "contact" && (
        <ContactStep
          value={answers.contact}
          onChange={patchContact}
          planLabel={plan.label}
          planTagline={plan.tagline}
          onNext={goNext}
        />
      )}
      {step === "usage" && (
        <WhatsappUsageStep
          value={answers.whatsappUsage}
          onChange={(v) => setAnswers((a) => ({ ...a, whatsappUsage: v }))}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === "dedicated_number" && <DedicatedNumberGuide onNext={goNext} onBack={goBack} />}
      {step === "prior_api" && (
        <PriorApiStep
          value={answers.priorApi}
          onChange={(v) => setAnswers((a) => ({ ...a, priorApi: v }))}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === "fb_page" && (
        <FacebookPageStep
          value={answers.fbPage}
          onChange={(v) => setAnswers((a) => ({ ...a, fbPage: v }))}
          onNext={goNext}
          onBack={goBack}
        />
      )}
      {step === "page_creation" && <PageCreationGuide onNext={goNext} onBack={goBack} />}
      {step === "summary" && <SummaryStep answers={answers} plan={plan} onBack={goBack} />}
    </WizardShell>
  );
}
