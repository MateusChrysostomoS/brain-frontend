"use client";

// SecretariaPanel — full secretarIA section of the /app dashboard: head (title +
// real tiles + nav actions), search, period filters, appointment rows. Owns its own
// parallel fetch of GET /doctor/appointments + GET /doctor/patients (joined client-
// side for display names) — every number/row/filter here comes from that data;
// there is no mock data and no fabricated "marcada pela IA" / sync-timestamp label.

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BrandIcon } from "../../_components/BrandIcon";
import { describeApiError } from "../../_components/usePortalGuard";
import {
  listDoctorAppointments,
  listDoctorPatients,
  type DoctorAppointment,
  type DoctorPatient,
  type Session,
} from "@/lib/manage-api";
import {
  durationMinutes,
  formatTimePtBR,
  isTodayLocal,
  isWithinNextWeek,
  matchesSearch,
  pluralize,
} from "./format";
import { PanelMessage, PanelSkeleton } from "./PanelStates";

// AppointmentStatus (secretaria) -> pt-BR badge copy/class. Unrecognized values
// fall back to the raw status string and the neutral "wait" badge.
const STATUS_LABEL: Record<string, string> = {
  scheduled: "Agendada",
  confirmed: "Confirmada",
  cancelled: "Cancelada",
  rescheduled: "Remarcada",
  attended: "Realizada",
  no_show: "Faltou",
};
const STATUS_BADGE: Record<string, string> = {
  scheduled: "badge--wait",
  confirmed: "badge--teal",
  cancelled: "badge--red",
  rescheduled: "badge--amber",
  attended: "badge--done",
  no_show: "badge--red",
};
function statusLabel(status: string): string {
  return STATUS_LABEL[status] ?? status;
}
function statusBadgeClass(status: string): string {
  return STATUS_BADGE[status] ?? "badge--wait";
}

// A doctor-hub schedule BLOCK (created from the calendar, not a real patient
// booking) — always appointment_type "Bloqueado" AND patient_id/phone both null.
// Excluded from every consultas list/count: it isn't a consulta.
function isScheduleBlock(a: DoctorAppointment): boolean {
  return a.appointment_type === "Bloqueado" || (a.patient_id === null && a.phone === null);
}

// Display name for a row: joined patient name -> the row's own phone -> a generic
// fallback. Appointment rows carry no name of their own (only a patient_id).
function resolveDisplayName(a: DoctorAppointment, patientNames: Map<string, string>): string {
  if (a.patient_id) {
    const name = patientNames.get(a.patient_id);
    if (name) return name;
  }
  if (a.phone) return a.phone;
  return "Paciente";
}

// SecretariaRow — single real appointment card (time, duration if known, joined
// patient name, appointment type, status badge). No fabricated AI-origin badge.
function SecretariaRow({ a, name }: { a: DoctorAppointment; name: string }) {
  const dur = durationMinutes(a.start_at, a.end_at);
  return (
    <div className="row-card">
      <div className="row-time">
        <div className="t">{formatTimePtBR(a.start_at) || "--:--"}</div>
        {dur !== null && <div className="dur">{dur} min</div>}
      </div>
      <div className="row-main">
        <div className="row-name">{name}</div>
        <div className="row-meta">
          <b>{a.appointment_type ?? "Consulta"}</b>
        </div>
      </div>
      <div className="row-right" style={{ flexDirection: "row", alignItems: "center" }}>
        <span className={`badge ${statusBadgeClass(a.status)}`}>
          <span className="d" />
          {statusLabel(a.status)}
        </span>
      </div>
    </div>
  );
}

type Period = "today" | "week" | "all";

export function SecretariaPanel({ session }: { session: Session }) {
  // --- Fetch state ---
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [patientNames, setPatientNames] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // --- Filter state ---
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<Period>("today");

  async function load() {
    setLoading(true);
    setFetchError(null);
    try {
      // allSettled (not all): the patient list is a display-name ENRICHMENT, not the
      // panel's core content. If it fails, rows still render via resolveDisplayName's
      // phone/"Paciente" fallback instead of losing the whole panel over a secondary call.
      const [apptResult, patientResult] = await Promise.allSettled([
        listDoctorAppointments(session, 0, 100),
        listDoctorPatients(session, 0, 100),
      ]);
      if (apptResult.status === "rejected") throw apptResult.reason;
      setAppointments(apptResult.value.data);
      setPatientNames(
        patientResult.status === "fulfilled"
          ? new Map(
              patientResult.value.data
                .filter((p): p is DoctorPatient & { name: string } => Boolean(p.name))
                .map((p) => [p.id, p.name]),
            )
          : new Map(),
      );
    } catch (err) {
      setFetchError(describeApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // Fetch once per mount (i.e. each time the secretarIA tab becomes active) —
    // session.token is stable for the component's lifetime.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.token]);

  // Real consultas only — schedule blocks never enter any list/count below.
  const consultas = useMemo(() => appointments.filter((a) => !isScheduleBlock(a)), [appointments]);

  // --- Tiles: always "today", independent of the active period pill below ---
  const todaysConsultas = useMemo(() => consultas.filter((a) => isTodayLocal(a.start_at)), [consultas]);
  const consultasHojeCount = useMemo(
    () => todaysConsultas.filter((a) => a.status !== "cancelled").length,
    [todaysConsultas],
  );
  const confirmadasHojeCount = useMemo(
    () => todaysConsultas.filter((a) => a.status === "confirmed").length,
    [todaysConsultas],
  );
  const canceladasHojeCount = useMemo(
    () => todaysConsultas.filter((a) => a.status === "cancelled").length,
    [todaysConsultas],
  );

  // --- Rows shown, after the period pill + search, sorted by start_at ascending
  // (undated rows sort last — they can't be placed on a timeline). ---
  const visible = useMemo(() => {
    let scoped: DoctorAppointment[];
    if (period === "today") scoped = consultas.filter((a) => isTodayLocal(a.start_at));
    else if (period === "week") scoped = consultas.filter((a) => isWithinNextWeek(a.start_at));
    else scoped = consultas;

    return scoped
      .filter((a) => matchesSearch(`${resolveDisplayName(a, patientNames)} ${a.phone ?? ""}`, search))
      .slice()
      .sort((a, b) => {
        if (a.start_at === null && b.start_at === null) return 0;
        if (a.start_at === null) return 1;
        if (b.start_at === null) return -1;
        return new Date(a.start_at).getTime() - new Date(b.start_at).getTime();
      });
  }, [consultas, period, search, patientNames]);

  const periodNoun = period === "today" ? "hoje" : period === "week" ? "nesta semana" : "no total";

  // While loading or errored, `appointments` is either empty or stale — the tiles
  // must read "—" (unknown), never a silent "0" that would misrepresent "we
  // couldn't check" as "we checked and there are none".
  const dataUnavailable = loading || Boolean(fetchError);

  return (
    <section className="panel">
      <div className="panel-head">
        <div>
          <span className="eyebrow">Agenda · secretarIA</span>
          <h1 className="panel-title">
            Agenda de <span className="em">hoje</span>.
          </h1>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 14 }}>
          <div className="panel-stats">
            <div>
              <div className="v">{dataUnavailable ? "—" : consultasHojeCount}</div>
              <div className="k">Consultas hoje</div>
            </div>
            <div>
              <div className="v em">{dataUnavailable ? "—" : confirmadasHojeCount}</div>
              <div className="k">Confirmadas hoje</div>
            </div>
            <div>
              <div className="v">{dataUnavailable ? "—" : canceladasHojeCount}</div>
              <div className="k">Canceladas hoje</div>
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

      {loading && <PanelSkeleton />}

      {!loading && fetchError && (
        <PanelMessage
          icon="ban"
          tone="error"
          title="Não foi possível carregar a agenda"
          hint={fetchError}
          action={
            <button type="button" className="btn btn--outline btn--sm" onClick={() => void load()}>
              Tentar novamente
            </button>
          }
        />
      )}

      {!loading && !fetchError && consultas.length === 0 && (
        <PanelMessage
          icon="calendar"
          title="Nenhuma consulta hoje"
          hint="Quando um paciente marcar pelo WhatsApp, a consulta aparece aqui."
        />
      )}

      {!loading && !fetchError && consultas.length > 0 && (
        <>
          <div className="search">
            <BrandIcon name="user" />
            <input
              placeholder="Buscar paciente ou telefone…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="filters">
            <span className="filt-label">Período</span>
            <div className="seg" role="group" aria-label="Filtrar por período">
              <button
                className={period === "today" ? "on" : ""}
                aria-pressed={period === "today"}
                onClick={() => setPeriod("today")}
              >
                Hoje
              </button>
              <button
                className={period === "week" ? "on" : ""}
                aria-pressed={period === "week"}
                onClick={() => setPeriod("week")}
              >
                Semana
              </button>
              <button
                className={period === "all" ? "on" : ""}
                aria-pressed={period === "all"}
                onClick={() => setPeriod("all")}
              >
                Todas
              </button>
            </div>
          </div>
          <div className="reg-count">
            {visible.length} {pluralize(visible.length, "consulta")} {periodNoun}
          </div>

          <div className="rows">
            {visible.length === 0 ? (
              <div className="panel-state panel-state--inline">
                <p className="panel-state-title">Nenhuma consulta para os filtros selecionados.</p>
              </div>
            ) : (
              visible.map((a) => (
                <SecretariaRow key={a.id} a={a} name={resolveDisplayName(a, patientNames)} />
              ))
            )}
          </div>

          <div className="pagination">
            <div className="pg" style={{ marginLeft: "auto" }}>
              <Link href="/secretaria/agenda" className="btn btn--ghost btn--sm">
                Ver semana inteira <BrandIcon name="arrowR" />
              </Link>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
