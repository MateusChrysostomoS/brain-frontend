"use client";

// Reveal — wraps children in a .reveal element that animates in when scrolled into view.
// Uses IntersectionObserver (same config as brand-site.js initReveal: threshold 0.14, -8%).
// Falls back to immediately-visible when IO is unsupported or reduced-motion is preferred.

import { useCallback, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: 1 | 2 | 3;
  className?: string;
  as?: "div" | "section";
};

export function Reveal({
  children,
  delay,
  className = "",
  as: Tag = "div",
}: RevealProps) {
  // Callback ref fires when the element mounts; avoids needing useEffect + ref object,
  // and works cleanly for both div and section without casting.
  const refCallback = useCallback((el: HTMLElement | null) => {
    if (!el) return;

    // Respect prefers-reduced-motion: brand-ds.css handles it via @media too,
    // but we add "in" immediately so state is always consistent with CSS.
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced || !("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }

    // Mirror the exact IO config from brand-site.js initReveal.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            el.classList.add("in");
            // Unobserve after first trigger — no need to re-animate on scroll back.
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );

    io.observe(el);
    // Note: no cleanup return — callback refs don't support it. The observer
    // disconnects itself after the first intersection (unobserve above).
  }, []); // No deps — the callback only uses stable browser APIs

  // Build class string: "reveal" + optional delay modifier + consumer className.
  const delayClass = delay ? ` reveal-d${delay}` : "";
  const combinedClass = `reveal${delayClass}${className ? " " + className : ""}`;

  if (Tag === "section") {
    return (
      <section ref={refCallback} className={combinedClass}>
        {children}
      </section>
    );
  }

  return (
    <div ref={refCallback} className={combinedClass}>
      {children}
    </div>
  );
}
