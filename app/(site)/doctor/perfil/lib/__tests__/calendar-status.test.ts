// The /doctor/perfil Calendar card, state by state.
//
// THE BUG THIS REPLACES
// ---------------------
// The card read `myHubProfessional.calendar_connected`. No response has ever
// carried that key — the backend sends `has_calendar` — so the read was
// `undefined` on every render: doctors with a working agenda were told "Agenda
// não conectada" and offered a Connect button. It type-checked, and no test
// existed to notice, because the decision lived inside JSX and this repo's
// vitest runs in the node environment with no jsdom.
//
// So the decision is a pure function now, and each state below is a state a
// real clinic is in. `calendar_source` is what separates the two that a single
// boolean could not: an agenda the doctor connected, and one the CLINIC
// connected that happens to cover them.

import { describe, expect, it } from "vitest";
import { calendarStatus, type CalendarFacts } from "../calendar-status";

function facts(overrides: Partial<CalendarFacts> = {}): CalendarFacts {
  return {
    has_calendar: false,
    calendar_source: "none",
    google_calendar_id: null,
    ...overrides,
  };
}

describe("per_professional mode", () => {
  it("a doctor with their OWN connection sees it connected, and may reconnect", () => {
    const status = calendarStatus(
      "per_professional",
      facts({ has_calendar: true, calendar_source: "professional" }),
    );

    expect(status).not.toBeNull();
    expect(status!.connected).toBe(true);
    expect(status!.badgeLabel).toBe("Agenda conectada");
    expect(status!.action).toEqual({ kind: "reconnect_own", label: "Reconectar agenda" });
  });

  it("the regression, pinned: a connected agenda is never shown as disconnected", () => {
    // The exact payload the old card mis-read. `calendar_connected` is not a
    // key here, and the card must not depend on one.
    const wire = facts({ has_calendar: true, calendar_source: "professional" });
    expect("calendar_connected" in wire).toBe(false);

    const status = calendarStatus("per_professional", wire);

    expect(status!.badgeLabel).not.toBe("Agenda não conectada");
    expect(status!.connected).toBe(true);
  });

  it("a doctor covered by the CLINIC's connection is told exactly that", () => {
    const status = calendarStatus(
      "per_professional",
      facts({ has_calendar: true, calendar_source: "tenant" }),
    );

    // Available — so it must not read as "não conectada"...
    expect(status!.connected).toBe(true);
    expect(status!.badgeLabel).toBe("Usando a agenda da clínica");
    // ...and the doctor never connected anything, so "Reconectar" would be a
    // lie about an action they have not taken.
    expect(status!.action).toEqual({ kind: "connect_own", label: "Conectar minha agenda" });
    expect(status!.note).toContain("clínica");
  });

  it("nobody connected: not connected, and the offer is to connect", () => {
    const status = calendarStatus("per_professional", facts({ calendar_source: "none" }));

    expect(status!.connected).toBe(false);
    expect(status!.badgeLabel).toBe("Agenda não conectada");
    expect(status!.action).toEqual({ kind: "connect_own", label: "Conectar Google Calendar" });
  });

  it("never offers 'Reconectar' to somebody who has not connected anything", () => {
    for (const source of ["tenant", "none"] as const) {
      const status = calendarStatus("per_professional", facts({ calendar_source: source }));
      expect(status!.action?.kind).not.toBe("reconnect_own");
    }
  });
});

describe("shared_account mode", () => {
  it("a created secondary calendar shows as created, with nothing left to do", () => {
    const status = calendarStatus(
      "shared_account",
      facts({ has_calendar: true, calendar_source: "tenant", google_calendar_id: "cal-123" }),
    );

    expect(status!.connected).toBe(true);
    expect(status!.badgeLabel).toBe("Agenda criada");
    expect(status!.action).toBeNull();
  });

  it("no secondary calendar yet offers to create one", () => {
    const status = calendarStatus(
      "shared_account",
      // has_calendar is TRUE here purely because the clinic is connected — and
      // that says nothing about whether THIS doctor's calendar exists.
      facts({ has_calendar: true, calendar_source: "tenant", google_calendar_id: null }),
    );

    expect(status!.connected).toBe(false);
    expect(status!.action).toEqual({ kind: "create_shared", label: "Criar minha agenda" });
  });

  it("does not let the clinic's connection pass for the doctor's own calendar", () => {
    const shared = calendarStatus(
      "shared_account",
      facts({ has_calendar: true, calendar_source: "tenant", google_calendar_id: null }),
    );
    const perProfessional = calendarStatus(
      "per_professional",
      facts({ has_calendar: true, calendar_source: "tenant", google_calendar_id: null }),
    );

    // Same facts, different mode, deliberately different verdict.
    expect(shared!.connected).toBe(false);
    expect(perProfessional!.connected).toBe(true);
  });
});

describe("degrading honestly", () => {
  it("a failed config GET (mode unknown) says nothing about the agenda", () => {
    expect(calendarStatus(null, facts({ has_calendar: true }))).toBeNull();
  });

  it("no professional row means no verdict either", () => {
    expect(calendarStatus("per_professional", null)).toBeNull();
  });

  it("an older backend without calendar_source reports availability, not ownership", () => {
    const wire = facts({ has_calendar: true });
    delete (wire as Partial<CalendarFacts>).calendar_source;

    const status = calendarStatus("per_professional", wire);

    expect(status!.connected).toBe(true);
    expect(status!.badgeLabel).toBe("Agenda disponível");
    // Neutral action: claiming "Reconectar" would assert an ownership this
    // payload cannot support.
    expect(status!.action?.kind).toBe("connect_own");
    expect(status!.note).toContain("Não é possível dizer");
  });

  it("an older backend with no agenda at all is simply not connected", () => {
    const wire = facts({ has_calendar: false });
    delete (wire as Partial<CalendarFacts>).calendar_source;

    const status = calendarStatus("per_professional", wire);

    expect(status!.connected).toBe(false);
    expect(status!.badgeLabel).toBe("Agenda não conectada");
  });
});

describe("what the card is allowed to know", () => {
  it("reads only status facts — no credential can reach the copy", () => {
    const status = calendarStatus(
      "per_professional",
      facts({ has_calendar: true, calendar_source: "professional" }),
    );

    const rendered = JSON.stringify(status).toLowerCase();
    for (const secretish of ["token", "refresh", "scope", "oauth", "accounts.google"]) {
      expect(rendered).not.toContain(secretish);
    }
  });
});
