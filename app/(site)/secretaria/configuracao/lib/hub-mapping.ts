// hub-mapping.ts — pure functions translating between secretarIA hub wire
// shapes (lib/secretaria-hub.ts, snake_case, English weekday keys) and this
// page's local state shapes (lib/types.ts, "seg".."dom" keys, minutes-from-
// midnight ranges). Kept separate from page.tsx so the conversion logic is
// unit-testable and the route entry stays composition-only.

import type {
  AddressWire,
  AppointmentTypeWire,
  ProfessionalConfigUpdatePayload,
  ProfessionalWire,
  TenantConfigUpdatePayload,
  TenantConfigWire,
  TimeWindowWire,
} from "@/lib/secretaria-hub";
import type {
  ClinicCtx,
  DayConfig,
  Messages,
  ProfessionalProfile,
  Service,
  TimeRange,
} from "./types";

// Weekday key mapping: wire uses full English lowercase names, the local UI
// uses 3-letter Portuguese abbreviations (see the WD seed in page.tsx).
const WIRE_TO_LOCAL_DAY: Record<string, string> = {
  monday: "seg",
  tuesday: "ter",
  wednesday: "qua",
  thursday: "qui",
  friday: "sex",
  saturday: "sab",
  sunday: "dom",
};
const LOCAL_TO_WIRE_DAY: Record<string, string> = Object.fromEntries(
  Object.entries(WIRE_TO_LOCAL_DAY).map(([wire, local]) => [local, wire]),
);

// "HH:MM" -> minutes from midnight.
function hhmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

// minutes from midnight -> "HH:MM".
function minutesToHhmm(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

// Applies the wire business_hours onto the existing days array (preserving
// each day's key/label/order), turning "HH:MM" windows into minute ranges and
// setting `on` based on whether the weekday has at least one window.
export function applyWireBusinessHours(
  wire: Record<string, TimeWindowWire[]>,
  currentDays: DayConfig[],
): DayConfig[] {
  return currentDays.map((day) => {
    const wireKey = LOCAL_TO_WIRE_DAY[day.key];
    const windows = wireKey ? wire[wireKey] : undefined;
    if (!windows) return day; // absent from the response — keep the demo default
    return {
      ...day,
      on: windows.length > 0,
      ranges: windows.map(
        (w): TimeRange => ({ start: hhmmToMinutes(w.start), end: hhmmToMinutes(w.end) }),
      ),
    };
  });
}

// Inverse of applyWireBusinessHours — builds the wire business_hours object
// from the local days state, ready to send in a professional config PUT body.
export function toWireBusinessHours(
  days: DayConfig[],
): Record<string, TimeWindowWire[]> {
  const out: Record<string, TimeWindowWire[]> = {};
  for (const day of days) {
    const wireKey = LOCAL_TO_WIRE_DAY[day.key];
    if (!wireKey || !day.on) continue; // closed days are simply absent
    out[wireKey] = day.ranges.map((r) => ({
      start: minutesToHhmm(r.start),
      end: minutesToHhmm(r.end),
    }));
  }
  return out;
}

// Wire appointment_types -> local Service[]. Requirements have no backend
// counterpart yet (see schemas/config.py::AppointmentType) — hydrated
// services always start with an empty requirements list.
export function applyWireAppointmentTypes(wire: AppointmentTypeWire[]): Service[] {
  return wire.map((t, i) => ({
    id: i + 1,
    name: t.name,
    dur: t.duration_min,
    price: t.price ?? "",
    active: t.is_active,
    requirements: [],
  }));
}

// Local Service[] -> wire appointment_types, for a config PUT body.
export function toWireAppointmentTypes(services: Service[]): AppointmentTypeWire[] {
  return services.map((s, i) => ({
    name: s.name,
    description: null,
    duration_min: s.dur,
    is_active: s.active,
    sort_order: i,
    price: s.price || null,
    long_description: null,
  }));
}

// ---------------------------------------------------------------------------
// Address (Feature 1) — structured clinic address, tenant-level, REAL wire field.
// ---------------------------------------------------------------------------

type AddressFieldsOfCtx = Pick<
  ClinicCtx,
  "addressLine" | "addressComplement" | "neighborhood" | "city" | "state" | "postalCode"
>;

// Builds the wire address payload from the local address fields. Returns null
// when every field is blank, so an untouched address never sends an empty
// object that would overwrite a previously saved one with blanks.
export function toWireAddress(ctx: AddressFieldsOfCtx): AddressWire | null {
  const { addressLine, addressComplement, neighborhood, city, state, postalCode } = ctx;
  if (!addressLine && !addressComplement && !neighborhood && !city && !state && !postalCode) {
    return null;
  }
  return {
    line: addressLine || null,
    complement: addressComplement || null,
    neighborhood: neighborhood || null,
    city: city || null,
    state: state || null,
    postal_code: postalCode || null,
  };
}

// Wire address -> local address fields (blank strings for absent parts).
export function applyWireAddress(wire: AddressWire | null): AddressFieldsOfCtx {
  return {
    addressLine: wire?.line ?? "",
    addressComplement: wire?.complement ?? "",
    neighborhood: wire?.neighborhood ?? "",
    city: wire?.city ?? "",
    state: wire?.state ?? "",
    postalCode: wire?.postal_code ?? "",
  };
}

// ---------------------------------------------------------------------------
// Insurances (Feature 3) — comma-separated in the UI, string[] on the wire.
// ---------------------------------------------------------------------------

export function toWireInsurances(insurancesCsv: string): string[] | null {
  const items = insurancesCsv
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export function applyWireInsurances(wire: string[] | null): string {
  return (wire ?? []).join(", ");
}

// ---------------------------------------------------------------------------
// Messages (new "Mensagens" section) — every field already existed on the
// wire; this is the first UI wiring them up.
// ---------------------------------------------------------------------------

export function applyWireMessages(cfg: TenantConfigWire): Messages {
  return {
    greetingMessage: cfg.greeting_message ?? "",
    returningGreetingMessage: cfg.returning_greeting_message ?? "",
    greetingButtons: cfg.greeting_buttons ?? [],
    personaNotes: cfg.persona_notes ?? "",
    language: cfg.language || "pt-BR",
  };
}

// ---------------------------------------------------------------------------
// Professional profile (specialty/about/context_doctor_message) — moved out
// of ClinicCtx and onto the per-professional config PUT.
// ---------------------------------------------------------------------------

export function applyWireProfessionalProfile(p: ProfessionalWire): ProfessionalProfile {
  return {
    specialty: p.specialty ?? "",
    about: p.about ?? "",
    contextDoctorMessage: p.context_doctor_message ?? "",
  };
}

// ---------------------------------------------------------------------------
// PUT payload builders
// ---------------------------------------------------------------------------

// Builds the PUT /tenants/me/config payload — TENANT-level fields only:
// Mensagens (greeting/persona/language), address/insurances/collect_insurance
// (Feature 1/3), and appointment_duration_min (the one scheduling preference
// that stayed tenant-level; business_hours/appointment_types moved to the
// per-professional PUT below). `gap`/`lead` (Prefs) have no wire counterpart
// at all and are NOT sent — see the comment on Prefs in lib/types.ts.
export function buildConfigUpdatePayload(
  ctx: ClinicCtx,
  messages: Messages,
  defaultDurationMin: number,
): TenantConfigUpdatePayload {
  return {
    appointment_duration_min: defaultDurationMin,
    address: toWireAddress(ctx),
    insurances: toWireInsurances(ctx.insurances),
    collect_insurance: ctx.collectInsurance,
    greeting_message: messages.greetingMessage || null,
    returning_greeting_message: messages.returningGreetingMessage || null,
    greeting_buttons: messages.greetingButtons,
    persona_notes: messages.personaNotes || null,
    language: messages.language,
  };
}

// Builds the PUT /tenants/me/professionals/{id}/config payload for the
// SELECTED professional: their hours, services, and profile fields (Feature
// C4/E — "their hours/services/specialty/about/context").
export function buildProfessionalConfigPayload(
  days: DayConfig[],
  services: Service[],
  profile: ProfessionalProfile,
): ProfessionalConfigUpdatePayload {
  return {
    business_hours: toWireBusinessHours(days),
    appointment_types: toWireAppointmentTypes(services),
    specialty: profile.specialty || null,
    about: profile.about || null,
    context_doctor_message: profile.contextDoctorMessage || null,
  };
}
