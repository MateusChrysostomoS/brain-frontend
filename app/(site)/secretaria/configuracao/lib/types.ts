// types.ts — domain types for the Configuração page.
// All state shapes are declared here to keep components clean and
// allow TypeScript to catch mismatches across the prop chain.

// ---------------------------------------------------------------------------
// Section 01 — Clinic context
// ---------------------------------------------------------------------------

export type ClinicCtx = {
  clinicName: string;
  // Structured clinic address — fed to the agent for "onde fica?" replies and
  // booking confirmations. REAL as of the Onboarding & Multi-Professional
  // contract (secretaria TenantConfigWire.address) — wired via hub-mapping.ts.
  addressLine: string;       // street + number, e.g. "Av. Paulista, 1000"
  addressComplement: string; // suite/floor, e.g. "Sala 302" (optional)
  neighborhood: string;      // bairro
  city: string;
  state: string;             // UF, e.g. "SP"
  postalCode: string;        // CEP
  // demo-only: TenantConfigUpdate still has no clinic 'phone' field.
  phone: string;
  // Accepted health-insurance plan names, comma-separated in the UI. REAL —
  // wired to TenantConfigWire.insurances (string[] on the wire).
  insurances: string;
  // When on, SecretarIA asks the patient whether they have a convênio (health
  // plan) during booking and which one — patient PII, minimized per LGPD.
  // REAL — wired to TenantConfigWire.collect_insurance.
  collectInsurance: boolean;
};

// ---------------------------------------------------------------------------
// Section 02 — Messages (greeting/persona copy the bot uses)
// ---------------------------------------------------------------------------

// Every field here already existed on secretarIA's wire (TenantConfigWire) —
// this section is the first UI for them, not a new backend surface.
export type Messages = {
  greetingMessage: string;
  returningGreetingMessage: string;
  // Short quick-reply labels shown as WhatsApp buttons — capped at 3.
  greetingButtons: string[];
  // Free-text tone/behavior rules — this REPLACES the old demo-only
  // ClinicCtx.tone field (that never round-tripped); persona_notes is a real
  // wire field, so it now carries the same "how should the bot talk" intent.
  personaNotes: string;
  language: string;
};

// ---------------------------------------------------------------------------
// Section 03 — Professionals
// ---------------------------------------------------------------------------

// The selected professional's own profile fields — REMOVED from ClinicCtx
// (clinic-level specialty/about) in favor of per-professional (contract §10:
// secretaria `professionals` gained specialty/about/context_doctor_message).
export type ProfessionalProfile = {
  specialty: string;
  about: string;
  contextDoctorMessage: string;
};

export const EMPTY_PROFESSIONAL_PROFILE: ProfessionalProfile = {
  specialty: "",
  about: "",
  contextDoctorMessage: "",
};

// ---------------------------------------------------------------------------
// Section 04 — Services (appointment types) — now edited per-professional
// ---------------------------------------------------------------------------

// A single pre-visit instruction for an appointment type — e.g. fasting,
// prior exams, or documents the patient must bring. Maps to a row of the
// backend appointment_type_requirements table.
export type Requirement = {
  id: number;
  text: string;
};

export type Service = {
  id: number;
  name: string;
  dur: number;    // duration in minutes
  price: string;  // free-text, e.g. "R$ 450" or ""
  active: boolean; // when false, SecretarIA won't offer this appointment type
  // Pre-visit requirements SecretarIA surfaces when this type is being booked.
  requirements: Requirement[];
};

// ---------------------------------------------------------------------------
// Section 05 — Availability — now edited per-professional
// ---------------------------------------------------------------------------

export type TimeRange = {
  start: number; // minutes from midnight
  end: number;   // minutes from midnight
};

export type DayConfig = {
  key: string;    // "seg" | "ter" | …
  label: string;  // "Segunda" | "Terça" | …
  on: boolean;    // whether this day is active
  ranges: TimeRange[];
};

export type Prefs = {
  defaultDur: number; // minutes — stays TENANT-level (appointment_duration_min)
  gap: number;        // minutes between appointments (demo-only)
  lead: number;       // hours of minimum advance notice (demo-only)
};

// ---------------------------------------------------------------------------
// Section 06 — Google Calendar (tenant-level; unchanged single-professional path)
// ---------------------------------------------------------------------------

export type GcalState = {
  connected: boolean;
  email: string;
  calendar: string;
  tz: string;
  twoWay: boolean;
};
