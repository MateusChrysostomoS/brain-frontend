"use client";

import ThemeToggle from "./ThemeToggle";

export default function Topbar({
  clinic,
  onLogout,
}: {
  clinic?: string;
  onLogout: () => void;
}) {
  return (
    <div className="topbar">
      <span className="topbar-brand">Pre<em>Check</em></span>
      <div className="topbar-right">
        {clinic !== undefined && <span className="topbar-clinic">{clinic}</span>}
        <ThemeToggle />
        <button className="btn-logout" onClick={onLogout} type="button">
          Sair
        </button>
      </div>
    </div>
  );
}
