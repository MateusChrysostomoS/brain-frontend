"use client";

// Faq — accordion FAQ block matching the .faq / .faq-item / .faq-q / .faq-a markup.
// Single-open behaviour: opening one item closes all others.
// Animates max-height so the CSS transition in brand-ds.css plays correctly.

import { useState, useRef, type ReactNode } from "react";
import { BrandIcon } from "./BrandIcon";

export type FaqItem = {
  q: string;
  a: ReactNode;
};

type FaqProps = {
  items: FaqItem[];
};

export function Faq({ items }: FaqProps) {
  // Tracks which item index is open; null = all closed.
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Refs to each .faq-a element so we can read scrollHeight for the animation.
  const answerRefs = useRef<(HTMLDivElement | null)[]>([]);

  function handleToggle(index: number) {
    setOpenIndex((prev) => {
      // Close others by setting their maxHeight to empty (via .open class removal).
      // The actual DOM mutation for maxHeight happens in the render via style prop.
      return prev === index ? null : index;
    });
  }

  return (
    <div className="faq">
      {items.map((item, i) => {
        const isOpen = openIndex === i;

        return (
          <div key={i} className={"faq-item" + (isOpen ? " open" : "")}>
            <button
              className="faq-q"
              onClick={() => handleToggle(i)}
              aria-expanded={isOpen}
            >
              {item.q}
              {/* The .ico circle rotates the plus icon 45° via .faq-item.open .ico svg */}
              <span className="ico">
                <BrandIcon name="plus" />
              </span>
            </button>

            {/* maxHeight drives the brand-ds.css transition: 0 → scrollHeight when open */}
            <div
              className="faq-a"
              ref={(el) => {
                answerRefs.current[i] = el;
              }}
              style={{
                maxHeight: isOpen
                  ? (answerRefs.current[i]?.scrollHeight ?? 0) + "px"
                  : undefined,
              }}
            >
              <div className="faq-a-inner">{item.a}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
