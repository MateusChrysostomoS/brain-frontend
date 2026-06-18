"use client";

// Phone — WhatsApp mockup with animated message playback ported from brand-site.js runWA.
// Plays a steps array: typing indicators → message bubbles → float card reveals.
// Starts when the phone scrolls into view (IO threshold 0.3), then loops with a 2600ms pause.
// When prefers-reduced-motion: all bubbles and cards render statically at once.

import { useEffect, useRef, type ReactNode } from "react";
import { BrandIcon, type IconName } from "./BrandIcon";

// A step is either a message bubble or a float-card reveal trigger.
export type WaStep =
  | {
      from: "in" | "out";
      text: string;
      time?: string;
      /** Milliseconds to show typing indicator before the bubble appears. */
      typing?: number;
      /** Milliseconds to wait after this bubble before the next step. */
      after?: number;
    }
  | {
      card: "br" | "tl";
      /** Delay in ms before showing the card (default 900 per brand-site.js). */
      delay?: number;
    };

export type PhoneFloatCard = {
  side: "br" | "tl";
  icon: IconName;
  title: string;
  value: string;
};

export type PhoneProps = {
  contactName: string;
  status?: string;
  steps: WaStep[];
  floatCards?: PhoneFloatCard[];
};

// Max bubbles kept in view — matches brand-site.js trim() logic.
const MAX_BUBBLES = 7;

export function Phone({
  contactName,
  status = "online",
  steps,
  floatCards = [],
}: PhoneProps) {
  const bodyRef = useRef<HTMLDivElement>(null);
  // Refs keyed by side so the animation engine can call .classList.add("show").
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // Tracks whether the animation loop has started (IO fires only once).
  const startedRef = useRef(false);
  // Holds the current timeout so cleanup can cancel it.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // First letter of contactName for the avatar circle.
  const avatarLetter = contactName.charAt(0).toUpperCase();

  useEffect(() => {
    // Guard first, then bind — so `body` infers as non-null (HTMLDivElement)
    // and stays non-null inside the nested closures below.
    if (!bodyRef.current) return;
    const body = bodyRef.current;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    // --- Helpers ---

    function trim() {
      // Keep at most MAX_BUBBLES children (excluding .wa-day).
      const bubbles = Array.from(body.querySelectorAll(".bub"));
      while (bubbles.length > MAX_BUBBLES) {
        bubbles.shift()?.remove();
      }
    }

    function clearTyping() {
      body.querySelector(".bub--typing")?.remove();
    }

    function addTyping(side: "in" | "out") {
      const el = document.createElement("div");
      el.className = `bub bub--typing bub--${side} show`;
      el.innerHTML = "<span></span><span></span><span></span>";
      body.appendChild(el);
      trim();
    }

    function addBubble(step: Extract<WaStep, { from: string }>) {
      const b = document.createElement("div");
      b.className = `bub bub--${step.from}`;
      // dangerouslySetInnerHTML equivalent for programmatically created elements.
      // Bubble text can contain <strong> and emoji (verified from WA_SECRETARIA script).
      b.innerHTML =
        (step.text ?? "") +
        (step.time
          ? `<span class="time">${step.time}</span>`
          : "");
      body.appendChild(b);
      trim();
      // Double rAF ensures the element is in the DOM before adding .show for the CSS transition.
      requestAnimationFrame(() =>
        requestAnimationFrame(() => b.classList.add("show"))
      );
    }

    function showCard(side: "br" | "tl") {
      const el = cardRefs.current.get(side);
      el?.classList.add("show");
    }

    function resetAll() {
      body.querySelectorAll(".bub").forEach((n) => n.remove());
      cardRefs.current.forEach((el) => el.classList.remove("show"));
    }

    // --- Reduced-motion: render everything statically ---
    if (prefersReduced) {
      steps.forEach((s) => {
        if ("card" in s) {
          showCard(s.card);
        } else {
          addBubble(s);
          // Ensure .show is set without rAF animation.
          const last = body.lastElementChild as HTMLElement | null;
          last?.classList.add("show");
        }
      });
      return;
    }

    // --- Animated playback ---

    function play() {
      resetAll();
      let i = 0;

      function next() {
        if (timerRef.current) clearTimeout(timerRef.current);

        if (i >= steps.length) {
          // Pause 2600ms then restart — matches brand-site.js behaviour.
          timerRef.current = setTimeout(play, 2600);
          return;
        }

        const s = steps[i++];

        if ("card" in s) {
          showCard(s.card);
          timerRef.current = setTimeout(next, s.delay ?? 900);
          return;
        }

        // Message step
        const doAdd = () => {
          clearTyping();
          addBubble(s);
          timerRef.current = setTimeout(next, s.after ?? 1100);
        };

        if (s.typing) {
          addTyping(s.from);
          timerRef.current = setTimeout(doAdd, s.typing);
        } else {
          doAdd();
        }
      }

      next();
    }

    // Start playback when the phone enters the viewport (threshold 0.3 per brand-site.js).
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !startedRef.current) {
          startedRef.current = true;
          play();
          io.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    // Observe the .phone element (parent of body) — same target as brand-site.js.
    const phoneEl = body.closest(".phone") ?? body;
    io.observe(phoneEl);

    return () => {
      io.disconnect();
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [steps]); // Re-run only if the steps prop reference changes

  return (
    <div className="phone-wrap">
      {/* Float cards positioned absolutely relative to .phone-wrap */}
      {floatCards.map((fc) => (
        <div
          key={fc.side}
          className={`float-card float-card--${fc.side}`}
          ref={(el) => {
            if (el) cardRefs.current.set(fc.side, el);
          }}
        >
          <span className="fc-ico">
            <BrandIcon name={fc.icon} />
          </span>
          <div>
            <div className="fc-k">{fc.title}</div>
            <div className="fc-v">{fc.value}</div>
          </div>
        </div>
      ))}

      {/* Phone chassis */}
      <div className="phone">
        <div className="phone-screen">
          {/* WhatsApp top bar */}
          <div className="wa-bar">
            <span className="wa-ava">{avatarLetter}</span>
            <div>
              <div className="wa-title">{contactName}</div>
              <div className="wa-status">{status}</div>
            </div>
          </div>

          {/* Animated message area */}
          <div className="wa-body" ref={bodyRef}>
            <div className="wa-day">HOJE</div>
          </div>

          {/* Bottom input bar — decorative, not interactive */}
          <div className="wa-input">
            <div className="field">Mensagem…</div>
            <div className="send">
              <BrandIcon name="send" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
