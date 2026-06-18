"use client";

import { useEffect, useRef } from "react";

interface ConfirmDeleteModalProps {
  open: boolean;
  deleting: boolean;
  selectedCount: number;
  errorMsg: string | null;
  onCancel: () => void;
  onDeleteSelected: () => void;
}

export default function ConfirmDeleteModal({
  open,
  deleting,
  selectedCount,
  errorMsg,
  onCancel,
  onDeleteSelected,
}: ConfirmDeleteModalProps) {
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

  // Esc closes the modal (unless a delete is in flight).
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !deleting) onCancel();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, deleting, onCancel]);

  if (!open) return null;

  const noun = selectedCount === 1 ? "paciente" : "pacientes";

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
        aria-labelledby="del-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-icon" aria-hidden="true">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
          </svg>
        </div>

        <h2 id="del-modal-title" className="modal-title">
          Excluir pacientes selecionados?
        </h2>

        <p className="modal-text">
          Você está prestes a excluir{" "}
          <strong>
            {selectedCount} {noun}
          </strong>{" "}
          e todos os registros de pré-check vinculados. Esta ação não pode ser
          desfeita.
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
            Cancelar
          </button>

          <button
            type="button"
            className="modal-btn modal-btn-danger"
            onClick={onDeleteSelected}
            disabled={deleting || selectedCount === 0}
          >
            {deleting ? "Excluindo…" : `Excluir ${selectedCount} ${noun}`}
          </button>
        </div>
      </div>
    </div>
  );
}
