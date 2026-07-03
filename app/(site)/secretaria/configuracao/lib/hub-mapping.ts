// hub-mapping.ts — pure functions translating between secretarIA hub wire
// shapes (lib/secretaria-hub.ts, snake_case, English weekday keys) and this
// page's local state shapes (lib/types.ts, "seg".."dom" keys, minutes-from-
// midnight ranges). Kept separate from page.tsx so the conversion logic is
// unit-testable and the route entry stays composition-only.

import type {
  AppointmentTypeWire,
  TimeWindowWire,
  TenantConfigUpdatePayload,
} from "@/lib/secretaria-hub";
import type { DayConfig, Service, TimeRange } from "./types";

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
// from the local days state, ready to send in a PUT /tenants/me/config body.
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

// Local Service[] -> wire appointment_types, for the PUT body.
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

// Builds the PUT /tenants/me/config payload from the fields the Configuração
// page can confidently round-trip. Two omission directions:
//   1. Wire fields with no local UI counterpart yet (greeting_message,
//      persona_notes, language, google_calendar_id, ...) are omitted so a
//      save never clobbers them with a demo default.
//   2. Local UI fields with no wire counterpart at all — ClinicCtx's
//      specialty/about/address*/phone/insurances/collectInsurance/tone, and
//      Prefs' gap/lead — are demo-only (see lib/types.ts) and simply have
//      nowhere to go; they are NOT dropped into persona_notes or any other
//      field.
export function buildConfigUpdatePayload(
  days: DayConfig[],
  services: Service[],
  defaultDurationMin: number,
): TenantConfigUpdatePayload {
  return {
    business_hours: toWireBusinessHours(days),
    appointment_types: toWireAppointmentTypes(services),
    appointment_duration_min: defaultDurationMin,
  };
}
