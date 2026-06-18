"use client";

import { useEffect, useState } from "react";
import { getCurrentTheme, toggleTheme, type Theme } from "@/lib/theme";

function SunIcon() {
  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4.3" />
      <path d="M12 2v2.6M12 19.4V22M4.2 4.2l1.85 1.85M17.95 17.95l1.85 1.85M2 12h2.6M19.4 12H22M4.2 19.8l1.85-1.85M17.95 6.05l1.85-1.85" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="theme-icon"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setThemeState(getCurrentTheme());
    setMounted(true);
  }, []);

  function handleClick() {
    setThemeState(toggleTheme());
  }

  const label = theme === "light" ? "Ativar tema escuro" : "Ativar tema claro";

  return (
    <button
      className="btn-theme"
      onClick={handleClick}
      aria-label={label}
      title={label}
      type="button"
    >
      {mounted ? theme === "light" ? <MoonIcon /> : <SunIcon /> : null}
    </button>
  );
}
