// PreCheckAuthLayout — wraps the ported PreCheck auth routes (/login,
// /esqueci_senha/*). Imports the shared PreCheck global stylesheet here so it is
// route-scoped to these pages (the AuthShell overrides several globals.css rules,
// so globals.css must be present) and stays off the Brain (site) routes.
import "../globals.css";

export default function PreCheckAuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
