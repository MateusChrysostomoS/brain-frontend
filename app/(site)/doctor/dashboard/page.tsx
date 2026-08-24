"use client";

// /doctor/dashboard — the doctor portal home (RBAC task 3C). Shows the clinic, which
// products are active (from /doctor/me — server derives the tenant from the JWT, the
// frontend never sends tenant_id), and quick links into the product apps. Cards are
// gated by entitlements so a doctor only sees what their clinic can use.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { BrandIcon, type IconName } from "../../_components/BrandIcon";
import { SecretariaWordmark } from "../../_components/SecretariaWordmark";
import { StatusBadge } from "../../_components/StatusBadge";
import {
  clearSession,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import { getDoctorMe, type DoctorMe } from "@/lib/manage-api";
import {
  SECRETARIA_APP_NOT_CONFIGURED,
  SECRETARIA_APP_ROUTES,
  secretariaAppUrl,
} from "@/lib/secretaria-app";

// QuickLink — a navigation card into a product app. Local to this route.
function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: IconName;
  // ReactNode so a title can embed a product wordmark (see SecretariaWordmark).
  title: ReactNode;
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

/**
 * The same card, pointing at ANOTHER origin — the secretarIA app, which is no
 * longer part of this bundle.
 *
 * A plain <a>, not next/link: client-side routing cannot leave this app, so a
 * <Link> here would render a link that does nothing. The copy says the
 * destination is a different app rather than pretending it is one more tab,
 * because the session is per-origin and the doctor will be asked to sign in
 * again (see lib/secretaria-app.ts).
 *
 * `href === null` means this build has no secretarIA origin configured. The
 * card still renders, disabled and honest, instead of vanishing — a missing
 * card reads as "you do not have this product", which is a different and wrong
 * message.
 */
function ExternalQuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string | null;
  icon: IconName;
  title: ReactNode;
  description: string;
}) {
  const body = (
    <>
      <span className="feat-ico">
        <BrandIcon name={icon} />
      </span>
      <h3>{title}</h3>
      <p>{href ? description : SECRETARIA_APP_NOT_CONFIGURED}</p>
    </>
  );
  if (!href) {
    return (
      <div className="portal-link-card" aria-disabled="true" style={{ opacity: 0.55 }}>
        {body}
      </div>
    );
  }
  return (
    <a href={href} className="portal-link-card" target="_blank" rel="noopener noreferrer">
      {body}
    </a>
  );
}

export default function DoctorDashboardPage() {
  const router = useRouter();
  // legacy values accepted during the role-taxonomy transition
  const { session, ready } = usePortalGuard(["doctor", "manager", "secretary", "tenant_owner", "tenant_staff"]);

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
                title="Anamneses"
                description="Resumos pré-consulta dos seus pacientes."
              />
            )}
            {secretaria && (
              <ExternalQuickLink
                href={secretariaAppUrl(SECRETARIA_APP_ROUTES.agenda)}
                icon="calendar"
                title="Agenda"
                description="Consultas e disponibilidade, no aplicativo da secretarIA."
              />
            )}
            {secretaria && (
              <ExternalQuickLink
                href={secretariaAppUrl(SECRETARIA_APP_ROUTES.configuracao)}
                icon="sliders"
                title={
                  <>
                    Configurações <SecretariaWordmark />
                  </>
                }
                description="Ajuste o atendimento, no aplicativo da secretarIA."
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
