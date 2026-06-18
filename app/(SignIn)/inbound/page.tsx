"use client";

// Inbound (/inbound) — admin-only triagem de leads vindos do formulário
// "Agendar demonstração" da landing page. Mesma visual identity do
// dashboard (cream + teal + Instrument Serif), com toolbar de filtro por
// status e um card por lead.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashNav from "@/components/DashNav";
import {
  getMe,
  listDemoRequests,
  updateDemoRequestStatus,
} from "@/lib/api";
import { clearToken, isAuthed, isAuthError } from "@/lib/auth";
import type { DemoRequest } from "@/lib/types";
import "./inbound.css";

type StatusKey = "all" | "new" | "contacted" | "converted" | "dismissed";

const STATUS_FILTERS: { key: StatusKey; label: string }[] = [
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

const STATUS_NEXT: Record<string, { status: string; label: string }[]> = {
  new: [
    { status: "contacted", label: "Marcar como contatado" },
    { status: "dismissed", label: "Descartar" },
  ],
  contacted: [
    { status: "converted", label: "Marcar como convertido" },
    { status: "dismissed", label: "Descartar" },
  ],
  converted: [{ status: "contacted", label: "Reabrir" }],
  dismissed: [{ status: "new", label: "Reabrir" }],
};

export default function InboundPage() {
  const router = useRouter();

  const [clinic, setClinic] = useState("");
  const [role, setRole] = useState<string>("");
  const [items, setItems] = useState<DemoRequest[]>([]);
  const [filter, setFilter] = useState<StatusKey>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const logout = useCallback(() => {
    clearToken();
    router.push("/");
  }, [router]);

  // ── Auth + load ────────────────────────────────────────────────
  useEffect(() => {
    if (!isAuthed()) {
      router.replace("/login");
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        // Guard: somente admin acessa essa rota. Demais perfis vão pro dashboard.
        if (me.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setClinic(me.name || "");
        setRole(me.role || "");

        const data = await listDemoRequests(0, 100);
        if (cancelled) return;
        setItems(data.items || []);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        if (isAuthError(e)) {
          logout();
          return;
        }
        setError(true);
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, logout]);

  // ── Derived ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (filter === "all") return items;
    return items.filter((i) => i.status === filter);
  }, [items, filter]);

  const counts = useMemo(() => {
    const acc: Record<string, number> = {
      all: items.length,
      new: 0,
      contacted: 0,
      converted: 0,
      dismissed: 0,
    };
    for (const i of items) {
      if (acc[i.status] != null) acc[i.status] += 1;
    }
    return acc;
  }, [items]);

  // ── Actions ────────────────────────────────────────────────────
  const handleStatusChange = useCallback(
    async (lead: DemoRequest, newStatus: string) => {
      setUpdatingId(lead.id);
      try {
        const updated = await updateDemoRequestStatus(lead.id, newStatus);
        setItems((prev) => prev.map((i) => (i.id === lead.id ? updated : i)));
      } catch (e) {
        if (isAuthError(e)) logout();
      } finally {
        setUpdatingId(null);
      }
    },
    [logout],
  );

  // ── Render ─────────────────────────────────────────────────────
  const countText =
    filtered.length === 1 ? "1 lead" : `${filtered.length} leads`;

  return (
    <div className="inbound-route">
      <DashNav clinic={clinic} role={role} onLogout={logout} />

      <main className="inbound">
        <header className="inbound-head">
          <div>
            <span className="eyebrow">Inbound</span>
            <h1>
              Quem pediu uma <em>demonstração</em>.
            </h1>
            <p className="inbound-sub">
              Cada cadastro vindo do formulário da landing page chega aqui em tempo real.
              Mova pelos estágios à medida que conversa com o lead.
            </p>
          </div>
          <div className="inbound-stats">
            <div className="inbound-stat">
              <div className="num">
                <em>{counts.new}</em>
              </div>
              <div className="label">novos</div>
            </div>
            <div className="inbound-stat">
              <div className="num">{counts.contacted}</div>
              <div className="label">contatados</div>
            </div>
            <div className="inbound-stat">
              <div className="num">{counts.converted}</div>
              <div className="label">convertidos</div>
            </div>
          </div>
        </header>

        <div className="inbound-filters" role="tablist" aria-label="Filtrar leads por status">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              role="tab"
              aria-selected={filter === f.key}
              className={`inbound-pill${filter === f.key ? " active" : ""}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="inbound-pill-count">{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>

        <div className="inbound-count">{countText}</div>

        <section className="inbound-list" aria-busy={loading}>
          {loading ? (
            <div className="state">Carregando…</div>
          ) : error ? (
            <div className="state">
              Não foi possível carregar os leads. Tente novamente em alguns segundos.
            </div>
          ) : filtered.length === 0 ? (
            <div className="state">
              {filter === "all"
                ? "Nenhum lead chegou ainda. Quando alguém preencher o formulário, vai aparecer aqui."
                : "Nenhum lead nesse status."}
            </div>
          ) : (
            filtered.map((lead) => (
              <LeadCard
                key={lead.id}
                lead={lead}
                updating={updatingId === lead.id}
                onStatusChange={handleStatusChange}
              />
            ))
          )}
        </section>
      </main>
    </div>
  );
}

// ── Subcomponents ────────────────────────────────────────────────

type LeadCardProps = {
  lead: DemoRequest;
  updating: boolean;
  onStatusChange: (lead: DemoRequest, status: string) => void;
};

function LeadCard({ lead, updating, onStatusChange }: LeadCardProps) {
  const nextActions = STATUS_NEXT[lead.status] ?? [];
  const initial = lead.name.trim().charAt(0).toUpperCase() || "?";
  const created = formatDate(lead.created_at);

  return (
    <article className={`lead-card lead-status-${lead.status}`}>
      <div className="lead-avatar" aria-hidden="true">
        {initial}
      </div>

      <div className="lead-main">
        <div className="lead-top">
          <div>
            <h3 className="lead-name">{lead.name}</h3>
            <div className="lead-email">
              <a href={`mailto:${lead.email}`}>{lead.email}</a>
            </div>
          </div>
          <span className={`lead-badge lead-badge-${lead.status}`}>
            {STATUS_LABEL[lead.status] ?? lead.status}
          </span>
        </div>

        <dl className="lead-meta">
          {lead.clinic_name && (
            <div>
              <dt>Clínica</dt>
              <dd>{lead.clinic_name}</dd>
            </div>
          )}
          {lead.profile && (
            <div>
              <dt>Perfil</dt>
              <dd>{lead.profile}</dd>
            </div>
          )}
          <div>
            <dt>Recebido</dt>
            <dd>{created}</dd>
          </div>
        </dl>

        {lead.message && (
          <blockquote className="lead-message">{lead.message}</blockquote>
        )}

        {nextActions.length > 0 && (
          <div className="lead-actions">
            {nextActions.map((action) => (
              <button
                key={action.status}
                type="button"
                className={`lead-action lead-action-${action.status}`}
                onClick={() => onStatusChange(lead, action.status)}
                disabled={updating}
              >
                {updating ? "Atualizando…" : action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("pt-BR", {
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
