"use client";

// Notice — transient inline feedback shown after a mutation ("Clínica X excluída.").
// Wraps the `.alert-line` motif with the three things a raw alert-line lacks: an icon
// sized to the text, a dismiss button, and a screen-reader announcement. Stateless —
// the parent owns `message` (null = hidden) and clears it via onDismiss.

import { useEffect, useRef, type CSSProperties } from "react";

import { BrandIcon, type IconName } from "./BrandIcon";

export type NoticeTone = "green" | "amber" | "red";

const TONE_ICON: Record<NoticeTone, IconName> = {
  green: "checkCircle",
  amber: "bell",
  red: "ban",
};

type NoticeProps = {
  /** Message to show; null renders nothing. */
  message: string | null;
  tone?: NoticeTone;
  onDismiss: () => void;
  /** Auto-hide delay in ms; 0 keeps the notice until dismissed. */
  autoDismissMs?: number;
  style?: CSSProperties;
};

export function Notice({
  message,
  tone = "green",
  onDismiss,
  autoDismissMs = 6000,
  style,
}: NoticeProps) {
  // Held in a ref so an inline-arrow onDismiss (a new identity every render) can't
  // restart the timer on each parent re-render, which would keep the notice up forever.
  const dismissRef = useRef(onDismiss);
  useEffect(() => {
    dismissRef.current = onDismiss;
  });

  useEffect(() => {
    if (!message || !autoDismissMs) return;
    const timer = window.setTimeout(() => dismissRef.current(), autoDismissMs);
    return () => window.clearTimeout(timer);
  }, [message, autoDismissMs]);

  if (!message) return null;

  return (
    <div
      // Keyed on the message so a second notice replays the entrance animation instead
      // of silently swapping text in place.
      key={message}
      className={`alert-line alert-line--${tone} alert-line--enter`}
      style={style}
      // polite + status: announced without stealing focus. Without it a delete is
      // invisible to screen readers — the row just vanishes from the table.
      role="status"
      aria-live="polite"
    >
      <BrandIcon name={TONE_ICON[tone]} />
      <span className="alert-line__text">{message}</span>
      <button
        type="button"
        className="alert-line__close"
        onClick={onDismiss}
        aria-label="Dispensar aviso"
        title="Dispensar"
      >
        <BrandIcon name="x" />
      </button>
    </div>
  );
}
