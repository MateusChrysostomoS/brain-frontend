"use client";

// /admin/users — users table across all tenants + an always-visible inline
// create-user panel (RBAC task 3B), ported from PreCheck's own /users screen layout
// (inline panel above the table, not a modal). Never renders a password hash (the
// API never returns one). Creating a user posts to brain-api, which hashes the
// password server-side. Admin role => no tenant; tenant roles require a tenant.
//
// Role-taxonomy transition: tenant roles are doctor/manager (a doctor can ALSO be
// a manager via the separate is_manager flag — "Também é gestor" checkbox below).
// Legacy tenant_owner/tenant_staff rows may still exist until the backfill
// migration runs — ROLE_LABEL/ROLE_TONE keep display fallbacks for them, but the
// create form only ever writes the new role values.

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
  adminCreateUser,
  adminListTenants,
  adminListUsers,
  type AdminTenant,
  type AdminUser,
  type Role,
  type Session,
} from "@/lib/manage-api";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  doctor: "Médico",
  manager: "Gestor",
  // Legacy rows until the backfill migration runs.
  tenant_owner: "Proprietário",
  tenant_staff: "Equipe",
};
const ROLE_TONE: Record<string, BadgeTone> = {
  admin: "blue",
  doctor: "green",
  manager: "amber",
  // Legacy rows until the backfill migration runs.
  tenant_owner: "muted",
  tenant_staff: "muted",
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

export default function UsersPage() {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["admin"]);

  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [tenants, setTenants] = useState<AdminTenant[]>([]);
  const [error, setError] = useState(false);

  const onAuthError = useCallback(
    (e: unknown): boolean => {
      if (isSessionExpired(e)) {
        clearSession();
        router.replace("/login");
        return true;
      }
      return false;
    },
    [router],
  );

  const reload = useCallback(async (s: Session) => {
    const [u, t] = await Promise.all([
      adminListUsers(s, 0, 100),
      adminListTenants(s, 0, 100),
    ]);
    setUsers(u.items);
    setTenants(t.items);
  }, []);

  useEffect(() => {
    if (!ready || !session) return;
    let cancelled = false;
    reload(session).catch((e) => {
      if (cancelled || onAuthError(e)) return;
      setError(true);
    });
    return () => {
      cancelled = true;
    };
  }, [ready, session, reload, onAuthError]);

  if (!ready || !session) return null;

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Usuários</h1>
          <p className="sub">Todas as contas da plataforma, em todas as clínicas.</p>
        </div>
      </header>

      <CreateUserPanel
        session={session}
        tenants={tenants}
        onCreated={() => reload(session).catch(onAuthError)}
      />

      {error ? (
        <div className="portal-error">Não foi possível carregar os usuários.</div>
      ) : !users ? (
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      ) : (
        <div className="ptable-wrap">
          <table className="ptable">
            <thead>
              <tr>
                <th>E-mail</th>
                <th>Nome</th>
                <th>Papel</th>
                <th>Clínica</th>
                <th>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="cell-strong">
                    {u.email}
                    {/* Subtle "owns the clinic" hint — same spirit as PreCheck's
                        users table, doesn't need its own column. */}
                    {u.is_owner && (
                      <span
                        title="Dono da clínica"
                        style={{ marginLeft: 6, fontSize: 12, color: "var(--ink-faint)" }}
                      >
                        (dono)
                      </span>
                    )}
                  </td>
                  <td className="cell-muted">{u.name}</td>
                  <td>
                    <StatusBadge tone={ROLE_TONE[u.role] ?? "muted"}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </StatusBadge>
                    {/* A doctor who is ALSO a manager (is_manager doesn't apply
                        to role="manager" rows — they're already a manager). */}
                    {u.is_manager && u.role !== "manager" && (
                      <>
                        {" "}
                        <StatusBadge tone="amber" className="pbadge--sm">
                          + Gestor
                        </StatusBadge>
                      </>
                    )}
                  </td>
                  <td className="cell-muted">{u.clinic_name ?? "Platform Admin"}</td>
                  <td className="cell-muted">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

// CreateUserPanel — always-visible inline create-user form (replaces the old
// click-to-open modal). Owns its own form state + submit; local to this route.
function CreateUserPanel({
  session,
  tenants,
  onCreated,
}: {
  session: Session;
  tenants: AdminTenant[];
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("doctor");
  // "Também é gestor" — only meaningful (and only shown) for role="doctor"; a
  // role="manager" row is already a manager, and role="admin" carries no
  // is_manager concept at all (see payload construction below).
  const [alsoManager, setAlsoManager] = useState(false);
  const [tenantId, setTenantId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  const needsTenant = role !== "admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setFormOk(null);
    if (!email.trim() || !name.trim() || !password) {
      setFormError("Preencha e-mail, nome e senha.");
      return;
    }
    if (needsTenant && !tenantId) {
      setFormError("Selecione a clínica deste usuário.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await adminCreateUser(session, {
        email: email.trim(),
        name: name.trim(),
        password,
        role,
        // Tenant roles carry a tenant; admins must not (server enforces this too).
        tenant_id: needsTenant ? tenantId : null,
        // is_manager only applies to tenant roles: a manager row is always a
        // manager (true); a doctor row carries whatever the checkbox says;
        // admin sends nothing (server has no is_manager concept for it).
        ...(role === "admin" ? {} : { is_manager: role === "manager" ? true : alsoManager }),
      });
      setFormOk(`${created.name} criado com acesso de ${ROLE_LABEL[created.role] ?? created.role}.`);
      // Reset for next time.
      setEmail("");
      setName("");
      setPassword("");
      setRole("doctor");
      setAlsoManager(false);
      setTenantId("");
      onCreated();
    } catch (err) {
      setFormError(describeApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="card" style={{ marginBottom: 24 }}>
      <h2 className="h-card" style={{ marginBottom: 16 }}>
        Novo usuário
      </h2>
      <form onSubmit={handleSubmit} noValidate>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
          }}
        >
          <div className="pfield">
            <label htmlFor="cu-email">E-mail</label>
            <input
              id="cu-email"
              type="email"
              autoComplete="off"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="pfield">
            <label htmlFor="cu-name">Nome</label>
            <input
              id="cu-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="pfield">
            <label htmlFor="cu-password">Senha</label>
            <input
              id="cu-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={72}
              required
            />
          </div>
          <div className="pfield">
            <label htmlFor="cu-role">Papel</label>
            <select
              id="cu-role"
              value={role}
              onChange={(e) => {
                const next = e.target.value as Role;
                setRole(next);
                // The checkbox only means anything for role="doctor" — clear it
                // when switching away so a stale check can't linger unseen.
                if (next !== "doctor") setAlsoManager(false);
              }}
            >
              <option value="doctor">Médico — atende pacientes</option>
              <option value="manager">Gestor — tudo do médico + gestão da clínica</option>
              <option value="admin">Admin da plataforma</option>
            </select>
          </div>
          {role === "doctor" && (
            <div className="pfield">
              {/* Overrides .pfield's uppercase field-label styling — this is a
                  checkbox caption, not a form-field label. */}
              <label
                htmlFor="cu-also-manager"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  textTransform: "none",
                  letterSpacing: "normal",
                  fontSize: 13.5,
                  fontWeight: 600,
                  color: "var(--ink)",
                  marginBottom: 4,
                  cursor: "pointer",
                }}
              >
                <input
                  id="cu-also-manager"
                  type="checkbox"
                  checked={alsoManager}
                  onChange={(e) => setAlsoManager(e.target.checked)}
                  style={{ width: 16, height: 16 }}
                />
                Também é gestor
              </label>
              <span style={{ fontSize: 12, color: "var(--ink-faint)" }}>
                Além do acesso normal, poderes de gestão da clínica.
              </span>
            </div>
          )}
          {needsTenant && (
            <div className="pfield">
              <label htmlFor="cu-tenant">Clínica</label>
              <select
                id="cu-tenant"
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                required
              >
                <option value="">Selecione…</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.clinic_name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {formError && (
          <div className="portal-error" style={{ marginBottom: 14 }}>
            {formError}
          </div>
        )}
        {formOk && (
          <div
            style={{
              marginBottom: 14,
              padding: "12px 14px",
              borderRadius: "var(--r-md)",
              background: "var(--al-green-bg)",
              color: "var(--al-green-ink)",
              border: "1px solid var(--al-green-bd)",
              fontSize: 13.5,
              fontWeight: 500,
            }}
          >
            {formOk}
          </div>
        )}

        <button type="submit" className="btn btn--primary btn--sm" disabled={submitting}>
          {submitting ? "Criando…" : "Criar usuário"}
        </button>
      </form>
    </section>
  );
}
