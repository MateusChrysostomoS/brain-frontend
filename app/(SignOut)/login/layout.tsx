import type { Metadata } from "next";

// Per-route metadata — overrides the root title for /login (brand has no accent).
export const metadata: Metadata = {
  title: "PreCheck — Painel Clínico",
  description: "Acesse o Painel Clínico do PreCheck.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
