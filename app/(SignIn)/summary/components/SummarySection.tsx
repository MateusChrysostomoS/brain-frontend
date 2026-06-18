// SummarySection — a numbered clinical section card. The parent supplies
// `num` so sections stay contiguously numbered even when some are absent.
// `emphasis` gives the AI-synthesis card its tinted treatment.

import type { ReactNode } from "react";

type SummarySectionProps = {
  num: number;
  title: ReactNode;
  emphasis?: boolean;
  children: ReactNode;
};

export default function SummarySection({
  num,
  title,
  emphasis = false,
  children,
}: SummarySectionProps) {
  return (
    <section className={emphasis ? "sec emphasis" : "sec"}>
      <div className="sec-head">
        <span className="sec-title">
          {/* Zero-padded mono index — 01, 02, ... */}
          <span className="sec-num">{String(num).padStart(2, "0")}</span>
          {title}
        </span>
      </div>
      {children}
    </section>
  );
}
