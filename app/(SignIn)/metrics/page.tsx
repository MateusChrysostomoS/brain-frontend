"use client";

// Métricas (/metrics) — dashboard do Gestor. Visível para admin, role
// "manager" e qualquer usuário com is_manager (ex.: médico que também é
// gestor). Mesma identidade visual do painel (cream + teal + Instrument
// Serif). Só agregados — nenhum conteúdo clínico trafega por aqui.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashNav from "@/components/DashNav";
import { getMe, getMetricsOverview, listClinics } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";
import type { ClinicInfo, MetricsOverview } from "@/lib/types";
import "./metrics.css";

type PeriodKey = "7" | "30" | "90" | "all";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "7", label: "7 dias" },
  { key: "30", label: "30 dias" },
  { key: "90", label: "90 dias" },
  { key: "all", label: "Desde o início" },
];

const SCORE_LABELS: Record<string, string> = {
  "5": "Muito fácil",
  "4": "Fácil",
  "3": "Neutro",
  "2": "Difícil",
  "1": "Muito difícil",
};

function fmtHours(h: number | null): string {
  if (h == null) return "—";
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h.toFixed(1).replace(".", ",")} h`;
  return `${(h / 24).toFixed(1).replace(".", ",")} dias`;
}

export default function MetricsPage() {
  const router = useRouter();

  const [clinic, setClinic] = useState("");
  const [role, setRole] = useState<string>("");
  const [isManager, setIsManager] = useState(false);
  const [superadmin, setSuperadmin] = useState(false);

  const [period, setPeriod] = useState<PeriodKey>("30");
  const [clinicFilter, setClinicFilter] = useState<number | null>(null);
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);

  const [data, setData] = useState<MetricsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const { logout, requireAuth, handleAuthError } = useAuthGuard();

  const fetchOverview = useCallback(
    async (p: PeriodKey, clinicId: number | null) => {
      setLoading(true);
      setError(false);
      try {
        const overview = await getMetricsOverview({
          all: p === "all",
          days: p === "all" ? undefined : Number(p),
          clinicId,
        });
        setData(overview);
      } catch (e) {
        if (!handleAuthError(e)) setError(true);
      } finally {
        setLoading(false);
      }
    },
    [handleAuthError],
  );

  // ── Auth + primeira carga ───────────────────────────────────────
  useEffect(() => {
    if (!requireAuth()) return;
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        const canMetrics =
          me.role === "admin" || me.role === "manager" || !!me.is_manager;
        if (!canMetrics) {
          router.replace("/dashboard");
          return;
        }
        setClinic(me.name || "");
        setRole(me.role || "");
        setIsManager(!!me.is_manager);
        const isSuper = me.role === "admin" && me.clinic_id == null;
        setSuperadmin(isSuper);
        if (isSuper) {
          // Select de clínica é best-effort — as métricas carregam sem ele.
          listClinics()
            .then((res) => {
              if (!cancelled) setClinics(res.items || []);
            })
            .catch(() => {});
        }
        await fetchOverview("30", null);
      } catch (e) {
        if (cancelled) return;
        if (!handleAuthError(e)) {
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, requireAuth, handleAuthError, fetchOverview]);

  const changePeriod = (p: PeriodKey) => {
    setPeriod(p);
    fetchOverview(p, clinicFilter);
  };
  const changeClinic = (value: string) => {
    const id = value === "" ? null : Number(value);
    setClinicFilter(id);
    fetchOverview(period, id);
  };

  // ── Derivados ───────────────────────────────────────────────────
  const distribution = useMemo(() => {
    const dist = data?.satisfaction?.distribution ?? {};
    const max = Math.max(1, ...Object.values(dist));
    return ["5", "4", "3", "2", "1"].map((score) => ({
      score,
      label: SCORE_LABELS[score],
      count: dist[score] ?? 0,
      pct: Math.round(((dist[score] ?? 0) / max) * 100),
    }));
  }, [data]);

  const timeline = useMemo(() => {
    const points = data?.timeline ?? [];
    const tail = points.slice(-30);
    const max = Math.max(1, ...tail.map((p) => p.total));
    return tail.map((p) => ({
      ...p,
      pct: Math.max(6, Math.round((p.total / max) * 100)),
      shortDay: p.day.slice(8, 10) + "/" + p.day.slice(5, 7),
    }));
  }, [data]);

  const scored = data
    ? data.satisfaction.responses - data.satisfaction.unscored
    : 0;

  // ── Render ──────────────────────────────────────────────────────
  return (
    <div className="metrics-route">
      <DashNav clinic={clinic} role={role} isManager={isManager} onLogout={logout} />

      <main className="metrics">
        <header className="metrics-head">
          <div>
            <span className="eyebrow">Métricas</span>
            <h1>
              O pulso do <em>PreCheck</em>.
            </h1>
            <p className="metrics-sub">
              Quantas pessoas fizeram a pré-consulta, quem atendeu, e como foi a
              experiência — sem expor nenhum dado clínico.
              {data?.clinic_name ? ` Clínica: ${data.clinic_name}.` : ""}
            </p>
          </div>
        </header>

        <div className="metrics-toolbar">
          <div className="metrics-filters" role="tablist" aria-label="Período">
            {PERIODS.map((p) => (
              <button
                key={p.key}
                type="button"
                role="tab"
                aria-selected={period === p.key}
                className={`metrics-pill${period === p.key ? " active" : ""}`}
                onClick={() => changePeriod(p.key)}
              >
                {p.label}
              </button>
            ))}
          </div>

          {superadmin && (
            <select
              className="metrics-clinic-select"
              value={clinicFilter ?? ""}
              onChange={(e) => changeClinic(e.target.value)}
              aria-label="Filtrar por clínica"
            >
              <option value="">Todas as clínicas</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {loading ? (
          <div className="state">Carregando…</div>
        ) : error || !data ? (
          <div className="state">
            Não foi possível carregar as métricas. Tente novamente em alguns
            segundos.
          </div>
        ) : (
          <>
            {/* ── KPIs ─────────────────────────────────────────── */}
            <section className="kpi-grid" aria-label="Indicadores">
              <div className="kpi">
                <div className="num">
                  <em>{data.totals.summaries}</em>
                </div>
                <div className="label">PreChecks</div>
              </div>
              <div className="kpi">
                <div className="num">{data.totals.patients}</div>
                <div className="label">pacientes</div>
              </div>
              <div className="kpi kpi-good">
                <div className="num">{data.totals.approved}</div>
                <div className="label">atendidos</div>
              </div>
              <div className="kpi kpi-warn">
                <div className="num">{data.totals.draft}</div>
                <div className="label">aguardando</div>
              </div>
              <div className="kpi kpi-bad">
                <div className="num">{data.totals.rejected}</div>
                <div className="label">rejeitados</div>
              </div>
              <div className="kpi">
                <div className="num">
                  {data.satisfaction.average != null ? (
                    <>
                      <em>{data.satisfaction.average.toFixed(2).replace(".", ",")}</em>
                      <span className="kpi-of"> / 5</span>
                    </>
                  ) : (
                    "—"
                  )}
                </div>
                <div className="label">satisfação média</div>
              </div>
              <div className="kpi">
                <div className="num">{fmtHours(data.avg_hours_to_review)}</div>
                <div className="label">tempo até triagem</div>
              </div>
            </section>

            <div className="metrics-columns">
              {/* ── Satisfação ─────────────────────────────────── */}
              <section className="panel" aria-label="Satisfação">
                <h2>Como foi a experiência</h2>
                <p className="panel-sub">
                  {scored === 1 ? "1 resposta" : `${scored} respostas`} à pergunta
                  de avaliação do fluxo
                  {data.satisfaction.unscored > 0
                    ? ` (+${data.satisfaction.unscored} fora do padrão)`
                    : ""}
                  .
                </p>
                {scored === 0 ? (
                  <div className="panel-empty">
                    Nenhuma avaliação registrada no período.
                  </div>
                ) : (
                  <div className="sat-bars">
                    {distribution.map((d) => (
                      <div className="sat-row" key={d.score}>
                        <span className="sat-label">{d.label}</span>
                        <div className="sat-track">
                          <div
                            className={`sat-fill sat-${d.score}`}
                            style={{ width: `${d.pct}%` }}
                          />
                        </div>
                        <span className="sat-count">{d.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* ── Por médico ─────────────────────────────────── */}
              <section className="panel" aria-label="Atendimentos por médico">
                <h2>Atendimentos por médico</h2>
                <p className="panel-sub">
                  Quem triou cada laudo (marcou como atendido ou rejeitado).
                </p>
                {data.per_doctor.length === 0 ? (
                  <div className="panel-empty">
                    Nenhum laudo triado no período.
                  </div>
                ) : (
                  <table className="metrics-table">
                    <thead>
                      <tr>
                        <th>Médico</th>
                        <th className="num-col">Atendidos</th>
                        <th className="num-col">Rejeitados</th>
                        <th className="num-col">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.per_doctor.map((d) => (
                        <tr key={d.doctor_id}>
                          <td>{d.name}</td>
                          <td className="num-col good">{d.approved}</td>
                          <td className="num-col bad">{d.rejected}</td>
                          <td className="num-col">{d.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {data.unattributed_reviews > 0 && (
                  <p className="panel-note">
                    {data.unattributed_reviews === 1
                      ? "1 laudo triado antes do rastreio de revisor (sem médico identificado)."
                      : `${data.unattributed_reviews} laudos triados antes do rastreio de revisor (sem médico identificado).`}
                  </p>
                )}
              </section>
            </div>

            {/* ── Linha do tempo ───────────────────────────────── */}
            <section className="panel" aria-label="PreChecks por dia">
              <h2>PreChecks por dia</h2>
              <p className="panel-sub">
                Volume de pré-consultas concluídas{timeline.length === 30 ? " (últimos 30 dias com atividade)" : ""}.
              </p>
              {timeline.length === 0 ? (
                <div className="panel-empty">Nenhum PreCheck no período.</div>
              ) : (
                <div className="tl-chart" role="img" aria-label="Gráfico de PreChecks por dia">
                  {timeline.map((p) => (
                    <div className="tl-col" key={p.day} title={`${p.day}: ${p.total}`}>
                      <div className="tl-bar" style={{ height: `${p.pct}%` }} />
                      <span className="tl-day">{p.shortDay}</span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* ── Por clínica (superadmin) ─────────────────────── */}
            {data.per_clinic && data.per_clinic.length > 0 && (
              <section className="panel" aria-label="Por clínica">
                <h2>Por clínica</h2>
                <p className="panel-sub">Visão geral de todas as clínicas ativas no período.</p>
                <table className="metrics-table">
                  <thead>
                    <tr>
                      <th>Clínica</th>
                      <th className="num-col">PreChecks</th>
                      <th className="num-col">Satisfação</th>
                      <th className="num-col">Respostas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.per_clinic.map((c) => (
                      <tr key={c.clinic_id}>
                        <td>{c.name}</td>
                        <td className="num-col">{c.summaries}</td>
                        <td className="num-col">
                          {c.satisfaction_average != null
                            ? c.satisfaction_average.toFixed(2).replace(".", ",")
                            : "—"}
                        </td>
                        <td className="num-col">{c.satisfaction_responses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
