// types.ts — local state shapes for the /cadastro wizard. Kept separate from
// the step components so CadastroWizard's state machine and each step's props
// stay easy to read.

import type {
  SignupIntakeFbPage,
  SignupIntakePriorApi,
  SignupIntakeWhatsappUsage,
} from "@/lib/manage-api";

export type ContactFields = {
  name: string;
  clinicName: string;
  email: string;
  whatsappPhone: string;
  // The password the visitor chooses on this first card — the account is registered
  // (and the visitor logged in) the moment this step is submitted, so they can log
  // back in later regardless of whether they finish the wizard or pay.
  password: string;
  confirmPassword: string;
  // Honeypot — always empty for real visitors (see ContactStep).
  website: string;
};

export const EMPTY_CONTACT: ContactFields = {
  name: "",
  clinicName: "",
  email: "",
  whatsappPhone: "",
  password: "",
  confirmPassword: "",
  website: "",
};

// Every step the wizard can visit. `dedicated_number` and `page_creation` are
// conditional guided screens — see CadastroWizard's transition table.
export type StepId =
  | "contact"
  | "usage"
  | "dedicated_number"
  | "prior_api"
  | "fb_page"
  | "page_creation"
  | "summary";

export type WizardAnswers = {
  contact: ContactFields;
  whatsappUsage: SignupIntakeWhatsappUsage | null;
  priorApi: SignupIntakePriorApi | null;
  fbPage: SignupIntakeFbPage | null;
};

export const EMPTY_ANSWERS: WizardAnswers = {
  contact: EMPTY_CONTACT,
  whatsappUsage: null,
  priorApi: null,
  fbPage: null,
};
