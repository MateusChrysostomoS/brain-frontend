"use client";
// Configuração page — the full-viewport secretarIA chatbot configuration screen.
// Owns all form state (ctx, services, days, prefs, gcal) and the scrollspy logic.
// Composed of SideNav + four Section components; a sticky save bar sits at the bottom.
// Theme is initialised from the existing [data-theme] attribute after mount to
// avoid an SSR hydration mismatch.

import "../../product-tokens.css";
import "../../app-shell.css";

import { useState, useEffect, useRef, useCallback } from "react";
import type { MutableRefObject } from "react";
import { Icon, Btn } from "../_shared/ui";
import { Header } from "../_shared/Header";
import type { Theme } from "../_shared/Header";
import { HubNotice } from "../_shared/HubNotice";
import { useSecretariaHub } from "../_shared/useSecretariaHub";

import { SideNav } from "./components/SideNav";
import { CToast } from "./components/CToast";
import { ContextSection } from "./components/ContextSection";
import { ServicesSection } from "./components/ServicesSection";
import { AvailabilitySection } from "./components/AvailabilitySection";
import { GoogleSection } from "./components/GoogleSection";

import type { ClinicCtx, Service, DayConfig, Prefs, GcalState } from "./lib/types";
import {
  applyWireBusinessHours,
  applyWireAppointmentTypes,
  buildConfigUpdatePayload,
} from "./lib/hub-mapping";
import {
  getTenantConfig,
  updateTenantConfig,
  startCalendarOauth,
  disconnectCalendar,
} from "@/lib/secretaria-hub";

// ---------------------------------------------------------------------------
// Weekday seed — used to initialise the days state
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

// SideNav section ids — used for scrollspy
const NAV_IDS = ["ctx", "srv", "disp", "gcal"] as const;
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
  // Only clinicName is hub-backed (read-only hydrate from TenantConfigRead;
  // never sent on save). specialty/about/address*/phone/insurances/
  // collectInsurance/tone are demo-only — see the per-field comments on
  // ClinicCtx in lib/types.ts and buildConfigUpdatePayload below, which
  // intentionally omits them from the PUT body.
  const [ctx, setCtx] = useState<ClinicCtx>({
    clinicName: "Consultório Dr. Aurélio Lima",
    specialty: "Clínica geral",
    about: "",
    // Structured address (Feature 1) — fed to the agent for "onde fica?" replies.
    addressLine: "",
    addressComplement: "",
    neighborhood: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "+55 11 3000-0000",
    insurances: "Unimed, Bradesco Saúde, SulAmérica",
    // Convênio collection (Feature 3) — on by default; clinic can opt out.
    collectInsurance: true,
    tone: "",
  });
  // Generic setter — preserves each key's value type (string or boolean).
  const setCtxK = <K extends keyof ClinicCtx>(key: K, value: ClinicCtx[K]) =>
    setCtx(prev => ({ ...prev, [key]: value }));

  // --- Section 02: services (appointment types) ---
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

  // --- Section 03: availability ---
  const [days, setDays] = useState<DayConfig[]>(
    WD.map(([key, label], i) => ({
      key,
      label,
      on: i < 5, // Mon–Fri open by default
      // Weekdays get two ranges (morning + afternoon); weekend gets one
      ranges:
        i < 5
          ? [{ start: 8 * 60, end: 12 * 60 }, { start: 14 * 60, end: 18 * 60 }]
          : [{ start: 9 * 60, end: 12 * 60 }],
    }))
  );

  // defaultDur round-trips (appointment_duration_min). gap/lead are
  // demo-only: TenantConfigUpdate has no inter-appointment-gap or
  // minimum-lead-time field.
  const [prefs, setPrefs] = useState<Prefs>({ defaultDur: 50, gap: 10, lead: 2 });
  const setPrefK = (key: keyof Prefs, value: number) =>
    setPrefs(prev => ({ ...prev, [key]: value }));

  // --- secretarIA hub: entitlement-gated real data path ---
  const { session, ready: hubCheckReady, notEntitled, hubReady } = useSecretariaHub();

  // Hydrate form state from the real tenant config once the hub is usable.
  // Fields with no wire counterpart (address, tone, insurances, ...) simply
  // keep their demo defaults — see hub-mapping.ts for the exact field map.
  useEffect(() => {
    if (!hubReady || !session) return;
    getTenantConfig(session)
      .then((cfg) => {
        setCtx((prev) => ({ ...prev, clinicName: cfg.clinic_name || prev.clinicName }));
        if (cfg.appointment_types.length > 0) {
          setServices(applyWireAppointmentTypes(cfg.appointment_types));
        }
        setDays((prev) => applyWireBusinessHours(cfg.business_hours, prev));
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

  // --- Section 04: Google Calendar ---
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
  // NOTE on the success flash below: it is honest for the fields that DO
  // persist (business hours, services/appointment types, default duration —
  // see buildConfigUpdatePayload), but a secretary who just edited the
  // demo-only fields (address, phone, insurances, tone, specialty, about,
  // gap/lead, gcal email/calendar/tz/twoWay) will see the same generic
  // success copy even though those fields were silently not sent. Left as-is
  // per the supported fields genuinely persisting; revisit if secretarIA
  // grows those wire fields and this payload still omits them.
  const handleSave = async () => {
    if (hubReady && session) {
      try {
        await updateTenantConfig(
          session,
          buildConfigUpdatePayload(days, services, prefs.defaultDur),
        );
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

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div style={{
      height: "100vh",
      display: "flex", flexDirection: "column",
      background: "var(--page)",
    }}>
      <Header theme={theme} onToggleTheme={onToggleTheme} />

      {/* demo-mode / not-entitled notice — hidden once the real hub is active */}
      <HubNotice session={session} notEntitled={notEntitled} ready={hubCheckReady} />

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

            {/* four config sections stacked vertically */}
            <div style={{ display: "flex", flexDirection: "column", gap: 34 }}>
              <ContextSection v={ctx} set={setCtxK} />
              <ServicesSection services={services} setServices={setServices} />
              <AvailabilitySection
                days={days}
                setDays={setDays}
                prefs={prefs}
                setPref={setPrefK}
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
