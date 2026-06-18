// FinalConfirmDeleteModal — the second, final confirmation gate. It is
// shown after the user presses "Excluir todos" in ConfirmDeleteModal, and
// it is the dialog that actually triggers the irreversible delete request.
// Reuses the shared .modal-* styling so it matches the first dialog.

"use client";

import { useEffect, useRef } from "react";

interface FinalConfirmDeleteModalProps {
  open: boolean;
  deleting: boolean;
  patientCount: number;
  errorMsg: string | null;
  onCancel: () => void; // steps back to the review modal
  onConfirm: () => void; // runs the actual delete request
}

export default function FinalConfirmDeleteModal({
  open,
  deleting,
  patientCount,
  errorMsg,
  onCancel,
  onConfirm,
}: FinalConfirmDeleteModalProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Focus the safe action and lock body scroll — once per open.
  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  // Esc steps back to the previous modal (unless a delete is in flight).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, deleting, onCancel]);

  if (!open) return null;

  const noun = patientCount === 1 ? "paciente" : "pacientes";

  return (
    <div
      className="modal-overlay"
      onClick={() => {
        if (!deleting) onCancel();
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="final-del-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon" aria-hidden="true">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
          </svg>
        </div>

        <h2 id="final-del-modal-title" className="modal-title">
          Confirmação final
        </h2>

        <p className="modal-text">
          Última verificação antes de excluir.{" "}
          <strong>
            {patientCount} {noun}
          </strong>{" "}
          e todos os seus registros de pré-check serão removidos
          permanentemente. Esta ação não pode ser desfeita.
        </p>

        {errorMsg && <div className="modal-error">{errorMsg}</div>}

        <div className="modal-actions">
          <button
            type="button"
            ref={cancelRef}
            className="modal-btn modal-btn-cancel"
            onClick={onCancel}
            disabled={deleting}
          >
            Voltar
          </button>

          <button
            type="button"
            className="modal-btn modal-btn-danger"
            onClick={onConfirm}
            disabled={deleting || patientCount === 0}
          >
            {deleting ? "Excluindo…" : `Sim, excluir ${patientCount} ${noun}`}
          </button>
        </div>
      </div>
    </div>
  );
}
