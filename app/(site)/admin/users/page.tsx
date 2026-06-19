"use client";

// /admin/users — users table across all tenants + create-user modal (RBAC task 3B).
// Never renders a password hash (the API never returns one). Creating a user posts to
// brain-api, which hashes the password server-side. Admin role => no tenant; tenant
// roles require a tenant.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import { Modal } from "../../_components/Modal";
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
  tenant_owner: "Proprietário",
  tenant_staff: "Equipe",
};
const ROLE_TONE: Record<string, BadgeTone> = {
  admin: "blue",
  tenant_owner: "green",
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
  const [modalOpen, setModalOpen] = useState(false);

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

  const reload = useCallback(
    async (s: Session) => {
      const [u, t] = await Promise.all([
        adminListUsers(s, 0, 100),
        adminListTenants(s, 0, 100),
      ]);
      setUsers(u.items);
      setTenants(t.items);
    },
    [],
  );

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
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setModalOpen(true)}
        >
          Novo usuário
        </button>
      </header>

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
                  <td className="cell-strong">{u.email}</td>
                  <td className="cell-muted">{u.name}</td>
                  <td>
                    <StatusBadge tone={ROLE_TONE[u.role] ?? "muted"}>
                      {ROLE_LABEL[u.role] ?? u.role}
                    </StatusBadge>
                  </td>
                  <td className="cell-muted">{u.clinic_name ?? "Platform Admin"}</td>
                  <td className="cell-muted">{formatDate(u.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CreateUserModal
        open={modalOpen}
        session={session}
        tenants={tenants}
        onClose={() => setModalOpen(false)}
        onCreated={() => {
          setModalOpen(false);
          reload(session).catch(onAuthError);
        }}
      />
    </>
  );
}

// CreateUserModal — owns the create-user form state + submit. Local to this route.
function CreateUserModal({
  open,
  session,
  tenants,
  onClose,
  onCreated,
}: {
  open: boolean;
  session: Session;
  tenants: AdminTenant[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("tenant_owner");
  const [tenantId, setTenantId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const needsTenant = role !== "admin";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
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
      await adminCreateUser(session, {
        email: email.trim(),
        name: name.trim(),
        password,
        role,
        // Tenant roles carry a tenant; admins must not (server enforces this too).
        tenant_id: needsTenant ? tenantId : null,
      });
      // Reset for next time.
      setEmail("");
      setName("");
      setPassword("");
      setRole("tenant_owner");
      setTenantId("");
      onCreated();
    } catch (err) {
      setFormError(describeApiError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      title="Novo usuário"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
            Cancelar
          </button>
          <button
            type="submit"
            form="create-user-form"
            className="btn btn--primary btn--sm"
            disabled={submitting}
          >
            {submitting ? "Criando…" : "Criar usuário"}
          </button>
        </>
      }
    >
      <form id="create-user-form" onSubmit={handleSubmit} noValidate>
        {formError && (
          <div className="portal-error" style={{ marginBottom: 14 }}>
            {formError}
          </div>
        )}
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
            onChange={(e) => setRole(e.target.value as Role)}
          >
            <option value="tenant_owner">Proprietário (tenant_owner)</option>
            <option value="tenant_staff">Equipe (tenant_staff)</option>
            <option value="admin">Admin da plataforma</option>
          </select>
        </div>
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
      </form>
    </Modal>
  );
}
