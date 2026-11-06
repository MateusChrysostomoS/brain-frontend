"use client";

// Accordion for the marketing FAQ. One item open at a time; the first starts
// open so the section never reads as a wall of closed questions.
//
// The answer animates with the grid-template-rows 0fr -> 1fr trick: a CSS
// transition, so a second click mid-animation reverses smoothly. Closed answers
// are `inert` — out of the tab order and the accessibility tree.

import { useId, useState, type ReactNode } from "react";

export type FaqEntry = { q: string; a: ReactNode };

export function Faq({ items }: { items: FaqEntry[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const base = useId();

  return (
    <div className="mk-faq">
      {items.map((item, i) => {
        const isOpen = open === i;
        const qid = `${base}q${i}`;
        const aid = `${base}a${i}`;
        return (
          <div key={item.q} className="mk-faq__item" data-open={isOpen}>
            <h3>
              <button
                type="button"
                id={qid}
                className="mk-faq__q"
                aria-expanded={isOpen}
                aria-controls={aid}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {item.q}
                <span className="mk-faq__ico" aria-hidden="true" />
              </button>
            </h3>
            <div id={aid} role="region" aria-labelledby={qid} className="mk-faq__a" inert={!isOpen}>
              <div>
                <p>{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
