// Small brand pieces for the marketing pages. Product names keep their exact
// casing ("PreCheck", "secretarIA") and the identity italics from the app's
// wordmarks: an italic, accent-coloured "Check" / "IA".

import type { ReactNode } from "react";

export function SecretariaMark() {
  return (
    <span className="mk-wm">
      secretar<em>IA</em>
    </span>
  );
}

export function PreCheckMark({ withLogo = true }: { withLogo?: boolean }) {
  return (
    <>
      {withLogo && (
        // alt="" on purpose: the name is written right next to it.
        <img src="/brand/precheck-logo.png" alt="" className="mk-pc-logo" width={22} height={22} />
      )}
      <span className="mk-wm">
        Pre<em>Check</em>
      </span>
    </>
  );
}

// Section label: "01 — PreCheck". The rule and number are decoration only.
export function SectionLabel({ num, children }: { num?: string; children: ReactNode }) {
  return (
    <p className="mk-label">
      {num && (
        <>
          <span className="mk-label__num" aria-hidden="true">
            {num}
          </span>
          <span className="mk-label__rule" aria-hidden="true" />
        </>
      )}
      <span className="mk-label__text">{children}</span>
    </p>
  );
}

export type Status = "live" | "pilot" | "soon";

const STATUS_TEXT: Record<Status, string> = {
  live: "Em uso",
  pilot: "Em piloto",
  soon: "Em breve",
};

export function StatusTag({ status, label }: { status: Status; label?: string }) {
  return (
    <span className="mk-tag">
      <span className={`mk-dot mk-dot--${status}`} aria-hidden="true" />
      {label ?? STATUS_TEXT[status]}
    </span>
  );
}
