"use client";

// /admin/metrics — platform-wide PreCheck usage/quality dashboard (ported from
// PreCheck's own /metrics screen, restyled with the Brain design system — no
// metrics.css, just brand-ds.css/PortalShell.css classes + local inline styles for
// the two custom charts, matching the app's inline-style idiom (see
// app/(site)/doctor/anamneses/page.tsx). Admin-only; no clinic filter (this IS the
// platform's cross-clinic view, unlike PreCheck's own superadmin-scoped screen).

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  clearSession,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import {
  adminGetMetrics,
  type AdminMetrics,
  type Session,
} from "@/lib/manage-api";

type PeriodKey = "7" | "30" | "90" | "all";

const PERIODS: { key: PeriodKey; label: string }[] = [
  { key: "7", label: "7 dias" },
  { key: "30", label: "30 dias" },
  { key: "90", label: "90 dias" },
  { key: "all", label: "Desde o início" },
];

// PreCheck satisfaction-question score (1..5) → PT-BR label, worst to best display
// order (5 first) — mirrors PreCheck's own SCORE_LABELS.
const SCORE_LABELS: Record<string, string> = {
  "5": "Muito fácil",
  "4": "Fácil",
  "3": "Neutro",
  "2": "Difícil",
  "1": "Muito difícil",
};

// Formats avg_hours_to_review the same way PreCheck's dashboard does: minutes under
// an hour, hours under two days, days beyond that — always PT-BR comma decimals.
function fmtHours(h: number | null): string {
  if (h == null) return "—";
  if (h < 1) return `${Math.round(h * 60)} min`;
  if (h < 48) return `${h.toFixed(1).replace(".", ",")} h`;
  return `${(h / 24).toFixed(1).replace(".", ",")} dias`;
}

// pt-BR number with comma decimals, 2 places — same convention PreCheck uses for
// satisfaction averages.
function fmtScore(n: number): string {
  return n.toFixed(2).replace(".", ",");
}

function formatShortDay(iso: string): string {
  // iso is "yyyy-mm-dd" — slice avoids a timezone-shifting Date() round trip.
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export default function AdminMetricsPage() {
  const { session, ready } = usePortalGuard(["admin"]);
  if (!ready || !session) return null;
  return <AdminMetricsInner session={session} />;
}

function AdminMetricsInner({ session }: { session: Session }) {
  const [period, setPeriod] = useState<PeriodKey>("30");
  const [data, setData] = useState<AdminMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchOverview = useCallback(
    (p: PeriodKey) => {
      setLoading(true);
      setError(false);
      adminGetMetrics(session, p === "all" ? { all: true } : { days: Number(p) })
        .then((overview) => setData(overview))
        .catch((e) => {
          if (isSessionExpired(e)) {
            clearSession();
            window.location.assign("/login");
            return;
          }
          setError(true);
        })
        .finally(() => setLoading(false));
    },
    [session],
  );

  useEffect(() => {
    fetchOverview("30");
    // Only on mount — changePeriod below drives subsequent refetches explicitly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function changePeriod(p: PeriodKey) {
    setPeriod(p);
    fetchOverview(p);
  }

  // --- Derived: satisfaction distribution bars (5 -> 1, scaled to the tallest bar) ---
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

  // --- Derived: last 30 timeline points, scaled to the tallest bar (min 6% so a
  // day with activity is never visually a sliver) ---
  const timeline = useMemo(() => {
    const points = data?.timeline ?? [];
    const tail = points.slice(-30);
    const max = Math.max(1, ...tail.map((p) => p.total));
    return tail.map((p) => ({
      ...p,
      pct: Math.max(6, Math.round((p.total / max) * 100)),
      shortDay: formatShortDay(p.day),
    }));
  }, [data]);

  // `data?.satisfaction` (not just `data`): the stub payload ({ stub: true }) has no
  // satisfaction block, and this line runs before the render branches on `stub`.
  const scored = data?.satisfaction ? data.satisfaction.responses - data.satisfaction.unscored : 0;
  const stub = Boolean(data?.stub);

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Métricas</h1>
          <p className="sub">
            O pulso do PreCheck em toda a plataforma: quantas pré-consultas, quem
            atendeu, e como foi a experiência — sem dado clínico.
          </p>
        </div>
      </header>

      <div className="portal-toolbar" role="tablist" aria-label="Período">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            type="button"
            role="tab"
            aria-selected={period === p.key}
            className={`portal-filter-pill${period === p.key ? " active" : ""}`}
            onClick={() => changePeriod(p.key)}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error ? (
        <div className="portal-error">Não foi possível carregar as métricas.</div>
      ) : loading || !data ? (
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      ) : stub ? (
        <div className="ptable-wrap">
          <div className="portal-state">
            Integração com o PreCheck não configurada neste ambiente.
          </div>
        </div>
      ) : (
        <>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-value">{data.totals.summaries}</div>
              <div className="stat-label">PreChecks</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totals.patients}</div>
              <div className="stat-label">Pacientes</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totals.approved}</div>
              <div className="stat-label">Atendidos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totals.draft}</div>
              <div className="stat-label">Aguardando</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{data.totals.rejected}</div>
              <div className="stat-label">Rejeitados</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {data.satisfaction.average != null ? (
                  <>
                    {fmtScore(data.satisfaction.average)}
                    <span style={{ fontSize: 16, fontWeight: 500, color: "var(--ink-soft)" }}>
                      {" "}
                      / 5
                    </span>
                  </>
                ) : (
                  "—"
                )}
              </div>
              <div className="stat-label">Satisfação média</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{fmtHours(data.avg_hours_to_review)}</div>
              <div className="stat-label">Tempo até triagem</div>
            </div>
          </div>

          {/* --- Satisfaction distribution --- */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="h-card" style={{ marginBottom: 6 }}>
              Como foi a experiência
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 16 }}>
              {scored === 1 ? "1 resposta" : `${scored} respostas`} à pergunta de
              avaliação do fluxo
              {data.satisfaction.unscored > 0
                ? ` (+${data.satisfaction.unscored} fora do padrão)`
                : ""}
              .
            </p>
            {scored === 0 ? (
              <p style={{ color: "var(--ink-faint)", fontSize: 13.5 }}>
                Nenhuma avaliação registrada no período.
              </p>
            ) : (
              <div style={{ display: "grid", gap: 10 }}>
                {distribution.map((d) => (
                  <div
                    key={d.score}
                    style={{ display: "grid", gridTemplateColumns: "110px 1fr 34px", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>{d.label}</span>
                    <div style={{ height: 10, borderRadius: 999, background: "var(--surface-inset)", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${d.pct}%`,
                          borderRadius: 999,
                          background: "var(--brand)",
                          transition: "width 0.2s var(--ease)",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, textAlign: "right" }}>{d.count}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- Per doctor --- */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="h-card" style={{ marginBottom: 6 }}>
              Atendimentos por médico
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 16 }}>
              Quem triou cada laudo (marcou como atendido ou rejeitado).
            </p>
            {data.per_doctor.length === 0 ? (
              <div className="portal-state">Nenhum laudo triado no período.</div>
            ) : (
              <div className="ptable-wrap">
                <table className="ptable">
                  <thead>
                    <tr>
                      <th>Médico</th>
                      <th>Atendidos</th>
                      <th>Rejeitados</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.per_doctor.map((d) => (
                      <tr key={d.doctor_id}>
                        <td className="cell-strong">{d.name}</td>
                        <td>{d.approved}</td>
                        <td>{d.rejected}</td>
                        <td className="cell-muted">{d.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {data.unattributed_reviews > 0 && (
              <p style={{ color: "var(--ink-faint)", fontSize: 12.5, marginTop: 12 }}>
                {data.unattributed_reviews === 1
                  ? "1 laudo triado antes do rastreio de revisor (sem médico identificado)."
                  : `${data.unattributed_reviews} laudos triados antes do rastreio de revisor (sem médico identificado).`}
              </p>
            )}
          </section>

          {/* --- Timeline --- */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="h-card" style={{ marginBottom: 6 }}>
              PreChecks por dia
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 16 }}>
              Volume de pré-consultas concluídas
              {timeline.length === 30 ? " (últimos 30 dias com atividade)" : ""}.
            </p>
            {timeline.length === 0 ? (
              <div className="portal-state">Nenhum PreCheck no período.</div>
            ) : (
              <div
                role="img"
                aria-label="Gráfico de PreChecks por dia"
                style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140 }}
              >
                {timeline.map((p) => (
                  <div
                    key={p.day}
                    title={`${p.day}: ${p.total}`}
                    style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", gap: 6 }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: `${p.pct}%`,
                        minHeight: 3,
                        borderRadius: 4,
                        background: "var(--brand)",
                      }}
                    />
                    <span style={{ fontSize: 10, color: "var(--ink-faint)", whiteSpace: "nowrap" }}>
                      {p.shortDay}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* --- Per clinic — always shown: the Brain admin's view is platform-wide --- */}
          <section className="card">
            <h2 className="h-card" style={{ marginBottom: 6 }}>
              Por clínica
            </h2>
            <p style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: 16 }}>
              Visão geral de todas as clínicas ativas no período.
            </p>
            {!data.per_clinic || data.per_clinic.length === 0 ? (
              <div className="portal-state">Nenhum dado no período.</div>
            ) : (
              <div className="ptable-wrap">
                <table className="ptable">
                  <thead>
                    <tr>
                      <th>Clínica</th>
                      <th>PreChecks</th>
                      <th>Satisfação</th>
                      <th>Respostas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.per_clinic.map((c) => (
                      <tr key={c.clinic_id}>
                        <td className="cell-strong">{c.name}</td>
                        <td>{c.summaries}</td>
                        <td className="cell-muted">
                          {c.satisfaction_average != null ? fmtScore(c.satisfaction_average) : "—"}
                        </td>
                        <td className="cell-muted">{c.satisfaction_responses}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
