// PreCheckAppLayout — wraps the ported PreCheck authenticated routes
// (/dashboard, /summary, /inbound). It imports the shared PreCheck global
// stylesheet here (route-scoped) instead of the root layout, so globals.css
// loads only for PreCheck pages and never collides with the Brain brand-ds.css.
import "../globals.css";
import type { Metadata } from "next";

// Restore PreCheck's original tab title for its authenticated routes
// (the root layout's metadata is now Brain-branded).
export const metadata: Metadata = {
  title: "PreCheck — Painel Clínico",
  description:
    "Pré-consulta automatizada via WhatsApp para clínicas brasileiras. Para que o tempo de consulta seja consulta.",
};

export default function PreCheckAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
