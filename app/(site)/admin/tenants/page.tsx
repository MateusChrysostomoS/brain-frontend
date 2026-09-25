"use client";

// /admin/tenants — tenants table + tenant detail (RBAC task 3B).
// Detail is addressed by ?id=<uuid> (not a [id] segment) because brain-frontend is a
// static export, which cannot pre-render arbitrary dynamic params; this matches the
// repo's existing /summary?id= convention. The detail view edits entitlements inline
// via PATCH. No credentials fields are shown (there are none on a tenant).
//
// The list also carries an inline "Criar clínica de teste" panel (same inline-panel
// pattern as /admin/users, not a modal) over POST /admin/tenants: an active clinic
// with the admin-chosen products and no Stripe link at all. TEMPORARY — removed
// before the real launch with the backend route (brain-api
// docs/CHECKPOINT_admin_test_tenant.md, "Remover antes do lançamento real").

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";

import { BrandIcon } from "../../_components/BrandIcon";
import { Modal } from "../../_components/Modal";
import { Notice } from "../../_components/Notice";
import { ProductMark, StatusBadge, type BadgeTone } from "../../_components/StatusBadge";
import {
  clearSession,
  describeApiError,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import {
  EMPTY_CREATE_TENANT_FORM,
  submitCreateTenant,
  type CreateTenantForm,
} from "./lib/create-tenant";
import {
  adminCreateTenant,
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

// Small "teste" tag next to a clinic created by POST /admin/tenants.
function TestBadge() {
  return (
    <StatusBadge tone="amber" className="pbadge--sm">
      teste
    </StatusBadge>
  );
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

  // Whether any list load has succeeded (read by the refresh's error path).
  const loadedRef = useRef(false);

  // Shared by the first load and the post-create refresh. `isCancelled` lets the
  // effect drop a response that lands after unmount.
  const load = useCallback(
    (isCancelled: () => boolean = () => false) =>
      adminListTenants(session, 0, 100)
        .then((page) => {
          if (isCancelled()) return;
          loadedRef.current = true;
          setItems(page.items);
          setError(false);
        })
        .catch((e) => {
          if (isCancelled()) return;
          if (isSessionExpired(e)) {
            clearSession();
            router.replace("/login");
            return;
          }
          // A failed post-create refresh must not hide a list that already loaded.
          if (!loadedRef.current) setError(true);
        }),
    [session, router],
  );

  useEffect(() => {
    let cancelled = false;
    load(() => cancelled);
    return () => {
      cancelled = true;
    };
  }, [load]);

  const dismissNotice = useCallback(() => setNotice(null), []);

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

      <CreateTestTenantPanel
        session={session}
        onCreated={() => {
          load();
        }}
        onAuthError={() => {
          clearSession();
          router.replace("/login");
        }}
      />

      <Notice
        message={notice}
        onDismiss={dismissNotice}
        style={{ marginBottom: 16 }}
      />

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
                  <td className="cell-strong">
                    {t.clinic_name}
                    {t.is_test && (
                      <>
                        {" "}
                        <TestBadge />
                      </>
                    )}
                  </td>
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

// CreateTestTenantPanel — always-visible inline form for POST /admin/tenants. Owns its
// form state + submit (logic in ./lib/create-tenant, unit-tested there); tells the
// table to refetch on success and offers a link to the new clinic's detail.
function CreateTestTenantPanel({
  session,
  onCreated,
  onAuthError,
}: {
  session: Session;
  onCreated: () => void;
  onAuthError: () => void;
}) {
  const [form, setForm] = useState<CreateTenantForm>(EMPTY_CREATE_TENANT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  const dismissFormOk = useCallback(() => setFormOk(null), []);

  function set<K extends keyof CreateTenantForm>(key: K, value: CreateTenantForm[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormOk(null);
    setCreatedId(null);
    setSubmitting(true);
    const result = await submitCreateTenant(form, (payload) =>
      adminCreateTenant(session, payload),
    );
    setSubmitting(false);
    if (!result.ok) {
      if (result.cause && isSessionExpired(result.cause)) {
        onAuthError();
        return;
      }
      setFormError(result.error);
      return;
    }
    const { created } = result;
    setFormOk(`Clínica de teste "${created.clinic_name}" criada.`);
    setCreatedId(created.tenant_id);
    setForm(EMPTY_CREATE_TENANT_FORM);
    onCreated();
  }

  const checkLabel = { display: "inline-flex", gap: 8, alignItems: "center", fontSize: 14 };

  return (
    <section className="card" style={{ marginBottom: 24 }}>
      <h2 className="h-card" style={{ marginBottom: 6 }}>
        Criar clínica de teste
      </h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 16 }}>
        A clínica nasce ativa com os produtos marcados, sem pagamento e sem vínculo com o
        Stripe. O dono entra como gestor com o e-mail e a senha abaixo.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <div className="pfield">
            <label htmlFor="ct-clinic">Nome da clínica</label>
            <input
              id="ct-clinic"
              type="text"
              autoComplete="off"
              value={form.clinicName}
              onChange={(e) => set("clinicName", e.target.value)}
              maxLength={255}
              required
            />
          </div>
          <div className="pfield">
            <label htmlFor="ct-email">E-mail do gestor</label>
            <input
              id="ct-email"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              maxLength={320}
              required
            />
          </div>
          <div className="pfield">
            <label htmlFor="ct-name">Nome do gestor</label>
            <input
              id="ct-name"
              type="text"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              maxLength={255}
              required
            />
          </div>
          <div className="pfield">
            <label htmlFor="ct-password">Senha</label>
            <input
              id="ct-password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
              maxLength={72}
              required
            />
          </div>
        </div>

        <fieldset style={{ border: 0, padding: 0, margin: "4px 0 16px" }}>
          <legend style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", marginBottom: 8 }}>
            Produtos
          </legend>
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            <label style={checkLabel}>
              <input
                type="checkbox"
                checked={form.secretaria}
                onChange={(e) => set("secretaria", e.target.checked)}
              />
              secretarIA
            </label>
            <label style={checkLabel}>
              <input
                type="checkbox"
                checked={form.precheck}
                onChange={(e) => set("precheck", e.target.checked)}
              />
              PreCheck
            </label>
          </div>
        </fieldset>

        {formError && (
          <div className="portal-error" style={{ marginBottom: 14 }}>
            {formError}
          </div>
        )}
        <Notice
          message={formOk}
          onDismiss={dismissFormOk}
          autoDismissMs={0}
          style={{ marginBottom: 14 }}
        />

        <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <button type="submit" className="btn btn--primary btn--sm" disabled={submitting}>
            {submitting ? "Criando…" : "Criar clínica de teste"}
          </button>
          {createdId && (
            <Link href={`/admin/tenants?id=${createdId}`} className="btn btn--ghost btn--sm">
              Abrir clínica criada →
            </Link>
          )}
        </div>
      </form>
    </section>
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
          <h1>
            {detail.clinic_name}
            {detail.is_test && (
              <>
                {" "}
                <TestBadge />
              </>
            )}
          </h1>
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
