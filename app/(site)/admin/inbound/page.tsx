"use client";

// /admin/inbound — PreCheck inbound leads, proxied through brain-api
// (brain-api GET /admin/inbound -> precheck /api/v1/admin/inbound). Read-only here: the
// PreCheck inbound data model is unchanged; this surfaces it inside the unified admin
// portal, gated to admins. When brain-api has no PreCheck upstream configured the proxy
// returns an empty `stub` page, shown as a friendly empty state.

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { StatusBadge, type BadgeTone } from "../../_components/StatusBadge";
import {
  clearSession,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import { adminGetInbound, type PrecheckInbound } from "@/lib/manage-api";

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

  const [items, setItems] = useState<PrecheckInbound[] | null>(null);
  const [stub, setStub] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!ready || !session) return;
    let cancelled = false;
    adminGetInbound(session, 0, 100)
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
  }, [ready, session, router]);

  if (!ready || !session) return null;

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Inbound</h1>
          <p className="sub">
            Leads de contato vindos do PreCheck (landing page). Servido via brain-api.
          </p>
        </div>
      </header>

      {error ? (
        <div className="portal-error">Não foi possível carregar os leads do PreCheck.</div>
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
              : "Nenhum lead inbound ainda."}
          </div>
        </div>
      ) : (
        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Clínica</th>
                <th>Perfil</th>
                <th>Recebido</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((lead) => (
                <tr key={lead.id}>
                  <td className="cell-strong">{lead.name}</td>
                  <td className="cell-muted">
                    <a href={`mailto:${lead.email}`}>{lead.email}</a>
                  </td>
                  <td className="cell-muted">{lead.clinic_name || "—"}</td>
                  <td className="cell-muted">{lead.profile || "—"}</td>
                  <td className="cell-muted">{formatDate(lead.created_at)}</td>
                  <td>
                    <StatusBadge tone={STATUS_TONE[lead.status] ?? "muted"}>
                      {STATUS_LABEL[lead.status] ?? lead.status}
                    </StatusBadge>
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
