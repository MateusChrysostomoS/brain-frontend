// calendar-status.ts — what the "Agenda no Google Calendar" card on
// /doctor/perfil should say and offer, as a pure function.
//
// WHY IT IS A FUNCTION AND NOT JUST JSX
// -------------------------------------
// The card used to read `myHubProfessional.calendar_connected`. The backend has
// never sent that key — its response model carries `has_calendar` — so the read
// was `undefined` on every render and the card told doctors "Agenda não
// conectada", with a Connect button, for an agenda the backend considered
// perfectly available. It type-checked, because the property existed on the TS
// type and nowhere else.
//
// Two things follow, and both live here:
//   1. the decision is a pure function, so every state can be asserted in a
//      test (this repo's vitest runs in the node environment, so a rule buried
//      in a component is untestable by construction); and
//   2. it consumes `has_calendar` + `calendar_source`, the keys the backend
//      actually sends.
//
// `calendar_source` is what stops the OTHER misleading state: with only a
// boolean, a doctor covered by the CLINIC's connection saw "Reconectar agenda",
// an action implying they had connected something. Now the three cases are
// distinct, and the offered action matches the one the doctor can actually take.
//
// Nothing here starts OAuth, creates a calendar, or reads a credential — it
// returns copy and a button intent; the component owns the handlers.

import type { ProfessionalWire } from "@/lib/secretaria-hub";

/** The tenant's Google Calendar mode; `null` when the config GET failed. */
export type GoogleCalendarMode = "per_professional" | "shared_account";

/** Only the fields this decision may look at. */
export type CalendarFacts = Pick<
  ProfessionalWire,
  "has_calendar" | "calendar_source" | "google_calendar_id"
>;

export type CalendarAction =
  /** Start OAuth for THIS professional's own agenda. */
  | { kind: "connect_own"; label: string }
  /** Same handler, but the doctor already has one — the copy differs. */
  | { kind: "reconnect_own"; label: string }
  /** shared_account mode: create this professional's secondary calendar. */
  | { kind: "create_shared"; label: string };

export type CalendarStatus = {
  /** Drives the badge tone. "Available", not "the doctor connected it". */
  connected: boolean;
  badgeLabel: string;
  /** A clarifying line, or null when the badge already says everything. */
  note: string | null;
  /** null when there is no honest action to offer. */
  action: CalendarAction | null;
};

/**
 * The card's state. Returns `null` when the tenant's mode is unknown (the
 * config GET failed): with no mode there is nothing truthful to say about a
 * per-professional agenda, and the caller renders its "couldn't determine" note
 * instead of guessing a mode.
 */
export function calendarStatus(
  mode: GoogleCalendarMode | null,
  professional: CalendarFacts | null,
): CalendarStatus | null {
  if (mode === null || professional === null) return null;

  if (mode === "shared_account") {
    // In this mode the clinic owns one Google account and each professional
    // gets a secondary calendar under it. `has_calendar` would be true here
    // purely because the CLINIC is connected, which says nothing about whether
    // this doctor's own calendar exists — so the id is what is asked.
    const created = professional.google_calendar_id != null;
    return {
      connected: created,
      badgeLabel: created ? "Agenda criada" : "Agenda ainda não criada",
      note: created
        ? "Sua agenda fica dentro da conta Google da clínica."
        : "Sua agenda é criada dentro da conta Google da clínica.",
      action: created ? null : { kind: "create_shared", label: "Criar minha agenda" },
    };
  }

  switch (professional.calendar_source) {
    case "professional":
      return {
        connected: true,
        badgeLabel: "Agenda conectada",
        note: null,
        action: { kind: "reconnect_own", label: "Reconectar agenda" },
      };

    case "tenant":
      // Available, but not this doctor's. Saying "conectada" flat would take
      // credit for the clinic's connection; offering "Reconectar" would imply
      // an own connection that does not exist.
      return {
        connected: true,
        badgeLabel: "Usando a agenda da clínica",
        note:
          "A conta Google da clínica cobre seus agendamentos. Conecte a sua se quiser uma " +
          "agenda separada.",
        action: { kind: "connect_own", label: "Conectar minha agenda" },
      };

    case "none":
      return {
        connected: false,
        badgeLabel: "Agenda não conectada",
        note: null,
        action: { kind: "connect_own", label: "Conectar Google Calendar" },
      };

    default:
      // `calendar_source` absent: an older backend that sends only the boolean.
      // Report availability honestly and keep the action NEUTRAL — "Reconectar"
      // would be a claim about ownership this payload cannot support.
      return {
        connected: professional.has_calendar,
        badgeLabel: professional.has_calendar ? "Agenda disponível" : "Agenda não conectada",
        note: professional.has_calendar
          ? "Não é possível dizer se esta agenda é sua ou da clínica nesta versão."
          : null,
        action: { kind: "connect_own", label: "Conectar minha agenda" },
      };
  }
}
