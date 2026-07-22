"use client";
// Configuração page — the full-viewport secretarIA chatbot configuration screen.
// Owns all form state (ctx, messages, postConsult, pixDeposit, professionals,
// services, days, prefs, gcal) and the scrollspy logic. Composed of SideNav +
// eight Section components; a sticky save bar sits at the bottom. Theme is
// initialised from the existing [data-theme] attribute after mount to avoid
// an SSR hydration mismatch.
//
// Onboarding & Multi-Professional pass: added Mensagens + Profissionais
// sections; Services/Availability now edit the SELECTED professional instead
// of a single tenant-wide list; Context dropped specialty/about (now
// per-professional) and gained real address/insurances/collect_insurance.
// Professional-scoped view (Feature E): a tenant_staff session locked to a
// professional_id sees read-only clinic-level sections + only their own
// professional's forms.

import "../../product-tokens.css";
import "../../app-shell.css";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MutableRefObject } from "react";
import { Icon, Btn } from "../_shared/ui";
import { Header } from "../_shared/Header";
import type { Theme } from "../_shared/Header";
import { HubNotice } from "../_shared/HubNotice";
import { OnboardingBanner } from "../../_components/OnboardingBanner";
import { useSecretariaHub } from "../_shared/useSecretariaHub";
import { CLINIC } from "../_shared/data";

import { SideNav } from "./components/SideNav";
import { CToast } from "./components/CToast";
import { ContextSection } from "./components/ContextSection";
import { MessagesSection } from "./components/MessagesSection";
import { PostConsultSection } from "./components/PostConsultSection";
import { PixSection } from "./components/PixSection";
import { ProfessionalsSection } from "./components/ProfessionalsSection";
import { ServicesSection } from "./components/ServicesSection";
import { AvailabilitySection } from "./components/AvailabilitySection";
import { GoogleSection } from "./components/GoogleSection";

import {
  DEFAULT_PIX_DEPOSIT,
  type ClinicCtx,
  type DayConfig,
  type GcalState,
  type Messages,
  type PixDeposit,
  type PostConsult,
  type Prefs,
  type ProfessionalProfile,
  type Service,
} from "./lib/types";
import {
  applyWireAddress,
  applyWireAppointmentTypes,
  applyWireBusinessHours,
  applyWireInsurances,
  applyWireMessages,
  applyWirePixDeposit,
  applyWirePostConsult,
  applyWireProfessionalProfile,
  buildConfigUpdatePayload,
  buildProfessionalConfigPayload,
} from "./lib/hub-mapping";
import {
  disconnectCalendar,
  getProfessionals,
  getTenantConfig,
  startCalendarOauth,
  updateProfessionalConfig,
  updateTenantConfig,
  type ProfessionalWire,
} from "@/lib/secretaria-hub";
import { getDoctorProfessionals, type DoctorProfessional } from "@/lib/manage-api";

// ---------------------------------------------------------------------------
// Weekday seed — used to initialise/reset the days state
// ---------------------------------------------------------------------------

// [key, label] pairs in ISO week order (Mon → Sun)
const WD: [string, string][] = [
  ["seg", "Segunda"],
  ["ter", "Terça"],
  ["qua", "Quarta"],
  ["qui", "Quinta"],
  ["sex", "Sexta"],
  ["sab", "Sábado"],
  ["dom", "Domingo"],
];

// A fully-closed week — the base every professional's hydration starts from,
// so switching between professionals never leaks one professional's ranges
// onto another's blank days (see the per-professional hydration effect below).
function closedWeek(): DayConfig[] {
  return WD.map(([key, label]) => ({ key, label, on: false, ranges: [] }));
}

// Rich demo seed — used only for the logged-out/not-entitled showcase and as
// the pre-hydration placeholder, so the page never looks empty before data loads.
function demoWeek(): DayConfig[] {
  return WD.map(([key, label], i) => ({
    key,
    label,
    on: i < 5, // Mon–Fri open by default
    ranges:
      i < 5
        ? [{ start: 8 * 60, end: 12 * 60 }, { start: 14 * 60, end: 18 * 60 }]
        : [{ start: 9 * 60, end: 12 * 60 }],
  }));
}

// Single demo roster row shown before real professionals load (keeps the new
// Profissionais section from looking stuck-loading in demo/logged-out mode).
const DEMO_PROFESSIONAL_ID = "demo";
const DEMO_ROSTER: DoctorProfessional[] = [
  {
    id: DEMO_PROFESSIONAL_ID,
    name: CLINIC.name,
    is_active: true,
    has_calendar: false,
    has_hours: true,
    has_services: true,
    complete: false,
    linked_user_email: null,
    invite_pending: false,
  },
];

// SideNav section ids — used for scrollspy
const NAV_IDS = ["ctx", "msg", "pos", "pix", "prof", "srv", "disp", "gcal"] as const;
type NavId = (typeof NAV_IDS)[number];

// ---------------------------------------------------------------------------
// ConfiguracaoPage — default export
// ---------------------------------------------------------------------------

/**
 * ConfiguracaoPage — the full-viewport secretarIA Configuração screen.
 * Port of ConfigApp from _design-source/config.jsx.
 */
export default function ConfiguracaoPage() {
  // --- theme ---
  // Initialise to "light" on the server; read [data-theme] after mount
  // to avoid hydration mismatch and to pick up any pre-existing theme.
  const [theme, setTheme] = useState<Theme>("light");
  useEffect(() => {
    setTheme(
      (document.documentElement.getAttribute("data-theme") as Theme) || "light"
    );
  }, []);

  const onToggleTheme = () =>
    setTheme(prev => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      try { localStorage.setItem("precheck_theme", next); } catch { /* ignore */ }
      return next;
    });

  // --- scrollspy & jump ---
  const scrollRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<NavId>("ctx");

  // Smooth-scrolls the scroll container to the target section element
  const jump = useCallback((id: string) => {
    const el = document.getElementById(id);
    const sc = (scrollRef as MutableRefObject<HTMLDivElement | null>).current;
    if (el && sc) sc.scrollTo({ top: el.offsetTop - 16, behavior: "smooth" });
  }, []);

  // Determines which section is in view by comparing offsetTop to scrollTop + 120
  const onScroll = useCallback(() => {
    const sc = scrollRef.current;
    if (!sc) return;
    const pos = sc.scrollTop + 120;
    let cur: NavId = NAV_IDS[0];
    for (const id of NAV_IDS) {
      const el = document.getElementById(id);
      if (el && el.offsetTop <= pos) cur = id;
    }
    setActive(cur);
  }, []);

  // --- toast ---
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flash = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    // Auto-dismiss after 3 s, matching the source behaviour
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  // --- Section 01: clinic context ---
  // clinicName is hub-backed (read-only hydrate from TenantConfigRead; never
  // sent on save). address/insurances/collectInsurance are REAL wire fields.
  // phone stays demo-only — secretarIA still has no clinic-phone wire field.
  const [ctx, setCtx] = useState<ClinicCtx>({
    clinicName: "Consultório Dr. Aurélio Lima",
    addressLine: "",
    addressComplement: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "+55 11 3000-0000",
    insurances: "Unimed, Bradesco Saúde, SulAmérica",
    collectInsurance: true,
  });
  // Generic setter — preserves each key's value type (string or boolean).
  const setCtxK = <K extends keyof ClinicCtx>(key: K, value: ClinicCtx[K]) =>
    setCtx(prev => ({ ...prev, [key]: value }));

  // --- Section 02: messages (greeting/persona copy) — REAL wire fields, first UI ---
  const [messages, setMessages] = useState<Messages>({
    greetingMessage: "",
    returningGreetingMessage: "",
    greetingButtons: [],
    personaNotes: "",
    language: "pt-BR",
  });
  const setMessagesK = <K extends keyof Messages>(key: K, value: Messages[K]) =>
    setMessages(prev => ({ ...prev, [key]: value }));

  // --- Section 03: post-consult (message sent + knowledge used to answer
  // questions) — REAL wire fields (post_consult_message/post_consult_knowledge),
  // first UI ---
  const [postConsult, setPostConsult] = useState<PostConsult>({
    postConsultMessage: "",
    postConsultKnowledge: "",
  });
  const setPostConsultK = <K extends keyof PostConsult>(key: K, value: PostConsult[K]) =>
    setPostConsult(prev => ({ ...prev, [key]: value }));

  // --- Section 04: Sinal via Pix (deposit policy) — REAL wire fields
  // (pix_deposit_*/pix_refund_window_hours/pix_retention_policy/
  // pix_partial_refund_percent/pix_reschedule_limit); asaasConnected hydrates
  // from asaas_connected but is READ-ONLY and never sent back on save ---
  const [pixDeposit, setPixDeposit] = useState<PixDeposit>(DEFAULT_PIX_DEPOSIT);
  const setPixDepositK = <K extends keyof PixDeposit>(key: K, value: PixDeposit[K]) =>
    setPixDeposit(prev => ({ ...prev, [key]: value }));

  // --- Section 05: professionals ---
  // `roster` (brain-api GET /doctor/professionals) drives the list UI
  // (completeness/invite state); `hubProfessionalsById` (secretarIA hub GET
  // /tenants/me/professionals) supplies the editable fields used to hydrate
  // services/days/profile for whichever professional is selected.
  const [roster, setRoster] = useState<DoctorProfessional[] | null>(DEMO_ROSTER);
  const [rosterError, setRosterError] = useState(false);
  const [hubProfessionalsById, setHubProfessionalsById] = useState<Record<string, ProfessionalWire>>({});
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<string | null>(DEMO_PROFESSIONAL_ID);
  const [profile, setProfile] = useState<ProfessionalProfile>({
    specialty: "Clínica geral",
    about: "",
    contextDoctorMessage: "",
  });
  const setProfileK = <K extends keyof ProfessionalProfile>(key: K, value: ProfessionalProfile[K]) =>
    setProfile(prev => ({ ...prev, [key]: value }));

  // --- Section 06: services (appointment types) — now per-professional ---
  // Each type carries an active flag and its pre-visit requirements (Feature 2).
  const [services, setServices] = useState<Service[]>([
    {
      id: 1, name: "Primeira consulta", dur: 60, price: "R$ 450", active: true,
      requirements: [
        { id: 11, text: "Trazer documento com foto e carteirinha do convênio" },
        { id: 12, text: "Chegar 15 minutos antes para o cadastro" },
      ],
    },
    {
      id: 2, name: "Retorno", dur: 30, price: "", active: true,
      requirements: [
        { id: 21, text: "Trazer exames solicitados na consulta anterior" },
      ],
    },
    { id: 3, name: "Teleconsulta", dur: 40, price: "R$ 350", active: true, requirements: [] },
  ]);

  // --- Section 07: availability — now per-professional ---
  const [days, setDays] = useState<DayConfig[]>(demoWeek());

  // defaultDur round-trips (appointment_duration_min) and stays TENANT-level.
  // gap/lead are demo-only: TenantConfigUpdate has no inter-appointment-gap or
  // minimum-lead-time field.
  const [prefs, setPrefs] = useState<Prefs>({ defaultDur: 50, gap: 10, lead: 2 });
  const setPrefK = (key: keyof Prefs, value: number) =>
    setPrefs(prev => ({ ...prev, [key]: value }));

  // --- secretarIA hub: entitlement-gated real data path ---
  const { session, ready: hubCheckReady, notEntitled, hubReady } = useSecretariaHub();

  // Professional-scoped view (Feature E): tenant_staff is ALWAYS locked to
  // their own professional_id. A self-bound owner keeps full admin access —
  // only staff get the reduced view.
  const lockedToOwnProfessional = session?.role === "tenant_staff" && !!session.professionalId;

  // Hydrate tenant-level fields (clinicName/address/insurances/collectInsurance/
  // messages/postConsult/pixDeposit/defaultDur/gcal.connected) from the real
  // tenant config once the hub is usable. business_hours/appointment_types are
  // NO LONGER read here — they're professional-scoped now (see the hydration
  // effect below).
  useEffect(() => {
    if (!hubReady || !session) return;
    getTenantConfig(session)
      .then((cfg) => {
        setCtx((prev) => ({
          ...prev,
          clinicName: cfg.clinic_name || prev.clinicName,
          ...applyWireAddress(cfg.address),
          insurances: cfg.insurances ? applyWireInsurances(cfg.insurances) : prev.insurances,
          collectInsurance: cfg.collect_insurance,
        }));
        setMessages(applyWireMessages(cfg));
        setPostConsult(applyWirePostConsult(cfg));
        setPixDeposit(applyWirePixDeposit(cfg));
        setPrefs((prev) => ({
          ...prev,
          defaultDur: cfg.appointment_duration_min || prev.defaultDur,
        }));
        setGcal((prev) => ({ ...prev, connected: cfg.calendar_connected }));
      })
      .catch((e) => {
        // Real config failed to load — keep the demo defaults so the page
        // stays fully usable; this mirrors the agenda page's fallback rule.
        console.error("secretaria hub: failed to load tenant config", e);
      });
  }, [hubReady, session]);

  // Loads the professionals roster (brain-api) + editable configs (hub).
  // Re-run after any mutation (invite created, self-bind, calendar connect)
  // via the components' onRosterChanged/onChanged callbacks.
  const loadProfessionals = useCallback(() => {
    if (!hubReady || !session) return;
    getDoctorProfessionals(session)
      .then((list) => {
        setRoster(list);
        setRosterError(false);
        setSelectedProfessionalId((prev) => {
          if (lockedToOwnProfessional && session.professionalId) return session.professionalId;
          if (prev && list.some((p) => p.id === prev)) return prev;
          return list[0]?.id ?? null; // single-professional tenants auto-select
        });
      })
      .catch((e) => {
        console.error("secretaria hub: failed to load professionals roster", e);
        setRosterError(true);
      });
    getProfessionals(session)
      .then((list) => {
        setHubProfessionalsById(Object.fromEntries(list.map((p) => [p.id, p])));
      })
      .catch((e) => {
        console.error("secretaria hub: failed to load professional configs", e);
      });
  }, [hubReady, session, lockedToOwnProfessional]);

  useEffect(() => {
    loadProfessionals();
  }, [loadProfessionals]);

  // Hydrates services/days/profile from whichever professional is currently
  // selected. Always starts from a closed week + empty services (never from
  // the previously-selected professional's local state), so switching
  // professionals can never leak one professional's schedule onto another's.
  useEffect(() => {
    if (!selectedProfessionalId) return;
    const p = hubProfessionalsById[selectedProfessionalId];
    if (!p) return; // demo id, or hub list hasn't loaded yet — keep current (demo) values
    setServices(
      p.appointment_types.length > 0 ? applyWireAppointmentTypes(p.appointment_types) : [],
    );
    setDays(applyWireBusinessHours(p.business_hours, closedWeek()));
    setProfile(applyWireProfessionalProfile(p));
  }, [selectedProfessionalId, hubProfessionalsById]);

  // --- Section 08: Google Calendar (tenant-level; unchanged single-professional path) ---
  // connected round-trips (TenantConfigRead.calendar_connected, read-only).
  // email/calendar/tz/twoWay are demo-only — TenantConfigUpdate carries only
  // google_calendar_id (an id string, not a picker of named calendars/tz/
  // two-way-sync prefs), and the account email isn't exposed by the hub at all.
  const [gcal, setGcal] = useState<GcalState>({
    connected: false,
    email: "",
    calendar: "Agenda — Consultório",
    tz: "(GMT-03:00) Brasília",
    twoWay: true,
  });

  // --- Save: writes to the real hub config when available, else local-only ---
  // Two PUTs when a professional is selected: tenant-level (Mensagens +
  // Pós-consulta + Sinal via Pix + address/insurances/collect_insurance/
  // appointment_duration_min) and professional-level (hours/services/
  // specialty/about/context). gap/lead and the gcal email/calendar/tz/twoWay
  // fields have no wire counterpart and stay silently local-only, same as before.
  const handleSave = async () => {
    if (hubReady && session) {
      try {
        await updateTenantConfig(
          session,
          buildConfigUpdatePayload(ctx, messages, postConsult, pixDeposit, prefs.defaultDur),
        );
        if (selectedProfessionalId && selectedProfessionalId !== DEMO_PROFESSIONAL_ID) {
          const saved = await updateProfessionalConfig(
            session,
            selectedProfessionalId,
            buildProfessionalConfigPayload(days, services, profile),
          );
          setHubProfessionalsById((prev) => ({ ...prev, [selectedProfessionalId]: saved }));
          loadProfessionals(); // refresh roster completeness chips (has_hours/has_services)
        }
        flash("Configuração salva — a secretarIA já está atualizada.");
      } catch (e) {
        console.error("secretaria hub: failed to save tenant config", e);
        flash("Não foi possível salvar agora. Tente novamente.");
      }
      return;
    }
    flash("Configuração salva — a secretarIA já está atualizada.");
  };

  // --- Google Calendar: real OAuth handoff when hubReady, else undefined
  // (GoogleSection falls back to its local simulated connect/disconnect). ---
  const handleGoogleConnect =
    hubReady && session
      ? async () => {
          const url = await startCalendarOauth(session);
          window.location.assign(url);
        }
      : undefined;

  const handleGoogleDisconnect =
    hubReady && session
      ? async () => {
          await disconnectCalendar(session);
          setGcal((g) => ({ ...g, connected: false, email: "", calendar: "" }));
        }
      : undefined;

  // --- Derived: professional name shown alongside Services/Availability once
  // there's more than one to disambiguate (single-professional tenants "look
  // unchanged" per spec). ---
  const selectedProfessionalName =
    roster && roster.length > 1
      ? roster.find((p) => p.id === selectedProfessionalId)?.name
      : undefined;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{
      height: "100vh",
      display: "flex", flexDirection: "column",
      background: "var(--page)",
    }}>
      <Header theme={theme} onToggleTheme={onToggleTheme} clinicName={hubReady ? ctx.clinicName : undefined} />

      {/* demo-mode / not-entitled notice — hidden once the real hub is active */}
      <HubNotice session={session} notEntitled={notEntitled} ready={hubCheckReady} />

      {/* WhatsApp activation status — hidden once onboarding_state === 'ativo' */}
      <OnboardingBanner session={session} />

      {/* scrollable content area — scrollspy fires on this element */}
      <div
        ref={scrollRef}
        className="scroll"
        onScroll={onScroll}
        style={{ flex: 1, overflowY: "auto", minHeight: 0 }}
      >
        <div style={{
          maxWidth: 1080, margin: "0 auto",
          padding: "30px 28px 130px",
          display: "flex", gap: 36,
        }}>
          {/* left: sticky section nav */}
          <SideNav active={active} onJump={jump} />

          {/* right: page heading + sections */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* page heading */}
            <div style={{ marginBottom: 26 }}>
              <h1 style={{
                fontSize: 30, fontWeight: 600,
                fontFamily: "var(--font-serif)", color: "var(--ink)",
                lineHeight: 1.1, letterSpacing: "-.01em", margin: 0,
              }}>
                Configuração da secretarIA
              </h1>
              <p style={{
                fontSize: 15, color: "var(--ink-soft)",
                marginTop: 7, maxWidth: 620, lineHeight: 1.5,
              }}>
                Tudo que o chatbot do WhatsApp precisa saber para atender seus pacientes como uma
                secretária de verdade. Passe o mouse nos{" "}
                <b style={{ color: "var(--ink)" }}>?</b>{" "}
                para entender cada campo.
              </p>
            </div>

            {/* eight config sections stacked vertically */}
            <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
              <ContextSection v={ctx} set={setCtxK} readOnly={lockedToOwnProfessional} />
              <MessagesSection v={messages} set={setMessagesK} readOnly={lockedToOwnProfessional} />
              <PostConsultSection v={postConsult} set={setPostConsultK} readOnly={lockedToOwnProfessional} />
              <PixSection v={pixDeposit} set={setPixDepositK} readOnly={lockedToOwnProfessional} />
              <ProfessionalsSection
                session={session}
                isOwner={session?.role === "tenant_owner"}
                roster={roster}
                rosterError={rosterError}
                selectedId={selectedProfessionalId}
                onSelect={setSelectedProfessionalId}
                lockedToOwnProfessional={!!lockedToOwnProfessional}
                profile={profile}
                onProfileChange={setProfileK}
                onRosterChanged={loadProfessionals}
              />
              <ServicesSection
                services={services}
                setServices={setServices}
                professionalName={selectedProfessionalName}
              />
              <AvailabilitySection
                days={days}
                setDays={setDays}
                prefs={prefs}
                setPref={setPrefK}
                professionalName={selectedProfessionalName}
              />
              <GoogleSection
                gcal={gcal}
                setGcal={setGcal}
                onConnect={handleGoogleConnect}
                onDisconnect={handleGoogleDisconnect}
              />
            </div>
          </div>
        </div>
      </div>

      {/* sticky save bar — fixed at viewport bottom */}
      <div style={{
        position: "sticky", bottom: 0, flexShrink: 0,
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 28px",
        background: "var(--page-grad)",
        borderTop: "1px solid var(--line-strong)",
        zIndex: 20,
      }}>
        {/* Google Calendar status indicator */}
        <div style={{
          display: "flex", alignItems: "center", gap: 9,
          fontSize: 13,
          color: gcal.connected ? "var(--st-attend-ink)" : "var(--ink-faint)",
        }}>
          <Icon name={gcal.connected ? "checkCircle" : "clock"} size={16} />
          {gcal.connected
            ? "Google Calendar conectado"
            : "Conecte o Google Calendar para ativar a sincronização"}
        </div>

        <div style={{ flex: 1 }} />

        <Btn variant="ghost" onClick={() => flash("Alterações descartadas.")}>
          Descartar
        </Btn>
        <Btn variant="primary" icon="check" onClick={handleSave}>
          Salvar configuração
        </Btn>
      </div>

      {/* auto-dismissing success toast */}
      <CToast toast={toast} />
    </div>
  );
}
