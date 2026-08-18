"use client";

// SecretariaConfigSection — "Configurações secretarIA" card on /doctor/perfil
// (Meu Perfil), auto-scoped to the LOGGED-IN user's own professional. Uses the
// PORTAL design system (.card/.pfield/.btn/.alert-line/.portal-error — see
// PortalShell.css/brand-ds.css), NOT the hub's (_shared/ui.tsx / inline-style
// components) — the two are separate design systems per route, per this
// repo's convention. What IS reused across both is the hub's pure, headless
// API/mapping layer (lib/secretaria-hub.ts + configuracao/lib/hub-mapping.ts):
// no business logic is duplicated, only the (framework-free) day/time helpers
// and profile field names. See the report for what's genuinely re-implemented
// here vs. shared.
//
// Self-bind: an owner with no professional yet sees "Você também atende
// pacientes?" — same copy/flow as ProfessionalsSection's self-bind prompt
// (createSelfProfessional), reimplemented with portal-DS markup rather than
// importing the hub's <Btn>/inline-style version.
//
// Google Calendar: sensitive to the tenant's google_calendar_mode (read from
// GET /tenants/me/config, same call the hub Configuração page makes).
// per_professional shows this professional's own connect/reconnect action;
// shared_account shows the dedicated-calendar status + "Criar minha agenda",
// with the same clinic_calendar_not_connected/google_reconnect_required
// handling as ProfessionalsSection — but copy aimed at a user who may not
// administer the clinic (points at /secretaria/configuracao rather than
// assuming they can fix it inline themselves).
//
// Hub reachability: reuses useSecretariaHub (the same hook the hub pages use)
// for identical session/entitlement/reachability semantics — an unreachable
// hub or a tenant without the secretarIA entitlement degrades this ONE card
// instead of ever breaking the rest of Meu Perfil.

import { useCallback, useEffect, useMemo, useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";

import { SecretariaWordmark } from "../../_components/SecretariaWordmark";
import { StatusBadge } from "../../_components/StatusBadge";
// Cross-route reuse: the exact hook the hub pages (agenda/configuração) use
// for hub session/entitlement/reachability — see its own doc-comment. Not
// duplicated here: the retry-with-backoff/403-vs-unavailable distinction is
// exactly what this card needs too.
import { useSecretariaHub } from "../../secretaria/_shared/useSecretariaHub";
import {
  createSelfProfessional,
  getDoctorProfessionals,
  type DoctorProfessional,
  type Session,
} from "@/lib/manage-api";
import {
  createProfessionalCalendar,
  getProfessionals,
  getTenantConfig,
  hubConfigured,
  startProfessionalCalendarOauth,
  updateProfessionalConfig,
  HubApiError,
  HUB_ERROR_CLINIC_CALENDAR_NOT_CONNECTED,
  HUB_ERROR_GOOGLE_RECONNECT_REQUIRED,
  type GoogleCalendarMode,
  type ProfessionalConfigUpdatePayload,
  type ProfessionalWire,
} from "@/lib/secretaria-hub";
// Cross-route reuse: pure wire<->local mapping helpers (day/time conversion,
// profile field mapping) — no re-implementation of this logic.
import {
  applyWireBusinessHours,
  applyWireProfessionalProfile,
  hhmmToMinutes,
  minutesToHhmm,
  toWireBusinessHours,
} from "../../secretaria/configuracao/lib/hub-mapping";
import {
  EMPTY_PROFESSIONAL_PROFILE,
  type DayConfig,
  type ProfessionalProfile,
  type TimeRange,
} from "../../secretaria/configuracao/lib/types";
// The Calendar card's copy + offered action, extracted so it can be tested
// without jsdom — see the module header for the bug that motivated it.
import { calendarStatus } from "./lib/calendar-status";

// Weekday seed, mirroring page.tsx's private WD/closedWeek. NOT extracted
// (five trivial lines; page.tsx is a route entry, not a shared module — see
// the report for why this is the one deliberate small duplication here).
const WEEKDAYS: [string, string][] = [
  ["seg", "Segunda"],
  ["ter", "Terça"],
  ["qua", "Quarta"],
  ["qui", "Quinta"],
  ["sex", "Sexta"],
  ["sab", "Sábado"],
  ["dom", "Domingo"],
];
function closedWeek(): DayConfig[] {
  return WEEKDAYS.map(([key, label]) => ({ key, label, on: false, ranges: [] }));
}

// CardTitle — this card's heading. Extracted because every one of the card's
// states (loading / hub unavailable / hub not configured / loaded) renders it,
// so the "Configurações secretarIA" naming lives in exactly one place.
function CardTitle() {
  return (
    <h2 className="h-card" style={{ marginBottom: 4 }}>
      Configurações <SecretariaWordmark />
    </h2>
  );
}

export function SecretariaConfigSection({ session }: { session: Session }) {
  const {
    ready: hubCheckReady,
    notEntitled,
    unavailable: hubUnavailable,
    hubTokenReady,
    retry,
  } = useSecretariaHub();

  // brain-api roster (linked_user_email/professional_id) + hub roster
  // (editable fields) — same dual-source pattern as configuracao/page.tsx's
  // loadProfessionals, scoped down to "find mine" instead of a full list UI.
  const [doctorRoster, setDoctorRoster] = useState<DoctorProfessional[] | null>(null);
  const [doctorRosterError, setDoctorRosterError] = useState(false);
  const [hubRoster, setHubRoster] = useState<ProfessionalWire[] | null>(null);
  const [hubRosterError, setHubRosterError] = useState(false);
  const [gcalMode, setGcalMode] = useState<GoogleCalendarMode | null>(null);
  // Set immediately from createSelfProfessional's own response — covers the
  // instant-after-bind gap before session.professionalId catches up (only
  // updates on the NEXT token refresh/login) and before the roster refetch
  // below resolves linked_user_email.
  const [justBoundId, setJustBoundId] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!hubTokenReady) return;
    getDoctorProfessionals(session)
      .then((list) => {
        setDoctorRoster(list);
        setDoctorRosterError(false);
      })
      .catch((e) => {
        console.error("doctor perfil: failed to load professionals roster", e);
        setDoctorRosterError(true);
      });
    getProfessionals(session)
      .then((list) => {
        setHubRoster(list);
        setHubRosterError(false);
      })
      .catch((e) => {
        console.error("doctor perfil: failed to load hub professional configs", e);
        setHubRosterError(true);
      });
    getTenantConfig(session)
      .then((cfg) => setGcalMode(cfg.google_calendar_mode))
      .catch((e) => {
        console.error("doctor perfil: failed to load tenant config", e);
        // gcalMode stays null -> the Calendar sub-section shows a discreet
        // "couldn't determine" note instead of guessing a mode.
      });
  }, [hubTokenReady, session]);

  useEffect(() => {
    reload();
  }, [reload]);

  // "My professional": prefer the JWT claim; fall back to the brain-api
  // roster's linked_user_email — same resolution ProfessionalsSection uses
  // for its owner self-bind prompt (fresh immediately after self-bind,
  // rather than waiting on the next token refresh/login).
  const myProfessionalId = useMemo(() => {
    if (session.professionalId) return session.professionalId;
    if (justBoundId) return justBoundId;
    const mine = doctorRoster?.find(
      (p) => p.linked_user_email?.toLowerCase() === session.email.toLowerCase(),
    );
    return mine?.id ?? null;
  }, [session, doctorRoster, justBoundId]);

  const myHubProfessional = useMemo(
    () => (myProfessionalId ? (hubRoster?.find((p) => p.id === myProfessionalId) ?? null) : null),
    [myProfessionalId, hubRoster],
  );

  // What the Calendar card says and offers. A pure function so every state —
  // both modes, the clinic-fallback case, an older backend, a failed config GET
  // — is asserted in lib/__tests__/calendar-status.test.ts rather than eyeballed.
  const calendar = useMemo(
    () => calendarStatus(gcalMode, myHubProfessional),
    [gcalMode, myHubProfessional],
  );

  // --- self-bind ("Você também atende pacientes?") ---
  const [binding, setBinding] = useState(false);
  const [bindError, setBindError] = useState<string | null>(null);

  async function handleSelfBind() {
    setBinding(true);
    setBindError(null);
    try {
      const result = await createSelfProfessional(session, {});
      setJustBoundId(result.professional_id);
      reload();
    } catch (e) {
      console.error("doctor perfil: failed to self-bind professional", e);
      setBindError("Não foi possível vincular seu perfil agora. Tente novamente.");
    } finally {
      setBinding(false);
    }
  }

  // --- profile + hours form ---
  const [profile, setProfile] = useState<ProfessionalProfile>(EMPTY_PROFESSIONAL_PROFILE);
  const [days, setDays] = useState<DayConfig[]>(closedWeek());
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!myHubProfessional) return;
    setProfile(applyWireProfessionalProfile(myHubProfessional));
    setDays(applyWireBusinessHours(myHubProfessional.business_hours, closedWeek()));
  }, [myHubProfessional]);

  function updateProfileField<K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) {
    setProfile((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function updateDays(next: DayConfig[]) {
    setDays(next);
    setSaved(false);
  }

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault();
    if (!myProfessionalId) return;
    setSaving(true);
    setSaveError(null);
    try {
      // Narrower than ProfessionalsSection's buildProfessionalConfigPayload on
      // purpose: this card never touches appointment_types/services, and
      // ProfessionalConfigUpdatePayload is a partial update (exclude_unset on
      // the backend) — omitting the key here means "leave services alone",
      // never "clear them".
      const patch: ProfessionalConfigUpdatePayload = {
        specialty: profile.specialty || null,
        about: profile.about || null,
        context_doctor_message: profile.contextDoctorMessage || null,
        business_hours: toWireBusinessHours(days),
      };
      const updated = await updateProfessionalConfig(session, myProfessionalId, patch);
      setHubRoster((prev) => (prev ? prev.map((p) => (p.id === updated.id ? updated : p)) : prev));
      setSaved(true);
    } catch (err) {
      console.error("doctor perfil: failed to save secretaria config", err);
      setSaveError("Não foi possível salvar agora. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  // --- Google Calendar (mode-sensitive) ---
  const [connecting, setConnecting] = useState(false);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [creatingCalendar, setCreatingCalendar] = useState(false);
  const [calendarActionError, setCalendarActionError] = useState<{ message: string; showLink: boolean } | null>(
    null,
  );

  // per_professional mode: same per-professional OAuth handoff
  // ProfessionalsSection's row button triggers.
  async function handleConnectOwnCalendar() {
    if (!myProfessionalId) return;
    setConnectError(null);
    setConnecting(true);
    try {
      const url = await startProfessionalCalendarOauth(session, myProfessionalId);
      window.location.assign(url);
      // Leave `connecting` true — the browser is navigating away to Google.
    } catch (e) {
      console.error("doctor perfil: failed to start professional Calendar OAuth", e);
      setConnectError("Não foi possível iniciar a conexão agora. Tente novamente.");
      setConnecting(false);
    }
  }

  // shared_account mode: idempotent POST creates this professional's
  // dedicated calendar inside the CLINIC's Google account. The two
  // structured errors get a link to /secretaria/configuracao instead of
  // assuming this user can fix the clinic's connection inline — they may be
  // staff, not the admin.
  async function handleCreateOwnCalendar() {
    if (!myProfessionalId) return;
    setCalendarActionError(null);
    setCreatingCalendar(true);
    try {
      await createProfessionalCalendar(session, myProfessionalId);
      reload();
    } catch (e) {
      console.error("doctor perfil: failed to create professional calendar", e);
      if (
        e instanceof HubApiError &&
        (e.code === HUB_ERROR_CLINIC_CALENDAR_NOT_CONNECTED || e.code === HUB_ERROR_GOOGLE_RECONNECT_REQUIRED)
      ) {
        setCalendarActionError({ message: e.message, showLink: true });
      } else {
        setCalendarActionError({
          message: "Não foi possível criar sua agenda agora. Tente novamente.",
          showLink: false,
        });
      }
    } finally {
      setCreatingCalendar(false);
    }
  }

  // ---------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------

  if (!hubCheckReady) {
    return (
      <section className="card">
        <CardTitle />
        <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Carregando…</p>
      </section>
    );
  }

  // No secretarIA entitlement at all -> this card simply doesn't apply, the
  // same rule DoctorLayout's nav already follows for every other
  // secretaria-gated item (Agenda/Pacientes/Configurações).
  if (notEntitled) return null;

  if (hubUnavailable) {
    // Transient — a retry has a real chance of succeeding (see useSecretariaHub).
    return (
      <section className="card">
        <CardTitle />
        <div className="alert-line alert-line--amber" style={{ marginTop: 12 }}>
          <span style={{ flex: 1 }}>Não foi possível carregar a configuração da secretarIA agora.</span>
          <button type="button" className="btn btn--outline btn--sm" onClick={retry}>
            Tentar novamente
          </button>
        </div>
      </section>
    );
  }

  if (!hubTokenReady) {
    // ready && !notEntitled && !unavailable && !hubTokenReady can only mean the
    // mint itself succeeded but this environment has no hub base URL
    // configured — mirrors HubNotice's own derivation. No retry action:
    // re-checking would just land back here (hubConfigured() is a static
    // env-var read, not a network call).
    return (
      <section className="card">
        <CardTitle />
        <div className="alert-line alert-line--amber" style={{ marginTop: 12 }}>
          {hubConfigured()
            ? "Não foi possível carregar a configuração da secretarIA agora."
            : "A conexão com os dados da sua clínica não está configurada neste ambiente."}
        </div>
      </section>
    );
  }

  return (
    <section className="card">
      <CardTitle />
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 20 }}>
        Como a secretarIA fala sobre você e organiza sua agenda de atendimentos.
      </p>

      {!myProfessionalId ? (
        // Owner gate (not a role check): is_owner is the new claim; role ===
        // "tenant_owner" is the legacy fallback during the transition.
        session.isOwner || session.role === "tenant_owner" ? (
          <div
            className="alert-line alert-line--amber"
            style={{ alignItems: "flex-start", flexDirection: "column", gap: 10 }}
          >
            <div style={{ display: "flex", gap: 10 }}>
              <span className="dot dot--amber" style={{ marginTop: 6 }} />
              <strong>Você também atende pacientes, ou só administra a clínica?</strong>
            </div>
            {bindError && (
              <p className="portal-error" style={{ marginLeft: 18 }}>
                {bindError}
              </p>
            )}
            <div style={{ display: "flex", gap: 10, paddingLeft: 18 }}>
              <button type="button" className="btn btn--primary btn--sm" onClick={handleSelfBind} disabled={binding}>
                {binding ? "Um momento…" : "Sim, eu também atendo"}
              </button>
            </div>
          </div>
        ) : doctorRosterError ? (
          <div className="portal-error">Não foi possível carregar sua vinculação com a secretarIA agora.</div>
        ) : (
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>
            Sua conta ainda não está vinculada a um profissional na secretarIA. Fale com quem administra sua
            clínica.
          </p>
        )
      ) : !myHubProfessional ? (
        hubRosterError ? (
          <div className="portal-error">Não foi possível carregar sua configuração da secretarIA agora.</div>
        ) : (
          <p style={{ fontSize: 13.5, color: "var(--ink-soft)" }}>Carregando…</p>
        )
      ) : (
        <>
          <form onSubmit={handleSaveProfile} noValidate style={{ maxWidth: 520 }}>
            {saveError && (
              <div className="portal-error" style={{ marginBottom: 14 }}>
                {saveError}
              </div>
            )}
            {saved && !saveError && (
              <div className="alert-line alert-line--green" style={{ marginBottom: 14 }}>
                Configuração salva.
              </div>
            )}

            <div className="pfield">
              <label htmlFor="sec-specialty">Especialidade</label>
              <input
                id="sec-specialty"
                type="text"
                value={profile.specialty}
                onChange={(e) => updateProfileField("specialty", e.target.value)}
                placeholder="Clínica geral, Cardiologia…"
              />
            </div>

            <div className="pfield">
              <label htmlFor="sec-about">Sobre você (contexto para o bot)</label>
              <textarea
                id="sec-about"
                value={profile.about}
                rows={3}
                onChange={(e) => updateProfileField("about", e.target.value)}
                placeholder="Ex.: Atende adultos e idosos há 12 anos, com foco em acompanhamento contínuo…"
              />
            </div>

            <div className="pfield">
              <label htmlFor="sec-context">Instruções específicas para você</label>
              <textarea
                id="sec-context"
                value={profile.contextDoctorMessage}
                rows={2}
                onChange={(e) => updateProfileField("contextDoctorMessage", e.target.value)}
                placeholder="Opcional"
              />
            </div>

            <div className="pfield" style={{ marginBottom: 4 }}>
              <label>Dias e horários de atendimento</label>
              <HoursEditor days={days} onChange={updateDays} />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--sm"
              disabled={saving}
              style={{ marginTop: 18 }}
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </form>

          {/* --- Google Calendar, sensitive to the tenant's mode --- */}
          <div style={{ marginTop: 26, paddingTop: 22, borderTop: "1px solid var(--line)" }}>
            <h3 style={{ fontSize: 14.5, fontWeight: 700, color: "var(--ink)", marginBottom: 12 }}>
              Agenda no Google Calendar
            </h3>

            {/* Every word and button below comes from lib/calendar-status.ts,
                which reads `has_calendar` + `calendar_source` — the keys the
                backend actually sends. This block used to read
                `calendar_connected`, a property no response has ever carried,
                so it rendered "Agenda não conectada" over a working agenda. */}
            {calendar === null ? (
              <p style={{ fontSize: 13, color: "var(--ink-faint)" }}>
                Não foi possível carregar como sua clínica conecta o Google Calendar agora.
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "flex-start" }}>
                <StatusBadge tone={calendar.connected ? "green" : "muted"}>
                  {calendar.badgeLabel}
                </StatusBadge>

                {calendar.note && (
                  <p style={{ fontSize: 12.5, color: "var(--ink-faint)", margin: 0, maxWidth: 460 }}>
                    {calendar.note}
                  </p>
                )}

                {/* Connect/reconnect failures and create-calendar failures are
                    reported by different handlers; each stays with its action. */}
                {calendar.action?.kind !== "create_shared" && connectError && (
                  <div className="portal-error">{connectError}</div>
                )}
                {calendar.action?.kind === "create_shared" && calendarActionError && (
                  <div className="portal-error">
                    {calendarActionError.message}
                    {calendarActionError.showLink && (
                      <>
                        {" "}
                        <Link href="/secretaria/configuracao#gcal" style={{ fontWeight: 700 }}>
                          Ir para Configurações <SecretariaWordmark /> →
                        </Link>
                      </>
                    )}
                  </div>
                )}

                {calendar.action && (
                  <button
                    type="button"
                    className="btn btn--outline btn--sm"
                    onClick={
                      calendar.action.kind === "create_shared"
                        ? handleCreateOwnCalendar
                        : handleConnectOwnCalendar
                    }
                    disabled={
                      calendar.action.kind === "create_shared" ? creatingCalendar : connecting
                    }
                  >
                    {calendar.action.kind === "create_shared"
                      ? creatingCalendar
                        ? "Criando…"
                        : calendar.action.label
                      : connecting
                        ? "Conectando…"
                        : calendar.action.label}
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}

// --- HoursEditor: a lighter, native-<input type="time"> weekly hours grid ---
// (portal DS uses plain HTML controls, not the hub's custom CSelect/half-hour
// picker) — same DayConfig/TimeRange shape and toWireBusinessHours/
// applyWireBusinessHours mapping as AvailabilitySection, just a simpler
// widget around it for this single-professional card.

const timeInputStyle: CSSProperties = {
  padding: "8px 10px",
  borderRadius: 10,
  border: "1px solid var(--line-strong)",
  background: "var(--surface-inset)",
  color: "var(--ink)",
  fontSize: 13.5,
  fontFamily: "inherit",
};

function HoursEditor({ days, onChange }: { days: DayConfig[]; onChange: (days: DayConfig[]) => void }) {
  const updateDay = (i: number, next: DayConfig) => onChange(days.map((d, j) => (j === i ? next : d)));
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      {days.map((day, i) => (
        <HoursDayRow key={day.key} day={day} onChange={(next) => updateDay(i, next)} />
      ))}
    </div>
  );
}

function HoursDayRow({ day, onChange }: { day: DayConfig; onChange: (day: DayConfig) => void }) {
  const addRange = () => onChange({ ...day, ranges: [...day.ranges, { start: 8 * 60, end: 12 * 60 }] });
  const setRange = (i: number, patch: Partial<TimeRange>) =>
    onChange({ ...day, ranges: day.ranges.map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const removeRange = (i: number) => onChange({ ...day, ranges: day.ranges.filter((_, j) => j !== i) });

  return (
    <div
      style={{
        display: "flex",
        gap: 14,
        padding: "10px 0",
        borderBottom: "1px solid var(--line)",
        alignItems: "flex-start",
      }}
    >
      <label style={{ display: "flex", alignItems: "center", gap: 8, width: 128, flexShrink: 0, paddingTop: 6 }}>
        <input type="checkbox" checked={day.on} onChange={(e) => onChange({ ...day, on: e.target.checked })} />
        <span style={{ fontSize: 13.5, fontWeight: 600, color: day.on ? "var(--ink)" : "var(--ink-faint)" }}>
          {day.label}
        </span>
      </label>
      <div style={{ flex: 1 }}>
        {!day.on ? (
          <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>Fechado</span>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {day.ranges.map((r, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <input
                  type="time"
                  value={minutesToHhmm(r.start)}
                  onChange={(e) => setRange(i, { start: hhmmToMinutes(e.target.value) })}
                  style={timeInputStyle}
                />
                <span style={{ fontSize: 13, color: "var(--ink-faint)" }}>às</span>
                <input
                  type="time"
                  value={minutesToHhmm(r.end)}
                  onChange={(e) => setRange(i, { end: hhmmToMinutes(e.target.value) })}
                  style={timeInputStyle}
                />
                {day.ranges.length > 1 && (
                  <button type="button" className="btn btn--ghost btn--sm" onClick={() => removeRange(i)}>
                    Remover
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn btn--ghost btn--sm"
              style={{ alignSelf: "flex-start" }}
              onClick={addRange}
            >
              + Adicionar faixa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
