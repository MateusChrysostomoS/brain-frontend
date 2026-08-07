"use client";

// /admin/anamneses — PreCheck pre-consultation summaries across EVERY clinic
// (admin, cross-tenant view). List + detail (?id=<int>, matching the static-export
// query-param convention). Data is proxied brain-api -> PreCheck; unlike the doctor
// portal's /doctor/anamneses, the tenant is NOT derived from the JWT — brain-api's
// admin routes return every clinic's records, so each row carries its own
// tenant_id/clinic_id and the list surfaces a "Tenant" column for it.

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

import { StatusBadge, type BadgeTone } from "../../_components/StatusBadge";
import {
  clearSession,
  describeApiError,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import {
  adminGetAnamnesis,
  adminListAnamneses,
  type AdminAnamnesis,
  type AdminAnamnesisDetail,
  type Session,
} from "@/lib/manage-api";

// PreCheck Summary.status → badge.
const STATUS_LABEL: Record<string, string> = {
  draft: "Rascunho",
  approved: "Aprovado",
  rejected: "Rejeitado",
};
const STATUS_TONE: Record<string, BadgeTone> = {
  draft: "amber",
  approved: "green",
  rejected: "red",
};

function statusBadge(status: string) {
  return (
    <StatusBadge tone={STATUS_TONE[status] ?? "muted"}>
      {STATUS_LABEL[status] ?? status}
    </StatusBadge>
  );
}

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Shortens a tenant UUID for the table cell; the full id is still reachable via the
// `title` attribute (hover tooltip) so nothing is actually lost.
function shortTenantId(tenantId: string | null): ReactNode {
  if (!tenantId) return <span className="cell-muted">—</span>;
  const short = tenantId.length > 8 ? `${tenantId.slice(0, 8)}…` : tenantId;
  return (
    <span className="cell-muted" title={tenantId}>
      {short}
    </span>
  );
}

export default function AdminAnamnesesPage() {
  return (
    <Suspense fallback={null}>
      <AdminAnamnesesInner />
    </Suspense>
  );
}

function AdminAnamnesesInner() {
  const search = useSearchParams();
  const idParam = search.get("id");
  const { session, ready } = usePortalGuard(["admin"]);

  if (!ready || !session) return null;
  const id = idParam ? Number(idParam) : null;
  return id && !Number.isNaN(id) ? (
    <AdminAnamnesisDetailView session={session} id={id} />
  ) : (
    <AdminAnamnesesListView session={session} />
  );
}

// --- List ------------------------------------------------------------------

function AdminAnamnesesListView({ session }: { session: Session }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminAnamnesis[] | null>(null);
  const [stub, setStub] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    adminListAnamneses(session, 0, 100)
      .then((page) => {
        if (cancelled) return;
        setItems(page.items);
        setStub(Boolean(page.stub));
      })
      .catch((e) => {
        if (cancelled) return;
        if (isSessionExpired(e)) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [session, router]);

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Anamneses</h1>
          <p className="sub">Resumos pré-consulta de todas as clínicas (PreCheck).</p>
        </div>
      </header>

      {error ? (
        <div className="portal-error">Não foi possível carregar as anamneses.</div>
      ) : !items ? (
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      ) : items.length === 0 ? (
        <div className="ptable-wrap">
          <div className="portal-state">
            {stub
              ? "Integração com o PreCheck não configurada neste ambiente."
              : "Nenhuma anamnese registrada ainda."}
          </div>
        </div>
      ) : (
        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th>Paciente</th>
                <th>Tenant</th>
                <th>Data</th>
                <th>Status</th>
                <th>Prévia do resumo</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr
                  key={a.id}
                  className="clickable"
                  onClick={() => router.push(`/admin/anamneses?id=${a.id}`)}
                >
                  <td className="cell-strong">{a.patient_name}</td>
                  <td>{shortTenantId(a.tenant_id)}</td>
                  <td className="cell-muted">{formatDateTime(a.created_at)}</td>
                  <td>{statusBadge(a.status)}</td>
                  <td className="cell-muted" style={{ maxWidth: 360, whiteSpace: "normal" }}>
                    {a.summary_preview || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// --- Detail ----------------------------------------------------------------

function AdminAnamnesisDetailView({ session, id }: { session: Session; id: number }) {
  const router = useRouter();
  const [detail, setDetail] = useState<AdminAnamnesisDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminGetAnamnesis(session, id)
      .then((d) => {
        if (!cancelled) setDetail(d);
      })
      .catch((e) => {
        if (cancelled) return;
        if (isSessionExpired(e)) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(describeApiError(e));
      });
    return () => {
      cancelled = true;
    };
  }, [session, id, router]);

  const back = (
    <Link
      href="/admin/anamneses"
      className="btn btn--ghost btn--sm"
      style={{ marginBottom: 14, paddingLeft: 8 }}
    >
      ← Voltar para anamneses
    </Link>
  );

  if (error) {
    return (
      <>
        {back}
        <div className="portal-error">{error}</div>
      </>
    );
  }
  if (!detail) {
    return (
      <>
        {back}
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      </>
    );
  }

  return (
    <>
      {back}
      <header className="portal-page-head">
        <div>
          <h1>{detail.patient_name}</h1>
          <p className="sub">
            {formatDateTime(detail.created_at)} · {statusBadge(detail.status)}
          </p>
          <p className="sub" style={{ marginTop: 4, fontSize: 12.5 }}>
            Tenant: {detail.tenant_id ?? "—"} · Clínica #{detail.clinic_id}
          </p>
        </div>
      </header>

      <section className="card" style={{ marginBottom: 18 }}>
        <h2 className="h-card" style={{ marginBottom: 10 }}>
          Resumo da IA
        </h2>
        <p style={{ color: "var(--ink-soft)", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
          {detail.final_summary || detail.ai_summary || "Sem resumo registrado."}
        </p>
      </section>

      <StructuredSummary data={detail.structured_data} />
    </>
  );
}

// StructuredSummary — renders the complete structured summary generically (its shape
// varies by intake flow). Top-level keys become labelled blocks; nested values are shown
// as readable text or pretty JSON.
function StructuredSummary({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data ?? {});
  if (entries.length === 0) return null;

  function renderValue(value: unknown): ReactNode {
    if (value == null) return <span className="cell-muted">—</span>;
    if (typeof value === "string" || typeof value === "number") return String(value);
    return (
      <pre
        style={{
          margin: 0,
          fontFamily: "var(--font-sans)",
          fontSize: 13.5,
          color: "var(--ink-soft)",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }

  return (
    <section className="card">
      <h2 className="h-card" style={{ marginBottom: 14 }}>
        Resumo estruturado
      </h2>
      <dl style={{ display: "grid", gap: 14 }}>
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt
              style={{
                fontSize: 11.5,
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                color: "var(--ink-faint)",
                marginBottom: 4,
              }}
            >
              {key}
            </dt>
            <dd style={{ color: "var(--ink)", lineHeight: 1.55 }}>
              {renderValue(value)}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
