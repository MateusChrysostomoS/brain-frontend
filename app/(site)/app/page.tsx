"use client";

// AppPage - keeps existing account links working after retirement of the product dashboard.
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AppPage() {
  const router = useRouter();
  useEffect(() => { router.replace("/app/billing"); }, [router]);
  return <div className="portal-loading" aria-live="polite">Carregando assinatura…</div>;
}
