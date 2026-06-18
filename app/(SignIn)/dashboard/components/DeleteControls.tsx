// DeleteControls — bulk-delete entry point for the dashboard toolbar.
// A binary on/off toggle "arms" delete mode (owned by the page so the
// patient cards can react to it too); while armed, a pill-shaped
// "Confirmar deleção" button drops in beneath the toggle — it mirrors the
// toggle's silhouette and opens the delete-confirmation flow.

"use client";

import TrashIcon from "@/components/TrashIcon";

type DeleteControlsProps = {
  // Whether delete mode is currently armed.
  deleteMode: boolean;
  // Flips delete mode on/off.
  onToggleDeleteMode: () => void;
  // Fires when the trash button is pressed — parent opens the confirm modal.
  onRequestDelete: () => void;
  // True when there are no patients to delete (disables the trash button).
  disabled: boolean;
  // True while the confirmation flow is on screen — keeps the trash button
  // in its "eye-catching" highlighted state for the duration of the flow.
  confirmActive: boolean;
  // True when at least one patient is selected — highlights the confirm button.
  hasSelection: boolean;
};

export default function DeleteControls({
  deleteMode,
  onToggleDeleteMode,
  onRequestDelete,
  disabled,
  confirmActive,
  hasSelection,
}: DeleteControlsProps) {
  return (
    <div className="delete-controls">
      {/* Binary on/off toggle — gates the trash button below it and the
          per-card select buttons in the list. */}
      <button
        type="button"
        className={deleteMode ? "delete-toggle on" : "delete-toggle"}
        onClick={onToggleDeleteMode}
        aria-pressed={deleteMode}
        aria-label="Ativar modo de exclusão de pacientes"
      >
        <span className="delete-toggle-track" aria-hidden="true">
          <span className="delete-toggle-knob" />
        </span>
        <span className="delete-toggle-text">Excluir pacientes</span>
      </button>

      {/* Confirm-delete button — mounted only while delete mode is armed.
          It drops in beneath the toggle, mirrors its pill shape (icon +
          label), and opens the confirmation flow. The "is-active" class
          keeps it highlighted while that flow stays on screen. The visible
          label is the button's accessible name — no aria-label needed. */}
      {deleteMode && (
        <button
          type="button"
          className={`delete-trash${confirmActive ? " is-active" : hasSelection ? " has-selection" : ""}`}
          onClick={onRequestDelete}
          disabled={disabled}
        >
          {/* Icon sized to the 13px label — matches the toggle track height. */}
          <TrashIcon size={18} />
          <span className="delete-trash-text">Confirmar deleção</span>
        </button>
      )}
    </div>
  );
}
