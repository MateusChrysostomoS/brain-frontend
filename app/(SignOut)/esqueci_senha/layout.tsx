import type { Metadata } from "next";

// Per-route metadata — applies to /esqueci_senha and every sub-route
// (the /token and /atualizar_senha steps).
export const metadata: Metadata = {
  title: "PreCheck — Redefinir senha",
  description: "Redefina a senha do seu Painel Clínico PreCheck.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
