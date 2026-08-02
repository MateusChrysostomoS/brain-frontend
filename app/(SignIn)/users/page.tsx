"use client";

// Usuários (/users) — admin-only. Lista os usuários do painel e cria novos,
// incluindo o combo médico+gestor (role doctor + is_manager) e o gestor puro
// (role manager, sem acesso a conteúdo clínico). Superadmin escolhe a
// clínica; clinic-admin cria/lista só na própria.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DashNav from "@/components/DashNav";
import { createUser, getMe, listClinics, listUsers } from "@/lib/api";
import { useAuthGuard } from "@/lib/useAuthGuard";
import type { AdminUser, ClinicInfo, UserCreatePayload } from "@/lib/types";
import "./users.css";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin",
  doctor: "Médico",
  manager: "Gestor",
  service: "Service",
};

type RoleOption = "doctor" | "manager" | "admin";

export default function UsersPage() {
  const router = useRouter();

  const [clinic, setClinic] = useState("");
  const [role, setRole] = useState<string>("");
  const [isManager, setIsManager] = useState(false);
  const [myClinicId, setMyClinicId] = useState<number | null>(null);
  const [superadmin, setSuperadmin] = useState(false);

  const [users, setUsers] = useState<AdminUser[]>([]);
  const [clinics, setClinics] = useState<ClinicInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // form
  const [fName, setFName] = useState("");
  const [fEmail, setFEmail] = useState("");
  const [fPassword, setFPassword] = useState("");
  const [fRole, setFRole] = useState<RoleOption>("doctor");
  const [fIsManager, setFIsManager] = useState(false);
  const [fClinicId, setFClinicId] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formOk, setFormOk] = useState<string | null>(null);

  const { logout, requireAuth, handleAuthError } = useAuthGuard();

  useEffect(() => {
    if (!requireAuth()) return;
    let cancelled = false;

    (async () => {
      try {
        const me = await getMe();
        if (cancelled) return;
        if (me.role !== "admin") {
          router.replace("/dashboard");
          return;
        }
        setClinic(me.name || "");
        setRole(me.role || "");
        setIsManager(!!me.is_manager);
        setMyClinicId(me.clinic_id ?? null);
        const isSuper = me.clinic_id == null;
        setSuperadmin(isSuper);

        const [usersRes, clinicsRes] = await Promise.all([
          listUsers(),
          isSuper ? listClinics() : Promise.resolve({ items: [] as ClinicInfo[] }),
        ]);
        if (cancelled) return;
        setUsers(usersRes.items || []);
        setClinics(clinicsRes.items || []);
        setLoading(false);
      } catch (e) {
        if (cancelled) return;
        if (!handleAuthError(e)) {
          setError(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, requireAuth, handleAuthError]);

  const handleCreate = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setFormError(null);
      setFormOk(null);

      const clinicId = superadmin ? Number(fClinicId) : myClinicId;
      if (!clinicId) {
        setFormError("Escolha a clínica do usuário.");
        return;
      }
      if (fPassword.length < 8) {
        setFormError("A senha precisa de pelo menos 8 caracteres.");
        return;
      }

      const payload: UserCreatePayload = {
        name: fName.trim(),
        email: fEmail.trim(),
        password: fPassword,
        role: fRole,
        // Gestor puro já é gestor por definição; o checkbox cobre o combo.
        is_manager: fRole === "manager" ? true : fIsManager,
      };

      setSaving(true);
      try {
        const created = await createUser(clinicId, payload);
        setUsers((prev) => [created, ...prev]);
        setFormOk(`${created.name} criado com acesso de ${ROLE_LABEL[created.role] ?? created.role}${created.is_manager && created.role !== "manager" ? " + Gestor" : ""}.`);
        setFName("");
        setFEmail("");
        setFPassword("");
        setFIsManager(false);
      } catch (err) {
        if (!handleAuthError(err)) {
          setFormError(err instanceof Error ? err.message : "Não foi possível criar o usuário.");
        }
      } finally {
        setSaving(false);
      }
    },
    [superadmin, fClinicId, myClinicId, fPassword, fName, fEmail, fRole, fIsManager, handleAuthError],
  );

  const clinicName = (id: number | null) =>
    id == null ? "—" : clinics.find((c) => c.id === id)?.name ?? `#${id}`;

  return (
    <div className="users-route">
      <DashNav clinic={clinic} role={role} isManager={isManager} onLogout={logout} />

      <main className="users">
        <header className="users-head">
          <div>
            <span className="eyebrow">Usuários</span>
            <h1>
              Quem acessa o <em>painel</em>.
            </h1>
            <p className="users-sub">
              Crie médicos, gestores e admins. Um médico que também gerencia a
              clínica pode ter os dois acessos — laudos e métricas — e alternar
              pelas abas.
            </p>
          </div>
        </header>

        {/* ── Form de criação ─────────────────────────────────── */}
        <section className="panel" aria-label="Criar usuário">
          <h2>Novo usuário</h2>
          <form className="user-form" onSubmit={handleCreate}>
            <div className="form-grid">
              <label>
                Nome
                <input
                  type="text"
                  value={fName}
                  onChange={(e) => setFName(e.target.value)}
                  required
                  maxLength={255}
                  placeholder="Dra. Ana Souza"
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  value={fEmail}
                  onChange={(e) => setFEmail(e.target.value)}
                  required
                  placeholder="ana@clinica.com"
                />
              </label>
              <label>
                Senha
                <input
                  type="password"
                  value={fPassword}
                  onChange={(e) => setFPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="mín. 8 caracteres"
                />
              </label>
              <label>
                Perfil
                <select value={fRole} onChange={(e) => setFRole(e.target.value as RoleOption)}>
                  <option value="doctor">Médico — vê laudos e pacientes</option>
                  <option value="manager">Gestor — só métricas, sem dado clínico</option>
                  <option value="admin">Admin — tudo da clínica</option>
                </select>
              </label>
              {superadmin && (
                <label>
                  Clínica
                  <select
                    value={fClinicId}
                    onChange={(e) => setFClinicId(e.target.value)}
                    required
                  >
                    <option value="">Escolher clínica…</option>
                    {clinics.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>

            {fRole !== "manager" && (
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={fIsManager}
                  onChange={(e) => setFIsManager(e.target.checked)}
                />
                <span>
                  <strong>Também é gestor</strong> — além do acesso normal, vê o
                  dashboard de métricas (aba Métricas).
                </span>
              </label>
            )}

            {formError && <div className="form-msg form-msg-error">{formError}</div>}
            {formOk && <div className="form-msg form-msg-ok">{formOk}</div>}

            <button type="submit" className="submit-btn" disabled={saving}>
              {saving ? "Criando…" : "Criar usuário"}
            </button>
          </form>
        </section>

        {/* ── Lista ───────────────────────────────────────────── */}
        <section className="panel" aria-label="Usuários existentes">
          <h2>Usuários</h2>
          {loading ? (
            <div className="state">Carregando…</div>
          ) : error ? (
            <div className="state">Não foi possível carregar os usuários.</div>
          ) : users.length === 0 ? (
            <div className="state">Nenhum usuário ainda.</div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>E-mail</th>
                  <th>Perfil</th>
                  {superadmin && <th>Clínica</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="email-col">{u.email}</td>
                    <td>
                      <span className={`role-badge role-${u.role}`}>
                        {ROLE_LABEL[u.role] ?? u.role}
                      </span>
                      {u.is_manager && u.role !== "manager" && (
                        <span className="role-badge role-manager role-extra">+ Gestor</span>
                      )}
                    </td>
                    {superadmin && <td>{u.clinic?.name ?? clinicName(u.clinic_id)}</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
