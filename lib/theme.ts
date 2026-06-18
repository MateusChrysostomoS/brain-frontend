// Theme handling — light/dark, persisted in localStorage.

export type Theme = "light" | "dark";

const THEME_KEY = "precheck_theme";

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem(THEME_KEY);
  return stored === "light" ? "light" : "dark";
}

export function applyTheme(theme: Theme): void {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

export function setTheme(theme: Theme): void {
  if (typeof window !== "undefined") localStorage.setItem(THEME_KEY, theme);
  applyTheme(theme);
}

export function getCurrentTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === "light" ? "dark" : "light";
  setTheme(next);
  return next;
}

// Inline script injected in <head> so the theme is applied before first paint
// (avoids a flash of the wrong theme on a statically-rendered page).
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_KEY}');document.documentElement.setAttribute('data-theme',t==='light'?'light':'dark');}catch(e){document.documentElement.setAttribute('data-theme','dark');}})();`;
