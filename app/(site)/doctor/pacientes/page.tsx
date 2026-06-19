"use client";

// /doctor/pacientes — placeholder for the doctor "Pacientes" nav item. The patient list
// is owned by secretarIA (brain-api's /doctor/patients is a wired stub today), so this
// shows a friendly empty state and points to the agenda rather than a dead link.

import Link from "next/link";

import { usePortalGuard } from "../../_components/usePortalGuard";

export default function DoctorPatientsPage() {
  const { session, ready } = usePortalGuard(["tenant_owner", "tenant_staff"]);
  if (!ready || !session) return null;

  return (
    <>
      <header className="portal-page-head">
        <div>
          <h1>Pacientes</h1>
          <p className="sub">A lista de pacientes é gerenciada pela secretarIA.</p>
        </div>
      </header>

      <div className="ptable-wrap">
        <div className="portal-state">
          Em breve aqui. Por enquanto, gerencie pacientes e consultas pela{" "}
          <Link href="/secretaria/agenda" style={{ color: "var(--brand)", fontWeight: 600 }}>
            agenda da secretarIA
          </Link>
          .
        </div>
      </div>
    </>
  );
}
