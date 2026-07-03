// hub-mapping.ts — pure functions translating secretarIA hub calendar events
// into this page's demo Appt shape (see _shared/data.ts), and computing the
// ISO week window to fetch/write. Kept separate from page.tsx so the
// conversion is unit-testable and the route entry stays composition-only.
//
// CalendarEventRead only carries {id, summary, start, end} — none of the
// richer demo fields (patient, phone, anamnese, structured type/status) exist
// on the wire yet, so a mapped event is necessarily a lower-fidelity item:
// it shows on the grid with its summary as the display name, a generic type,
// and an "agendado" status.
//
// Write status: CREATE (POST .../appointments) and BLOCK (POST .../blocks)
// are wired for real when hubReady — see page.tsx's createAppt/createBlock,
// which use slotToIsoRange below to turn the modal's day/start/dur into the
// same real-world week slotToIsoRange/currentWeekIsoRange anchor on.
// CANCEL and RESCHEDULE stay on local demo state: GET .../calendar/events
// (CalendarEventRead) carries only the Google event id, never the DB
// Appointment.id that POST .../appointments/{id}/cancel|reschedule require,
// and no hub endpoint maps google_event_id -> Appointment.id. See the
// TODO(hub-write) markers on doReschedule/doCancel in page.tsx.

import type { CalendarEventWire } from "@/lib/secretaria-hub";
import type { Appt } from "../../_shared/data";

// The demo grid has 6 columns, Monday(0)..Saturday(5) — Sunday has no column.
const GRID_DAY_COUNT = 6;

// Returns the Date (local time) for Monday 00:00 of the week containing `now`.
// Shared anchor for currentWeekIsoRange (read) and slotToIsoRange (write) so
// a slot picked in the grid lands in the same week the grid is showing.
function mondayOfWeek(now: Date): Date {
  const day = now.getDay(); // 0=Sun..6=Sat
  // Distance back to Monday: Sunday (0) is 6 days after the prior Monday.
  const diffToMonday = day === 0 ? 6 : day - 1;
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - diffToMonday);
  return monday;
}

// Returns the ISO bounds [monday 00:00, next monday 00:00) of the current
// real-world week, in the browser's local timezone (Date#toISOString below
// converts to UTC on the wire — the hub API takes any parseable ISO datetime).
export function currentWeekIsoRange(now: Date = new Date()): { startIso: string; endIso: string } {
  const monday = mondayOfWeek(now);
  const nextMonday = new Date(monday);
  nextMonday.setDate(monday.getDate() + 7);
  return { startIso: monday.toISOString(), endIso: nextMonday.toISOString() };
}

// Converts a grid slot (day index 0=Monday..5=Saturday, start/dur in minutes
// from midnight — the shape NewApptModal/BlockModal hand back) into ISO
// start/end datetimes for AppointmentCreatePayload/BlockCreatePayload,
// anchored to the SAME Monday currentWeekIsoRange uses for the read fetch.
export function slotToIsoRange(
  day: number,
  startMin: number,
  durMin: number,
  now: Date = new Date(),
): { startIso: string; endIso: string } {
  const monday = mondayOfWeek(now);
  const slotStart = new Date(monday);
  slotStart.setDate(monday.getDate() + day);
  slotStart.setMinutes(slotStart.getMinutes() + startMin);
  const slotEnd = new Date(slotStart);
  slotEnd.setMinutes(slotEnd.getMinutes() + durMin);
  return { startIso: slotStart.toISOString(), endIso: slotEnd.toISOString() };
}

// Maps one hub calendar event onto the demo Appt shape. Returns null for
// Sunday events (no grid column to place them in).
function mapHubEventToAppt(e: CalendarEventWire): Appt | null {
  const start = new Date(e.start);
  const end = new Date(e.end);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const jsDay = start.getDay(); // 0=Sun..6=Sat
  if (jsDay === 0 || jsDay - 1 >= GRID_DAY_COUNT) return null;
  const day = jsDay - 1; // Monday=0 .. Saturday=5

  const startMin = start.getHours() * 60 + start.getMinutes();
  const durMin = Math.max(5, Math.round((end.getTime() - start.getTime()) / 60000));

  return {
    id: "hub-" + e.id,
    day,
    start: startMin,
    dur: durMin,
    patient: e.summary || "Evento sem título",
    type: "Google Calendar",
    status: "agendado",
    anamnese: "—",
    notes: "",
  };
}

// Maps a full list of hub events, dropping anything that can't be placed.
export function mapHubEventsToAppts(events: CalendarEventWire[]): Appt[] {
  const out: Appt[] = [];
  for (const e of events) {
    const mapped = mapHubEventToAppt(e);
    if (mapped) out.push(mapped);
  }
  return out;
}
