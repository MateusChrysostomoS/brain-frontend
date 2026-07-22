"use client";

// /admin/tenants — tenants table + tenant detail (RBAC task 3B).
// Detail is addressed by ?id=<uuid> (not a [id] segment) because brain-frontend is a
// static export, which cannot pre-render arbitrary dynamic params; this matches the
// repo's existing /summary?id= convention. The detail view edits entitlements inline
// via PATCH. No credentials fields are shown (there are none on a tenant).

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";

import { BrandIcon } from "../../_components/BrandIcon";
import { Modal } from "../../_components/Modal";
import { ProductMark, StatusBadge, type BadgeTone } from "../../_components/StatusBadge";
import {
  clearSession,
  describeApiError,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import {
  adminDeleteTenant,
  adminGetTenant,
  adminListTenants,
  adminPatchEntitlements,
  type AdminTenant,
  type AdminTenantDetail,
  type Session,
} from "@/lib/manage-api";

// Entitlement status → badge tone.
const STATUS_TONE: Record<string, BadgeTone> = {
  active: "green",
  trialing: "blue",
  past_due: "amber",
  canceled: "red",
  inactive: "muted",
};

function statusBadge(status: string) {
  return <StatusBadge tone={STATUS_TONE[status] ?? "muted"}>{status}</StatusBadge>;
}

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

export default function TenantsPage() {
  return (
    <Suspense fallback={null}>
      <TenantsInner />
    </Suspense>
  );
}

function TenantsInner() {
  const search = useSearchParams();
  const id = search.get("id");
  const { session, ready } = usePortalGuard(["admin"]);

  if (!ready || !session) return null;
  return id ? (
    <TenantDetail session={session} tenantId={id} />
  ) : (
    <TenantsTable session={session} />
  );
}

// --- List ------------------------------------------------------------------

function TenantsTable({ session }: { session: Session }) {
  const router = useRouter();
  const [items, setItems] = useState<AdminTenant[] | null>(null);
  const [error, setError] = useState(false);
  // The clinic pending a delete-confirmation (null = modal closed).
  const [toDelete, setToDelete] = useState<AdminTenant | null>(null);
  // Transient success line shown after a delete, e.g. "Clínica X excluída."
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminListTenants(session, 0, 100)
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
  }, [session, router]);

  // Drop the deleted clinic from the table without a full refetch.
  const handleDeleted = useCallback((deleted: AdminTenant) => {
    setItems((prev) => (prev ? prev.filter((t) => t.id !== deleted.id) : prev));
    setNotice(`Clínica "${deleted.clinic_name}" excluída.`);
    setToDelete(null);
  }, []);

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Clínicas</h1>
          <p className="sub">Todas as clínicas (tenants) da plataforma.</p>
        </div>
      </header>

      {notice && (
        <div className="alert-line alert-line--green" style={{ marginBottom: 16 }}>
          <BrandIcon name="checkCircle" />
          {notice}
        </div>
      )}

      {error ? (
        <div className="portal-error">Não foi possível carregar as clínicas.</div>
      ) : !items ? (
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      ) : items.length === 0 ? (
        <div className="ptable-wrap">
          <div className="portal-state">Nenhuma clínica cadastrada ainda.</div>
        </div>
      ) : (
        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th>Clínica</th>
                <th>Plano</th>
                <th>Status</th>
                <th>PreCheck</th>
                <th>secretarIA</th>
                <th>Usuários</th>
                <th>Criada em</th>
                <th style={{ textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr
                  key={t.id}
                  className="clickable"
                  onClick={() => router.push(`/admin/tenants?id=${t.id}`)}
                >
                  <td className="cell-strong">{t.clinic_name}</td>
                  <td className="cell-muted">{t.plan}</td>
                  <td>{statusBadge(t.status)}</td>
                  <td>
                    <ProductMark on={t.precheck_enabled} />
                  </td>
                  <td>
                    <ProductMark on={t.secretaria_enabled} />
                  </td>
                  <td className="cell-muted">{t.users_count}</td>
                  <td className="cell-muted">{formatDate(t.created_at)}</td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn--icon-danger"
                      aria-label={`Excluir clínica ${t.clinic_name}`}
                      title="Excluir clínica"
                      onClick={(e) => {
                        // Don't let the click bubble to the row's navigate handler.
                        e.stopPropagation();
                        setNotice(null);
                        setToDelete(t);
                      }}
                    >
                      <BrandIcon name="trash" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <DeleteTenantModal
        session={session}
        tenant={toDelete}
        onClose={() => setToDelete(null)}
        onDeleted={handleDeleted}
        onAuthError={() => {
          clearSession();
          router.replace("/login");
        }}
      />
    </>
  );
}

// DeleteTenantModal — confirmation dialog for the irreversible cascade delete of one
// clinic. Owns the in-flight/error state; calls back with the deleted tenant so the
// table can drop the row. Rendered once by TenantsTable; `tenant` drives open state.
function DeleteTenantModal({
  session,
  tenant,
  onClose,
  onDeleted,
  onAuthError,
}: {
  session: Session;
  tenant: AdminTenant | null;
  onClose: () => void;
  onDeleted: (t: AdminTenant) => void;
  onAuthError: () => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset the error whenever a different clinic is targeted (or the modal closes).
  useEffect(() => {
    setError(null);
  }, [tenant]);

  async function handleConfirm() {
    if (!tenant) return;
    setDeleting(true);
    setError(null);
    try {
      await adminDeleteTenant(session, tenant.id);
      onDeleted(tenant);
    } catch (e) {
      if (isSessionExpired(e)) {
        onAuthError();
        return;
      }
      setError(describeApiError(e));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Modal
      open={tenant !== null}
      title="Excluir clínica"
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn btn--ghost btn--sm"
            onClick={onClose}
            disabled={deleting}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={handleConfirm}
            disabled={deleting}
          >
            {deleting ? "Excluindo…" : "Excluir clínica"}
            {!deleting && <BrandIcon name="trash" />}
          </button>
        </>
      }
    >
      {error && (
        <div className="portal-error" style={{ marginBottom: 14 }}>
          {error}
        </div>
      )}
      <p style={{ fontSize: 14.5, color: "var(--ink-soft)", lineHeight: 1.6 }}>
        Excluir <strong style={{ color: "var(--ink)" }}>{tenant?.clinic_name}</strong>{" "}
        remove a clínica e tudo que ela possui na plataforma — usuários, acessos,
        assinatura e histórico de uso — além do cadastro dela na secretarIA. Conversas e
        anamneses não são apagadas.
      </p>
      <p style={{ fontSize: 13.5, color: "var(--al-red-ink)", marginTop: 10, fontWeight: 600 }}>
        Esta ação é irreversível.
      </p>
    </Modal>
  );
}

// --- Detail (inline entitlement toggles) -----------------------------------

function TenantDetail({
  session,
  tenantId,
}: {
  session: Session;
  tenantId: string;
}) {
  const router = useRouter();
  const [detail, setDetail] = useState<AdminTenantDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<"precheck" | "secretaria" | null>(null);

  useEffect(() => {
    let cancelled = false;
    adminGetTenant(session, tenantId)
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
  }, [session, tenantId, router]);

  // Flip one product flag and persist via PATCH (server is the source of truth).
  const toggleProduct = useCallback(
    async (product: "precheck" | "secretaria") => {
      if (!detail) return;
      const current =
        product === "precheck"
          ? detail.entitlements.precheck_enabled
          : detail.entitlements.secretaria_enabled;
      const next = !current;
      // Build an explicit patch (a computed-key object would not satisfy EntitlementPatch).
      const patch =
        product === "precheck"
          ? { precheck_enabled: next }
          : { secretaria_enabled: next };
      setSaving(product);
      setError(null);
      try {
        const updated = await adminPatchEntitlements(session, tenantId, patch);
        setDetail((d) => (d ? { ...d, entitlements: updated } : d));
      } catch (e) {
        if (isSessionExpired(e)) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(describeApiError(e));
      } finally {
        setSaving(null);
      }
    },
    [detail, session, tenantId, router],
  );

  if (error && !detail) {
    return (
      <>
        <BackLink />
        <div className="portal-error">{error}</div>
      </>
    );
  }
  if (!detail) {
    return (
      <>
        <BackLink />
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      </>
    );
  }

  const ent = detail.entitlements;
  return (
    <>
      <BackLink />
      <header className="portal-page-head">
        <div>
          <h1>{detail.clinic_name}</h1>
          <p className="sub">
            {detail.users_count} usuário(s) · Plano {ent.plan} ·{" "}
            {statusBadge(ent.status)}
          </p>
        </div>
      </header>

      {error && <div className="portal-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="stat-grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))" }}>
        <ProductToggle
          label="PreCheck"
          description="Anamnese pré-consulta via WhatsApp."
          on={ent.precheck_enabled}
          saving={saving === "precheck"}
          onToggle={() => toggleProduct("precheck")}
        />
        <ProductToggle
          label="secretarIA"
          description="Secretária de IA / agenda via WhatsApp."
          on={ent.secretaria_enabled}
          saving={saving === "secretaria"}
          onToggle={() => toggleProduct("secretaria")}
        />
      </div>
    </>
  );
}

function BackLink() {
  return (
    <Link
      href="/admin/tenants"
      className="btn btn--ghost btn--sm"
      style={{ marginBottom: 14, paddingLeft: 8 }}
    >
      ← Voltar para clínicas
    </Link>
  );
}

// ProductToggle — a labelled inline switch that PATCHes a single entitlement flag.
function ProductToggle({
  label,
  description,
  on,
  saving,
  onToggle,
}: {
  label: string;
  description: string;
  on: boolean;
  saving: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="stat-card" style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 16, color: "var(--ink)" }}>{label}</div>
        <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: 4 }}>{description}</p>
        <div style={{ marginTop: 10 }}>
          <StatusBadge tone={on ? "green" : "muted"}>
            {on ? "Ativo" : "Inativo"}
          </StatusBadge>
        </div>
      </div>
      <button
        type="button"
        className={`btn btn--sm ${on ? "btn--outline" : "btn--primary"}`}
        onClick={onToggle}
        disabled={saving}
        aria-pressed={on}
      >
        {saving ? "Salvando…" : on ? "Desativar" : "Ativar"}
        {!saving && <BrandIcon name={on ? "ban" : "check"} />}
      </button>
    </div>
  );
}
