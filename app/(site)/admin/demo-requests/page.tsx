"use client";

// /admin/demo-requests — brain's own lead pipeline (RBAC task 3B).
// Per-row actions move the lead: "Marcar como contatado", "Converter em tenant",
// "Descartar". Status values map to brain-api's set (new|contacted|converted|dismissed).

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { StatusBadge, type BadgeTone } from "../../_components/StatusBadge";
import {
  clearSession,
  describeApiError,
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

// Available transitions per current status (the task's three actions).
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

export default function DemoRequestsPage() {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["admin"]);

  const [items, setItems] = useState<AdminDemoRequest[] | null>(null);
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
        setItems((prev) =>
          prev ? prev.map((i) => (i.id === lead.id ? updated : i)) : prev,
        );
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

  if (!ready || !session) return null;

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Demo requests</h1>
          <p className="sub">Leads do formulário "Agendar demonstração" do Brain.</p>
        </div>
      </header>

      {error ? (
        <div className="portal-error">Não foi possível carregar os leads.</div>
      ) : !items ? (
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      ) : items.length === 0 ? (
        <div className="ptable-wrap">
          <div className="portal-state">Nenhum lead recebido ainda.</div>
        </div>
      ) : (
        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Interesse</th>
                <th>Mensagem</th>
                <th>Recebido</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lead) => {
                const actions = NEXT_ACTIONS[lead.status] ?? [];
                const busy = updatingId === lead.id;
                return (
                  <tr key={lead.id}>
                    <td className="cell-strong">{lead.name}</td>
                    <td className="cell-muted">
                      <a href={`mailto:${lead.email}`}>{lead.email}</a>
                    </td>
                    <td className="cell-muted">
                      {lead.product_interest
                        ? (INTEREST_LABEL[lead.product_interest] ?? lead.product_interest)
                        : "—"}
                    </td>
                    <td
                      className="cell-muted"
                      style={{ maxWidth: 260, whiteSpace: "normal" }}
                    >
                      {lead.message || "—"}
                    </td>
                    <td className="cell-muted">{formatDate(lead.created_at)}</td>
                    <td>
                      <StatusBadge tone={STATUS_TONE[lead.status] ?? "muted"}>
                        {STATUS_LABEL[lead.status] ?? lead.status}
                      </StatusBadge>
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {actions.length === 0 ? (
                          <span className="cell-muted">—</span>
                        ) : (
                          actions.map((a) => (
                            <button
                              key={a.status}
                              type="button"
                              className="btn btn--outline btn--sm"
                              onClick={() => changeStatus(lead, a.status)}
                              disabled={busy}
                            >
                              {busy ? "…" : a.label}
                            </button>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
