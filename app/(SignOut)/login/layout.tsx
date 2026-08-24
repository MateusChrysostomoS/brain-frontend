import type { Metadata } from "next";

// Per-route metadata — overrides the root title for /login (brand has no accent).
export const metadata: Metadata = {
  title: "Brain — Portal da clínica",
  description: "Acesse o portal da sua clínica na Brain.",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
