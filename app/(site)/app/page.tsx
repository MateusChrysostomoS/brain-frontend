"use client";

// /app — Unified post-login dashboard shell.
// Reads session from sessionStorage, calls getEntitlements(), then renders
// the appropriate panel (PreCheck / secretarIA / no-entitlements) gated by
// tenant entitlements. Ported from _design-source/dashboard.html.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrandGlyph } from "../_components/BrandGlyph";
import { BrandIcon } from "../_components/BrandIcon";
import { ThemeToggle } from "../_components/ThemeToggle";
import {
  clearSession,
  getEntitlements,
  getPrecheckSsoToken,
  getSession,
  ManageApiError,
  type Entitlements,
  type Session,
} from "@/lib/manage-api";
import { setToken } from "@/lib/auth";
import "./dashboard-shell.css";

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

type DotColor = "red" | "amber" | "green";
type PcStatus = "wait" | "done";
type SaStatus = "done" | "teal" | "amber";

type PcRow = {
  name: string;
  time: string;
  type: string;
  desc: string;
  status: PcStatus;
  lv: DotColor;
  dots: DotColor[];
};

type SaRow = {
  time: string;
  dur: string;
  name: string;
  type: string;
  status: SaStatus;
  label: string;
  via: string; // "IA" | ""
};

// ---------------------------------------------------------------------------
// Sample data — verbatim from dashboard.html PC_DATA / SA_DATA
// ---------------------------------------------------------------------------

const PC_DATA: PcRow[] = [
  {
    name: "André Coutinho",
    time: "17/06 10:00",
    type: "Primeira consulta",
    desc: "Dor torácica em aperto há 2 dias, irradiando para o braço esquerdo.",
    status: "wait",
    lv: "red",
    dots: ["red", "red", "amber"],
  },
  {
    name: "Fernanda Lemos",
    time: "17/06 09:14",
    type: "Retorno",
    desc: "",
    status: "wait",
    lv: "amber",
    dots: ["amber", "amber"],
  },
  {
    name: "Helena Vasconcelos",
    time: "16/06 16:40",
    type: "Retorno",
    desc: "Cefaleia há 4 dias com fotofobia; melhora parcial com analgésico.",
    status: "done",
    lv: "green",
    dots: ["green", "green", "green"],
  },
  {
    name: "Roberto Almeida",
    time: "16/06 15:03",
    type: "Avaliação",
    desc: "HAS sem aferição há 8 meses; relata tontura ocasional.",
    status: "wait",
    lv: "amber",
    dots: ["amber", "green"],
  },
  {
    name: "Camila Rezende",
    time: "16/06 08:07",
    type: "Retorno",
    desc: "Sem queixas ativas no momento da consulta.",
    status: "done",
    lv: "green",
    dots: ["green", "green"],
  },
  {
    name: "Lucas Tavares",
    time: "13/06 16:58",
    type: "Primeira consulta",
    desc: "Dificuldade de respiração; cirurgia de desvio de septo agendada.",
    status: "wait",
    lv: "amber",
    dots: ["amber", "amber", "green"],
  },
  {
    name: "Patrícia Nogueira",
    time: "12/06 11:10",
    type: "Teleconsulta",
    desc: "",
    status: "wait",
    lv: "green",
    dots: ["green", "green"],
  },
  {
    name: "Sofia Marques",
    time: "12/06 10:09",
    type: "Retorno",
    desc: "Acompanhamento de exames laboratoriais recentes.",
    status: "wait",
    lv: "green",
    dots: ["green"],
  },
];

const SA_DATA: SaRow[] = [
  { time: "08:00", dur: "40 min", name: "Camila Rezende",   type: "Retorno",           status: "done",  label: "Compareceu", via: "" },
  { time: "08:50", dur: "50 min", name: "Júlia Bernardes",  type: "Consulta",           status: "teal",  label: "Confirmou",  via: "" },
  { time: "10:00", dur: "60 min", name: "André Coutinho",   type: "Primeira consulta",  status: "teal",  label: "Confirmou",  via: "IA" },
  { time: "11:10", dur: "30 min", name: "Fernanda Lemos",   type: "Retorno",            status: "amber", label: "Agendado",   via: "IA" },
  { time: "14:00", dur: "50 min", name: "Lucas Tavares",    type: "Consulta",           status: "teal",  label: "Confirmou",  via: "" },
  { time: "15:00", dur: "40 min", name: "Patrícia Nogueira",type: "Teleconsulta",       status: "amber", label: "Agendado",   via: "IA" },
  { time: "16:00", dur: "60 min", name: "Roberto Almeida",  type: "Avaliação",          status: "amber", label: "Agendado",   via: "" },
  { time: "17:30", dur: "30 min", name: "Sofia Marques",    type: "Retorno",            status: "amber", label: "Agendado",   via: "" },
];

// Maps status → badge modifier class
const PC_BADGE: Record<PcStatus, string> = {
  wait: "badge--wait",
  done: "badge--done",
};
const SA_BADGE: Record<SaStatus, string> = {
  done:  "badge--done",
  teal:  "badge--teal",
  amber: "badge--amber",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

// PreCheckRow — single anamnesis card in the PreCheck panel.
function PreCheckRow({ r }: { r: PcRow }) {
  return (
    <div className={`row-card lv-${r.lv}`}>
      <div className="row-main">
        <div className="row-name">{r.name}</div>
        <div className="row-meta">
          {r.time} · <b>{r.type}</b>
        </div>
        {r.desc ? (
          <div className="row-desc">{r.desc}</div>
        ) : (
          <div className="row-desc empty">Sem descrição registrada.</div>
        )}
      </div>
      <div className="row-right">
        <span className={`badge ${PC_BADGE[r.status]}`}>
          <span className="d" />
          {r.status === "done" ? "Atendido" : "Em espera"}
        </span>
        <span className="lvl-dots">
          {r.dots.map((d, i) => (
            <span key={i} className={`dot dot--${d}`} />
          ))}
        </span>
      </div>
    </div>
  );
}

// SecretariaRow — single appointment card in the secretarIA panel.
function SecretariaRow({ r }: { r: SaRow }) {
  return (
    <div className="row-card">
      <div className="row-time">
        <div className="t">{r.time}</div>
        <div className="dur">{r.dur}</div>
      </div>
      <div className="row-main">
        <div className="row-name">{r.name}</div>
        <div className="row-meta">
          <b>{r.type}</b>
        </div>
      </div>
      {/* right cluster: optional IA badge + status badge */}
      <div className="row-right" style={{ flexDirection: "row", alignItems: "center" }}>
        {r.via === "IA" && (
          <span className="badge badge--teal" style={{ marginRight: 4 }}>
            <span className="d" />
            marcada pela IA
          </span>
        )}
        <span className={`badge ${SA_BADGE[r.status]}`}>
          <span className="d" />
          {r.label}
        </span>
      </div>
    </div>
  );
}

// PreCheckPanel — full PreCheck section including head, search, filters, rows, pagination.
// `onOpen` runs the SSO handoff into the ported PreCheck dashboard; `pending`/`error`
// drive the "Abrir painel completo" button state.
function PreCheckPanel({
  onOpen,
  pending,
  error,
}: {
  onOpen: () => void;
  pending: boolean;
  error: string | null;
}) {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Painel clínico · PreCheck</span>
          <h1 className="panel-title">
            Anamneses <span className="em">do dia</span>.
          </h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
          <div className="panel-stats">
            <div>
              <div className="v">28</div>
              <div className="k">Total</div>
            </div>
            <div>
              <div className="v em">19</div>
              <div className="k">Em espera</div>
            </div>
          </div>
          {/* SSO handoff into the ported PreCheck dashboard (/dashboard): brain-api mints
              a PreCheck-compatible token, the page stores it as `precheck_token` (same
              origin), then navigates — no second login. 403/409 surface inline. */}
          <div
            className="panel-actions"
            style={{ flexDirection: "column", alignItems: "flex-end", gap: 6 }}
          >
            <button
              type="button"
              className="btn btn--outline btn--sm"
              onClick={onOpen}
              disabled={pending}
            >
              <BrandIcon name="arrowR" />
              {pending ? "Abrindo…" : "Abrir painel completo"}
            </button>
            {error && (
              <p
                role="alert"
                style={{
                  fontSize: 12.5,
                  lineHeight: 1.4,
                  color: "var(--danger, #c0392b)",
                  maxWidth: 260,
                  textAlign: "right",
                  margin: 0,
                }}
              >
                {error}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="search">
        <BrandIcon name="user" />
        <input placeholder="Buscar por nome do paciente…" readOnly />
      </div>
      <div className="filters">
        <span className="filt-label">Data</span>
        <div className="seg">
          <button className="on">Todos</button>
          <button>Hoje</button>
          <button>Últimos 7 dias</button>
        </div>
        <span className="filt-label" style={{ marginLeft: 8 }}>Status</span>
        <div className="seg">
          <button className="on">Todos</button>
          <button>Em espera</button>
          <button>Atendido</button>
        </div>
      </div>
      <div className="reg-count">28 registros</div>

      <div className="rows">
        {PC_DATA.map((r) => (
          <PreCheckRow key={r.name + r.time} r={r} />
        ))}
      </div>

      <div className="pagination">
        <div>
          Por página · <b style={{ color: "var(--ink-soft)" }}>20</b>
        </div>
        <div className="pg">
          <span>Página 1 de 2</span>
          <button className="btn btn--outline btn--sm">
            Próxima <BrandIcon name="arrowR" />
          </button>
        </div>
      </div>
    </section>
  );
}

// SecretariaPanel — full secretarIA section including head, search, filters, rows, pagination.
function SecretariaPanel() {
  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Agenda · secretarIA</span>
          <h1 className="panel-title">
            Agenda de <span className="em">hoje</span>.
          </h1>
          <p className="muted" style={{ fontSize: 14, marginTop: 6 }}>
            Terça, 02/06 · Consultório Dr. Aurélio Lima
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
          <div className="panel-stats">
            <div>
              <div className="v">8</div>
              <div className="k">Consultas</div>
            </div>
            <div>
              <div className="v em">3</div>
              <div className="k">Marcadas pela IA</div>
            </div>
          </div>
          <div className="panel-actions">
            <Link href="/secretaria/configuracao" className="btn btn--outline btn--sm">
              <BrandIcon name="sliders" />
              Configurar
            </Link>
            <Link href="/secretaria/agenda" className="btn btn--primary btn--sm">
              <BrandIcon name="calendar" />
              Abrir agenda completa
            </Link>
          </div>
        </div>
      </div>

      <div className="search">
        <BrandIcon name="user" />
        <input placeholder="Buscar paciente ou horário…" readOnly />
      </div>
      <div className="filters">
        <span className="filt-label">Período</span>
        <div className="seg">
          <button className="on">Hoje</button>
          <button>Semana</button>
        </div>
        <span className="filt-label" style={{ marginLeft: 8 }}>Status</span>
        <div className="seg">
          <button className="on">Todos</button>
          <button>Confirmadas</button>
          <button>Pendentes</button>
        </div>
      </div>
      <div className="reg-count">8 consultas hoje</div>

      <div className="rows">
        {SA_DATA.map((r) => (
          <SecretariaRow key={r.time + r.name} r={r} />
        ))}
      </div>

      <div className="pagination">
        <div>
          Sincronizado com Google Calendar ·{" "}
          <b style={{ color: "var(--ink-soft)" }}>há 2 min</b>
        </div>
        <div className="pg">
          <Link href="/secretaria/agenda" className="btn btn--ghost btn--sm">
            Ver semana inteira <BrandIcon name="arrowR" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// NoEntitlementsPanel — lock empty state shown when clinic has no active products.
function NoEntitlementsPanel() {
  return (
    <section className="panel">
      <div className="empty-ent">
        <span className="feat-ico">
          <BrandIcon name="lock" />
        </span>
        <h2 className="h-card" style={{ fontSize: 24 }}>
          Sua clínica ainda não tem um produto ativo
        </h2>
        <p className="muted mt-s">
          Fale com a Brain para liberar o PreCheck, a secretarIA, ou os dois para o seu consultório.
        </p>
        <a className="btn btn--primary mt-l" href="/#contato">
          Agendar demonstração
        </a>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Page — root component for the /app route.
// Manages async boot: reads session → calls getEntitlements → updates state.
// ---------------------------------------------------------------------------
export default function AppPage() {
  // --- State ---
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ent, setEnt] = useState<Entitlements | null>(null);
  const [clinicLabel, setClinicLabel] = useState("Administrador");
  // Active product tab; resolved after entitlements load
  const [activeTab, setActiveTab] = useState<"precheck" | "secretaria">("precheck");
  // Session kept in state for the PreCheck SSO handoff (POST /sso/precheck/token).
  const [session, setSession] = useState<Session | null>(null);
  // "Abrir PreCheck" handoff UI state.
  const [ssoPending, setSsoPending] = useState(false);
  const [ssoError, setSsoError] = useState<string | null>(null);

  // --- Boot: require a session, then fetch entitlements from brain-api ---
  useEffect(() => {
    const current = getSession();
    if (!current?.token) {
      // Not logged in — send the user to the unified login.
      router.replace("/login");
      return;
    }
    setSession(current);
    getEntitlements(current)
      .then((e) => {
        setEnt(e);
        // Strip "Consultório " prefix; fall back to "Administrador"
        setClinicLabel(
          e.clinicName ? e.clinicName.replace("Consultório ", "") : "Administrador",
        );
        // Default active tab: precheck if entitled, else secretaria
        setActiveTab(e.precheck ? "precheck" : "secretaria");
        setLoading(false);
      })
      .catch(() => {
        // Expired/invalid session (401) — clear it and bounce to login.
        clearSession();
        router.replace("/login");
      });
  }, [router]);

  // --- PreCheck SSO handoff ---
  // Exchange the brain session for a PreCheck-compatible token, store it as PreCheck's
  // own `precheck_token` (same origin as /dashboard), then navigate. The ported dashboard
  // reads that token and calls the real PreCheck backend — no second login.
  async function openPrecheck() {
    if (!session) return;
    setSsoError(null);
    setSsoPending(true);
    try {
      const { token } = await getPrecheckSsoToken(session);
      setToken(token);
      router.push("/dashboard");
    } catch (e) {
      const status = e instanceof ManageApiError ? e.status : 0;
      setSsoError(
        status === 403
          ? "Sua clínica não tem o PreCheck habilitado."
          : status === 409
            ? "Sua conta ainda não está conectada ao PreCheck. Peça ao administrador da clínica para vincular seu acesso."
            : "Não foi possível abrir o PreCheck agora. Tente novamente.",
      );
      setSsoPending(false); // on success we navigate away, so only reset on failure
    }
  }

  // --- Derived: which tab is logically active given current entitlements ---
  const resolvedTab =
    ent && !ent[activeTab]
      ? ent.precheck
        ? "precheck"
        : "secretaria"
      : activeTab;

  // Whether to show the tab switcher (only when both products are entitled)
  const showTabs = ent?.precheck && ent?.secretaria;

  // Initials for the avatar — take first letter of clinic label
  const avatarInitial = clinicLabel.charAt(0).toUpperCase();

  // --- Render ---
  return (
    <>
      {/* ==================== HEADER ==================== */}
      <header className="dash-header">
        <div className="container dash-nav">
          {/* Brand mark → home */}
          <Link className="brand-mark" href="/" aria-label="Brain">
            <BrandGlyph size={28} />
            <span className="wordmark" style={{ fontSize: 22 }}>
              Brain
            </span>
          </Link>

          {/* Product tab switcher — hidden when only one product is entitled */}
          {showTabs && (
            <div className="prod-tabs" role="tablist">
              {ent?.precheck && (
                <button
                  className={`prod-tab${resolvedTab === "precheck" ? " on" : ""}`}
                  role="tab"
                  aria-selected={resolvedTab === "precheck"}
                  onClick={() => setActiveTab("precheck")}
                >
                  <BrandIcon name="note" />
                  PreCheck
                </button>
              )}
              {ent?.secretaria && (
                <button
                  className={`prod-tab${resolvedTab === "secretaria" ? " on" : ""}`}
                  role="tab"
                  aria-selected={resolvedTab === "secretaria"}
                  onClick={() => setActiveTab("secretaria")}
                >
                  <BrandIcon name="whatsapp" />
                  secretarIA
                </button>
              )}
            </div>
          )}

          {/* User cluster: theme toggle, avatar, clinic name, sign-out */}
          <div className="dash-user">
            <ThemeToggle />
            <span className="uava" aria-hidden="true">
              {avatarInitial}
            </span>
            <span className="uname">{clinicLabel}</span>
            <Link
              className="btn btn--outline btn--sm"
              href="/login"
              onClick={() => clearSession()}
            >
              Sair
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== LOADING ==================== */}
      {loading && (
        <div className="dash-loading" aria-live="polite" aria-label="Carregando">
          <div className="spinner" />
          <div style={{ fontSize: 13.5, fontWeight: 600 }}>
            Carregando entitlements…
          </div>
        </div>
      )}

      {/* ==================== MAIN ==================== */}
      {!loading && ent && (
        <main className="dash-main">
          {resolvedTab === "precheck" && ent.precheck && (
            <PreCheckPanel
              onOpen={openPrecheck}
              pending={ssoPending}
              error={ssoError}
            />
          )}
          {resolvedTab === "secretaria" && ent.secretaria && <SecretariaPanel />}
          {!ent.precheck && !ent.secretaria && <NoEntitlementsPanel />}
        </main>
      )}

    </>
  );
}
