// types.ts — domain types for the Configuração page.
// All state shapes are declared here to keep components clean and
// allow TypeScript to catch mismatches across the prop chain.

// ---------------------------------------------------------------------------
// Section 01 — Clinic context
// ---------------------------------------------------------------------------

export type ClinicCtx = {
  clinicName: string;
  // demo-only: TenantConfigUpdate (secretarIA schemas/config.py) has no
  // 'specialty' field — this never round-trips to the backend.
  specialty: string;
  // demo-only: no 'about'/persona field on TenantConfigUpdate. Do NOT fold
  // this into persona_notes implicitly — that field exists but is unrelated
  // UI (greeting/persona copy), not wired to this page at all.
  about: string;
  // Structured clinic address — intended for SecretarIA to read it out
  // ("onde fica?") and include it in booking confirmations, but this is
  // ASPIRATIONAL: TenantConfigUpdate (secretarIA schemas/config.py) has no
  // address fields at all (no address_line/complement/neighborhood/city/
  // state/postal_code). demo-only until secretarIA adds them.
  addressLine: string;       // street + number, e.g. "Av. Paulista, 1000"
  addressComplement: string; // suite/floor, e.g. "Sala 302" (optional)
  neighborhood: string;      // bairro
  city: string;
  state: string;             // UF, e.g. "SP"
  postalCode: string;        // CEP
  // demo-only: TenantConfigUpdate has no clinic 'phone' field.
  phone: string;
  // demo-only: TenantConfigUpdate has no 'insurances' field.
  insurances: string;        // accepted plans the clinic works with (comma-separated)
  // When on, SecretarIA asks the patient whether they have a convênio (health
  // plan) during booking and which one — patient PII, minimized per LGPD.
  // demo-only: no corresponding TenantConfigUpdate flag either.
  collectInsurance: boolean;
  // demo-only: TenantConfigUpdate has no 'tone' field.
  tone: string;
};

// ---------------------------------------------------------------------------
// Section 02 — Services (appointment types)
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
// Section 03 — Availability
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
  defaultDur: number; // minutes
  gap: number;        // minutes between appointments
  lead: number;       // hours of minimum advance notice
};

// ---------------------------------------------------------------------------
// Section 04 — Google Calendar
// ---------------------------------------------------------------------------

export type GcalState = {
  connected: boolean;
  email: string;
  calendar: string;
  tz: string;
  twoWay: boolean;
};
