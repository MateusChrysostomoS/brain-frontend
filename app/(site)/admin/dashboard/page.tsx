"use client";

// /admin/dashboard — platform-wide summary cards (RBAC task 3B). Numbers only (MVP):
// total tenants, active tenants (≥1 product on), total users, demo requests pending
// contact. Data comes from brain-api admin endpoints (Bearer; role re-checked server-side).

import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { BrandIcon, type IconName } from "../../_components/BrandIcon";
import {
  clearSession,
  isSessionExpired,
  usePortalGuard,
} from "../../_components/usePortalGuard";
import {
  adminListDemoRequests,
  adminListTenants,
  adminListUsers,
} from "@/lib/manage-api";

type Stats = {
  tenants: number;
  activeTenants: number;
  users: number;
  pendingDemo: number;
};

// StatCard — one summary metric (icon + big number + label). Local: not reused elsewhere.
function StatCard({
  icon,
  value,
  label,
}: {
  icon: IconName;
  value: number;
  label: string;
}) {
  return (
    <div className="stat-card">
      <div className="stat-ico">
        <BrandIcon name={icon} />
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { session, ready } = usePortalGuard(["admin"]);

  // --- State ---
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState(false);

  // --- Load: fan out the three admin lists once the session is ready ---
  useEffect(() => {
    if (!ready || !session) return;
    let cancelled = false;
    (async () => {
      try {
        // limit=100 is plenty for the MVP scale; users only needs the total count.
        const [tenants, users, demos] = await Promise.all([
          adminListTenants(session, 0, 100),
          adminListUsers(session, 0, 1),
          adminListDemoRequests(session, 0, 100),
        ]);
        if (cancelled) return;
        setStats({
          tenants: tenants.total,
          activeTenants: tenants.items.filter(
            (t) => t.precheck_enabled || t.secretaria_enabled,
          ).length,
          users: users.total,
          pendingDemo: demos.items.filter((d) => d.status === "new").length,
        });
      } catch (e) {
        if (cancelled) return;
        if (isSessionExpired(e)) {
          clearSession();
          router.replace("/login");
          return;
        }
        setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, session, router]);

  if (!ready) return null; // the layout renders the loading state

  let body: ReactNode;
  if (error) {
    body = (
      <div className="portal-error">
        Não foi possível carregar o resumo. Tente novamente em instantes.
      </div>
    );
  } else if (!stats) {
    body = (
      <div className="portal-loading">
        <div className="portal-spinner" aria-hidden="true" />
        <div>Carregando resumo…</div>
      </div>
    );
  } else {
    body = (
      <div className="stat-grid">
        <StatCard icon="server" value={stats.tenants} label="Clínicas (tenants)" />
        <StatCard icon="check" value={stats.activeTenants} label="Com produto ativo" />
        <StatCard icon="users" value={stats.users} label="Usuários" />
        <StatCard icon="note" value={stats.pendingDemo} label="Demo requests pendentes" />
      </div>
    );
  }

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Visão da plataforma</h1>
          <p className="sub">
            Panorama de todas as clínicas, usuários e leads do Brain.
          </p>
        </div>
      </header>
      {body}
    </>
  );
}
