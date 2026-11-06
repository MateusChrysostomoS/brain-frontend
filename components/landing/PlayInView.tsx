"use client";

// Plays a vignette's message sequence once, the first time it scrolls into
// view (CSS does the animating — see [data-play] in site.css).
//
// It only ever hides content that is still below the fold: if the element is
// already on screen when the page hydrates, it is left alone instead of
// blinking out and back in. No JS, reduced motion or no IntersectionObserver
// all mean the same thing: the conversation is simply shown, complete.

import { useEffect, useRef, useState, type ReactNode } from "react";

export function PlayInView({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [play, setPlay] = useState<"ready" | "run" | undefined>(undefined);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    if (el.getBoundingClientRect().top < window.innerHeight) return;

    setPlay("ready");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setPlay("run");
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} data-play={play}>
      {children}
    </div>
  );
}
