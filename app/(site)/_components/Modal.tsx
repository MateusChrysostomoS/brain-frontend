"use client";

// Modal — reusable dialog for the portals (e.g. the admin create-user form).
// Overlay click + Esc close; locks body scroll while open; focuses the card.
// Styling lives in PortalShell.css (.portal-modal-*).

import { useEffect, useRef, type ReactNode } from "react";

type ModalProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  // Action buttons rendered in the footer row (right-aligned).
  footer?: ReactNode;
};

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Lock scroll + wire Esc while open; restore on close/unmount.
  useEffect(() => {
    if (!open) return;
    cardRef.current?.focus();
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="portal-modal-overlay" onClick={onClose}>
      <div
        ref={cardRef}
        className="portal-modal-card"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h2>{title}</h2>
        {children}
        {footer && <div className="portal-modal-actions">{footer}</div>}
      </div>
    </div>
  );
}
