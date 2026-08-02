"use client";

// LaunchWaitlistModal — what a buy click opens while the product is not on sale
// yet (PRODUCT_LAUNCHED === false in app/(site)/_lib/launch.ts). Explains that
// launch is imminent and hosts LaunchWaitlistForm so we can tell this visitor
// when they can actually buy. It is the ONLY thing standing between the pricing
// page and checkout during the gate, so it never closes itself on a failed
// submit — a lost lead here is a lost sale.
//
// This file is the dialog CHROME (overlay, portal, focus management); the fields
// and the submit live in LaunchWaitlistForm, which /cadastro renders inline.
//
// Design system: the site's own (brand-ds.css — .card / .field-l / .input /
// .btn / .muted), NOT the portal's PortalShell.css. Reusing _components/Modal
// would have pulled 555 lines of portal CSS onto the marketing pages, which is
// exactly the kind of thing that makes a "pixel-identical" pricing page stop
// being pixel-identical. No new dependency: the overlay is inline-styled, in
// the same spirit as PlanCheckoutCta's alertStyle.
//
// Rendered through createPortal into <body> rather than in place. PriceCard
// sits inside a <Reveal>, whose .reveal class carries a transform until it
// scrolls into view — and ANY transformed ancestor makes position:fixed resolve
// against that ancestor instead of the viewport, which would strand the overlay
// inside the card. The portal also escapes .band-dark's token overrides, so the
// modal always reads the page-level (light/dark) theme from <html data-theme>.
//
// Accessibility: role="dialog" + aria-modal, labelled by its own heading, Esc to
// close, focus moved in on open and RESTORED to the button that opened it on
// close, and Tab/Shift+Tab wrapped inside the card (nothing behind the overlay
// is reachable by keyboard).

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { LaunchWaitlistForm } from "./LaunchWaitlistForm";

export type LaunchWaitlistModalProps = {
  open: boolean;
  onClose: () => void;
  // Which purchase the blocked click was for — the catalog ids joined by ",".
  planHint?: string | null;
};

// Every element that can hold focus inside the card. Used by the Tab trap.
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 200,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 20,
  background: "rgba(5, 8, 12, 0.55)",
  backdropFilter: "blur(5px)",
};

const cardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 440,
  boxShadow: "var(--shadow-xl)",
  // The card can outgrow a short viewport once the error line appears.
  maxHeight: "calc(100vh - 40px)",
  overflowY: "auto",
  position: "relative",
};

const closeButtonStyle: CSSProperties = {
  position: "absolute",
  top: 14,
  right: 14,
  width: 30,
  height: 30,
  padding: 0,
  minWidth: 0,
  lineHeight: 1,
  fontSize: 18,
};

export function LaunchWaitlistModal({ open, onClose, planHint }: LaunchWaitlistModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  // The element focused when the modal opened (the buy button) — focus goes back
  // there on close, so a keyboard user resumes where they left off.
  const openerRef = useRef<Element | null>(null);
  const titleId = useId();
  const bodyId = useId();

  // Only tracked so focus can be moved onto the confirmation, which replaces the
  // form and has nothing tabbable of its own. The form owns the real state.
  const [submitted, setSubmitted] = useState(false);

  // Latest-ref so the open/close effect below depends ONLY on `open` — with
  // onClose in the deps, a parent's inline callback would re-run it on every
  // render and yank focus out of whichever field is being typed into (the same
  // trap _components/Modal.tsx documents).
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Lock page scroll while open, and remember + restore the opener. The fields
  // need no explicit reset: this component returns null while closed, so the
  // form unmounts on close and a visitor who closed mid-typing and clicked
  // another plan gets a clean one.
  useEffect(() => {
    if (!open) return;
    // Record the opener FIRST, then move focus in. Order matters: anything that
    // focuses a field before this line runs (React's own `autoFocus` does
    // exactly that, during commit) would be captured as the opener, and closing
    // would then "restore" focus to an element that no longer exists.
    openerRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    setSubmitted(false);
    cardRef.current?.querySelector<HTMLInputElement>("input[name='waitlist-name']")?.focus();
    return () => {
      document.body.style.overflow = "";
      // By the time this cleanup runs React has already detached the portal, so
      // the browser has dropped focus to <body>. That (or nothing focused at
      // all) is precisely the "focus was inside the dialog and is now homeless"
      // case — anything else means the user has since moved on and we must not
      // steal it. Testing `cardRef.current.contains(activeElement)` here would
      // look right and never fire: the card is gone.
      const opener = openerRef.current;
      const active = document.activeElement;
      if (opener instanceof HTMLElement && (!active || active === document.body)) {
        opener.focus();
      }
    };
  }, [open]);

  // Once the form is replaced by the confirmation there is nothing left to type
  // into, so park focus on the dialog itself rather than leaving it on the
  // button that just disappeared.
  useEffect(() => {
    if (open && submitted) cardRef.current?.focus();
  }, [open, submitted]);

  // Esc closes; Tab/Shift+Tab wrap inside the card. Bound on the card (not the
  // document) — the trap means focus can never be outside it while open.
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCloseRef.current();
      return;
    }
    if (e.key !== "Tab") return;

    const card = cardRef.current;
    if (!card) return;
    const focusable = Array.from(card.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    // Wrap at the ends. `active === card` covers the confirmation state, where
    // focus sits on the card itself rather than on any of its children.
    if (e.shiftKey && (active === first || active === card)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  // Nothing to portal into during the static prerender.
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={overlayStyle}
      // mousedown, not click: a click handler would also fire when a text
      // selection that STARTED inside the card happens to end on the overlay,
      // closing the modal mid-drag and discarding what was typed.
      onMouseDown={onClose}
    >
      <div
        ref={cardRef}
        className="card"
        style={cardStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={bodyId}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="btn btn--ghost"
          style={closeButtonStyle}
          onClick={onClose}
          aria-label="Fechar"
        >
          ×
        </button>

        {/* Hidden once the confirmation takes over: the form swaps in its own
            heading, and two <h2>s with the same id would break the label. */}
        {!submitted && (
          <>
            <h2 id={titleId} className="h-card" style={{ paddingRight: 28 }}>
              Estamos quase lá
            </h2>
            <p id={bodyId} className="muted mt-s" style={{ fontSize: 14.5 }}>
              Ainda estamos finalizando os últimos ajustes antes do lançamento. Deixe seu
              nome e e-mail e avisamos você assim que for possível contratar.
            </p>
          </>
        )}

        <div className={submitted ? undefined : "mt-m"}>
          <LaunchWaitlistForm
            planHint={planHint}
            onSubmitted={() => setSubmitted(true)}
            doneAction={
              <button type="button" className="btn btn--outline btn--block mt-m" onClick={onClose}>
                Fechar
              </button>
            }
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
