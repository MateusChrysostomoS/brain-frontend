// SiteLayout — wraps the new Brain (site) routes: the umbrella home (/),
// secretarIA marketing (/secretaria), the unified dashboard shell (/app), and
// the secretarIA product app (/secretaria/agenda, /secretaria/configuracao).
// The brand design system is imported here so it is route-scoped to these pages
// only (Next.js code-splits CSS per segment) and never mixes with the ported
// PreCheck CSS used by the (SignIn)/(SignOut)/precheck routes.
import "./brand-ds.css";
import "./brand-pages.css";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
