"use client";

// /doctor/dashboard — the doctor portal home (RBAC task 3C). Shows the clinic, which
// products are active (from /doctor/me — server derives the tenant from the JWT, the
// frontend never sends tenant_id), and quick links into the product apps. Cards are
// gated by entitlements so a doctor only sees what their clinic can use.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { BrandIcon, type IconName } from "../../_components/BrandIcon";
import { StatusBadge } from "../../_components/StatusBadge";
import {
  clearSession,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import { getDoctorMe, type DoctorMe } from "@/lib/manage-api";

// QuickLink — a navigation card into a product app. Local to this route.
function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: IconName;
  title: string;
  description: string;
}) {
  return (
    <Link href={href} className="portal-link-card">
      <span className="feat-ico">
        <BrandIcon name={icon} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
    </Link>
  );
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["tenant_owner", "tenant_staff"]);

  const [me, setMe] = useState<DoctorMe | null>(null);
  const [error, setError] = useState(false);

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

  let body: ReactNode;
  if (error) {
    body = <div className="portal-error">Não foi possível carregar seu painel.</div>;
  } else if (!me) {
    body = (
      <div className="portal-loading">
        <div className="portal-spinner" aria-hidden="true" />
        <div>Carregando…</div>
      </div>
    );
  } else {
    const { precheck, secretaria } = me.entitlements.products;
    const hasAny = precheck || secretaria;
    body = (
      <>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <StatusBadge tone={precheck ? "green" : "muted"}>
            PreCheck {precheck ? "ativo" : "inativo"}
          </StatusBadge>
          <StatusBadge tone={secretaria ? "green" : "muted"}>
            secretarIA {secretaria ? "ativo" : "inativo"}
          </StatusBadge>
        </div>

        {!hasAny ? (
          <div className="ptable-wrap">
            <div className="portal-state">
              Sua clínica ainda não tem um produto ativo. Fale com a Brain para liberar o
              PreCheck ou a secretarIA.
            </div>
          </div>
        ) : (
          <div className="portal-links">
            {precheck && (
              <QuickLink
                href="/doctor/anamneses"
                icon="note"
                title="Anamneses (PreCheck)"
                description="Resumos pré-consulta dos seus pacientes."
              />
            )}
            {secretaria && (
              <QuickLink
                href="/secretaria/agenda"
                icon="calendar"
                title="Agenda"
                description="Consultas e disponibilidade da secretarIA."
              />
            )}
            {secretaria && (
              <QuickLink
                href="/secretaria/configuracao"
                icon="sliders"
                title="Configurações"
                description="Ajuste o atendimento da secretarIA."
              />
            )}
            {precheck && (
              <QuickLink
                href="/app"
                icon="arrowR"
                title="Abrir PreCheck completo"
                description="Painel clínico completo do PreCheck."
              />
            )}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>{me ? me.tenant.clinic_name : "Sua clínica"}</h1>
          <p className="sub">Bem-vindo(a) ao painel da sua clínica.</p>
        </div>
      </header>
      {body}
    </>
  );
}
