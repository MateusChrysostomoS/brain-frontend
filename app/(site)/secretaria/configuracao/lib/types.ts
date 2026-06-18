// types.ts — domain types for the Configuração page.
// All state shapes are declared here to keep components clean and
// allow TypeScript to catch mismatches across the prop chain.

// ---------------------------------------------------------------------------
// Section 01 — Clinic context
// ---------------------------------------------------------------------------

export type ClinicCtx = {
  clinicName: string;
  specialty: string;
  about: string;
  address: string;
  phone: string;
  insurances: string;
  tone: string;
};

// ---------------------------------------------------------------------------
// Section 02 — Services
// ---------------------------------------------------------------------------

export type Service = {
  id: number;
  name: string;
  dur: number;   // duration in minutes
  price: string; // free-text, e.g. "R$ 450" or ""
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
