"use client";

// /admin/inbound — brain's own lead pipeline (RBAC task 3B): leads from the "Agendar
// demonstração" form on the marketing site. SAME data source and transitions as the
// former "Demo Requests" admin screen it replaces (adminListDemoRequests/
// adminPatchDemoRequest, NEXT_ACTIONS below) — only the name/route and the layout
// changed, ported from PreCheck's own /inbound screen (card list + status filter
// pills) restyled with the Brain design system. Per-row actions move the lead:
// "Marcar como contatado", "Converter em tenant", "Descartar".

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { StatusBadge, type BadgeTone } from "../../_components/StatusBadge";
import {
  clearSession,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import {
  adminListDemoRequests,
  adminPatchDemoRequest,
  type AdminDemoRequest,
  type DemoRequestStatus,
  type Session,
} from "@/lib/manage-api";

type StatusFilter = "all" | "new" | "contacted" | "converted" | "dismissed";

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "new", label: "Novos" },
  { key: "contacted", label: "Contatados" },
  { key: "converted", label: "Convertidos" },
  { key: "dismissed", label: "Descartados" },
];

const STATUS_LABEL: Record<string, string> = {
  new: "Novo",
  contacted: "Contatado",
  converted: "Convertido",
  dismissed: "Descartado",
};
const STATUS_TONE: Record<string, BadgeTone> = {
  new: "blue",
  contacted: "amber",
  converted: "green",
  dismissed: "muted",
};
const INTEREST_LABEL: Record<string, string> = {
  precheck: "PreCheck",
  secretaria: "secretarIA",
  ambos: "Ambos",
};

// Available transitions per current status — UNCHANGED from the old demo-requests
// screen's contract (brain-api's demo-request status machine).
const NEXT_ACTIONS: Record<string, { status: DemoRequestStatus; label: string }[]> = {
  new: [
    { status: "contacted", label: "Marcar como contatado" },
    { status: "converted", label: "Converter em tenant" },
    { status: "dismissed", label: "Descartar" },
  ],
  contacted: [
    { status: "converted", label: "Converter em tenant" },
    { status: "dismissed", label: "Descartar" },
  ],
  converted: [],
  dismissed: [],
};

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AdminInboundPage() {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["admin"]);

  const [items, setItems] = useState<AdminDemoRequest[] | null>(null);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    if (!ready || !session) return;
    let cancelled = false;
    adminListDemoRequests(session, 0, 100)
      .then((page) => {
        if (!cancelled) setItems(page.items);
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
  }, [ready, session, router]);

  const changeStatus = useCallback(
    async (lead: AdminDemoRequest, status: DemoRequestStatus) => {
      if (!session) return;
      setUpdatingId(lead.id);
      try {
        const updated = await adminPatchDemoRequest(session, lead.id, status);
        setItems((prev) => (prev ? prev.map((i) => (i.id === lead.id ? updated : i)) : prev));
      } catch (e) {
        if (isSessionExpired(e)) {
          clearSession();
          router.replace("/login");
        }
      } finally {
        setUpdatingId(null);
      }
    },
    [session, router],
  );

  // --- Derived: per-status counts (drives both the stat trio and the filter pills) ---
  const counts = useMemo(() => {
    const acc: Record<string, number> = { all: 0, new: 0, contacted: 0, converted: 0, dismissed: 0 };
    for (const i of items ?? []) {
      acc.all += 1;
      if (acc[i.status] != null) acc[i.status] += 1;
    }
    return acc;
  }, [items]);

  const filtered = useMemo(() => {
    if (!items) return [];
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  if (!ready || !session) return null;

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Inbound</h1>
          <p className="sub">Leads do formulário &quot;Agendar demonstração&quot; do Brain.</p>
        </div>
      </header>

      {items && (
        <div className="stat-grid">
          <div className="stat-card">
            <div className="stat-value">{counts.new}</div>
            <div className="stat-label">Novos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{counts.contacted}</div>
            <div className="stat-label">Contatados</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{counts.converted}</div>
            <div className="stat-label">Convertidos</div>
          </div>
        </div>
      )}

      <div className="portal-toolbar" role="tablist" aria-label="Filtrar leads por status">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            role="tab"
            aria-selected={filter === f.key}
            className={`portal-filter-pill${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span style={{ marginLeft: 6, opacity: 0.7 }}>{counts[f.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {error ? (
        <div className="portal-error">Não foi possível carregar os leads.</div>
      ) : !items ? (
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="ptable-wrap">
          <div className="portal-state">
            {filter === "all" ? "Nenhum lead recebido ainda." : "Nenhum lead nesse status."}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: 14 }}>
          {filtered.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              updating={updatingId === lead.id}
              onStatusChange={changeStatus}
            />
          ))}
        </div>
      )}
    </>
  );
}

// LeadCard — one demo-request lead: avatar initial, contact info, meta (clinic/
// profile/interest/received), optional message, status badge, and the next-action
// buttons for its current status. Local to this route — not reused elsewhere.
function LeadCard({
  lead,
  updating,
  onStatusChange,
}: {
  lead: AdminDemoRequest;
  updating: boolean;
  onStatusChange: (lead: AdminDemoRequest, status: DemoRequestStatus) => void;
}) {
  const actions = NEXT_ACTIONS[lead.status] ?? [];
  const initial = lead.name.trim().charAt(0).toUpperCase() || "?";

  return (
    <article className="card" style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
      <div
        aria-hidden="true"
        style={{
          flexShrink: 0,
          width: 42,
          height: 42,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--brand-tint)",
          color: "var(--brand-ink)",
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        {initial}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
          <div>
            <h3 className="h-card" style={{ fontSize: 16.5, marginBottom: 2 }}>
              {lead.name}
            </h3>
            <a href={`mailto:${lead.email}`} style={{ fontSize: 13, color: "var(--ink-soft)" }}>
              {lead.email}
            </a>
          </div>
          <StatusBadge tone={STATUS_TONE[lead.status] ?? "muted"}>
            {STATUS_LABEL[lead.status] ?? lead.status}
          </StatusBadge>
        </div>

        <dl style={{ display: "flex", flexWrap: "wrap", gap: "6px 20px", margin: "12px 0 0" }}>
          {lead.clinic && (
            <div>
              <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-faint)", display: "inline" }}>
                Clínica:{" "}
              </dt>
              <dd style={{ display: "inline", fontSize: 13, color: "var(--ink)" }}>{lead.clinic}</dd>
            </div>
          )}
          {lead.profile && (
            <div>
              <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-faint)", display: "inline" }}>
                Perfil:{" "}
              </dt>
              <dd style={{ display: "inline", fontSize: 13, color: "var(--ink)" }}>{lead.profile}</dd>
            </div>
          )}
          {lead.product_interest && (
            <div>
              <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-faint)", display: "inline" }}>
                Interesse:{" "}
              </dt>
              <dd style={{ display: "inline", fontSize: 13, color: "var(--ink)" }}>
                {INTEREST_LABEL[lead.product_interest] ?? lead.product_interest}
              </dd>
            </div>
          )}
          <div>
            <dt style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-faint)", display: "inline" }}>
              Recebido:{" "}
            </dt>
            <dd style={{ display: "inline", fontSize: 13, color: "var(--ink)" }}>{formatDate(lead.created_at)}</dd>
          </div>
        </dl>

        {lead.message && (
          <blockquote
            style={{
              margin: "12px 0 0",
              padding: "10px 14px",
              borderLeft: "3px solid var(--line-strong)",
              background: "var(--surface-inset)",
              borderRadius: "0 var(--r-md) var(--r-md) 0",
              fontSize: 13.5,
              color: "var(--ink-soft)",
              fontStyle: "italic",
            }}
          >
            {lead.message}
          </blockquote>
        )}

        {actions.length > 0 && (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
            {actions.map((a) => (
              <button
                key={a.status}
                type="button"
                className="btn btn--outline btn--sm"
                onClick={() => onStatusChange(lead, a.status)}
                disabled={updating}
              >
                {updating ? "…" : a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
