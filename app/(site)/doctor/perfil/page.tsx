"use client";

// /doctor/perfil — "Meu Perfil": the logged-in doctor's own account info. Two
// independent <section className="card"> blocks stacked vertically:
// "Informações pessoais" (name self-editable via PATCH /doctor/me; email/role/
// clinic shown read-only) and "Configurações secretarIA" (specialty/about/
// context/hours + Google Calendar connect for THIS user's own professional,
// mode-sensitive — see SecretariaConfigSection.tsx). Each section fetches and
// saves independently; nothing in one needs the other to work.

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { StatusBadge, type BadgeTone } from "../../_components/StatusBadge";
import {
  clearSession,
  describeApiError,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import {
  getDoctorMe,
  updateDoctorMe,
  type DoctorMe,
  type Session,
} from "@/lib/manage-api";
import { SecretariaConfigSection } from "./SecretariaConfigSection";

// Doctor role -> badge label/tone. Local to this page (mirrors the same local-map
// convention as ROLE_LABEL/ROLE_TONE in admin/users/page.tsx) — "admin" is included only
// for completeness/type-safety, it never actually reaches this portal (require_doctor
// rejects admin tokens with 403 before this page can render).
const ROLE_LABEL: Record<string, string> = {
  doctor: "Médico(a)",
  manager: "Gestor(a)",
  secretary: "Secretária",
  admin: "Admin",
  // Legacy values kept as a display fallback until the backfill migration runs.
  tenant_owner: "Proprietário(a)",
  tenant_staff: "Equipe",
};
const ROLE_TONE: Record<string, BadgeTone> = {
  doctor: "green",
  manager: "amber",
  secretary: "blue",
  admin: "muted",
  tenant_owner: "green",
  tenant_staff: "blue",
};

export default function DoctorPerfilPage() {
  const router = useRouter();
  // legacy values accepted during the role-taxonomy transition
  const { session, ready } = usePortalGuard(["doctor", "manager", "secretary", "tenant_owner", "tenant_staff"]);

  const [me, setMe] = useState<DoctorMe | null>(null);
  const [error, setError] = useState(false);

  // Shared by the initial load and the save handler below — an expired session bounces
  // to /login exactly the same way from either place.
  const handleAuthError = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [router]);

  useEffect(() => {
    if (!ready || !session) return;
    let cancelled = false;
    getDoctorMe(session)
      .then((data) => {
        if (!cancelled) setMe(data);
      })
      .catch((e) => {
        if (cancelled) return;
        if (isSessionExpired(e)) {
          handleAuthError();
          return;
        }
        setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [ready, session, handleAuthError]);

  if (!ready || !session) return null;

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Meu Perfil</h1>
          <p className="sub">Suas informações pessoais de acesso à Brain.</p>
        </div>
      </header>

      {error ? (
        <div className="portal-error">Não foi possível carregar seu perfil.</div>
      ) : !me ? (
        <div className="portal-loading">
          <div className="portal-spinner" aria-hidden="true" />
          <div>Carregando…</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <PersonalInfoSection
            session={session}
            me={me}
            onUpdated={setMe}
            onAuthError={handleAuthError}
          />

          <SecretariaConfigSection session={session} />
        </div>
      )}
    </>
  );
}

// --- Informações pessoais ----------------------------------------------------

function PersonalInfoSection({
  session,
  me,
  onUpdated,
  onAuthError,
}: {
  session: Session;
  me: DoctorMe;
  onUpdated: (me: DoctorMe) => void;
  onAuthError: () => void;
}) {
  const [name, setName] = useState(me.user.name);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Keep the field in sync if `me` is ever replaced from outside this section (e.g. a
  // future sibling section refetching the whole DoctorMe after its own save).
  useEffect(() => {
    setName(me.user.name);
  }, [me.user.name]);

  const trimmed = name.trim();
  const dirty = trimmed !== me.user.name;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!trimmed) {
      setFormError("O nome não pode ficar em branco.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      const updated = await updateDoctorMe(session, { name: trimmed });
      onUpdated(updated);
      setSaved(true);
    } catch (err) {
      if (isSessionExpired(err)) {
        onAuthError();
        return;
      }
      setFormError(describeApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card">
      <h2 className="h-card" style={{ marginBottom: 4 }}>
        Informações pessoais
      </h2>
      <p style={{ fontSize: 13.5, color: "var(--ink-soft)", marginBottom: 20 }}>
        Seus dados de acesso à Brain.
      </p>

      <form onSubmit={handleSave} noValidate style={{ maxWidth: 420 }}>
        {formError && (
          <div className="portal-error" style={{ marginBottom: 14 }}>
            {formError}
          </div>
        )}
        {saved && !formError && (
          <div className="alert-line alert-line--green" style={{ marginBottom: 14 }}>
            Nome atualizado.
          </div>
        )}

        <div className="pfield">
          <label htmlFor="perfil-nome">Nome</label>
          <input
            id="perfil-nome"
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setSaved(false);
            }}
            maxLength={255}
            required
          />
        </div>

        <div className="pfield">
          <label htmlFor="perfil-email">E-mail</label>
          <input
            id="perfil-email"
            type="email"
            value={me.user.email}
            readOnly
            style={{ opacity: 0.7, cursor: "not-allowed" }}
          />
          <p style={{ fontSize: 12, color: "var(--ink-faint)", marginTop: 6 }}>
            É o e-mail usado para entrar na sua conta — não pode ser alterado por aqui.
          </p>
        </div>

        <div className="pfield">
          <label htmlFor="perfil-clinica">Clínica</label>
          <input
            id="perfil-clinica"
            type="text"
            value={me.tenant.clinic_name}
            readOnly
            style={{ opacity: 0.7, cursor: "not-allowed" }}
          />
        </div>

        <div className="pfield" style={{ marginBottom: 22 }}>
          <label>Papel</label>
          <div>
            <StatusBadge tone={ROLE_TONE[me.user.role] ?? "muted"}>
              {ROLE_LABEL[me.user.role] ?? me.user.role}
            </StatusBadge>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn--primary btn--sm"
          disabled={saving || !dirty || !trimmed}
        >
          {saving ? "Salvando…" : "Salvar alterações"}
        </button>
      </form>
    </section>
  );
}
