// DashFilters — the Date + Status pill rows and the delete controls.
// All filtering happens in the parent; this component just renders the
// current selection and forwards changes.

import DeleteControls from "./DeleteControls";
import PillRow from "./PillRow";

export type DateFilter = "all" | "today" | "week";
export type StatusFilter = "all" | "draft" | "approved" | "rejected";

const DATE_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "today", label: "Hoje" },
  { value: "week", label: "Últimos 7 dias" },
] as const satisfies ReadonlyArray<{ value: DateFilter; label: string }>;

const STATUS_OPTIONS = [
  { value: "all", label: "Todos" },
  { value: "draft", label: "Em espera" },
  { value: "approved", label: "Atendido" },
  { value: "rejected", label: "Rejeitado" },
] as const satisfies ReadonlyArray<{ value: StatusFilter; label: string }>;

type DashFiltersProps = {
  dateFilter: DateFilter;
  onDateChange: (next: DateFilter) => void;
  statusFilter: StatusFilter;
  onStatusChange: (next: StatusFilter) => void;
  // Whether delete mode is armed.
  deleteMode: boolean;
  // Flips delete mode on/off.
  onToggleDeleteMode: () => void;
  // Fires when the user requests the delete flow (toolbar trash button).
  onRequestDelete: () => void;
  // True when there are no patients to delete.
  deleteDisabled: boolean;
  // True while the delete-confirmation flow is on screen.
  confirmActive: boolean;
  // True when at least one patient is selected — highlights the confirm button.
  hasSelection: boolean;
};

export default function DashFilters({
  dateFilter,
  onDateChange,
  statusFilter,
  onStatusChange,
  deleteMode,
  onToggleDeleteMode,
  onRequestDelete,
  deleteDisabled,
  confirmActive,
  hasSelection,
}: DashFiltersProps) {
  return (
    <div className="dash-filters">
      <div className="filter-group">
        <span className="filter-label">Data</span>
        <PillRow<DateFilter>
          value={dateFilter}
          options={DATE_OPTIONS}
          onChange={onDateChange}
          ariaLabel="Filtrar por data"
        />
      </div>

      <div className="filter-group">
        <span className="filter-label">Status</span>
        <PillRow<StatusFilter>
          value={statusFilter}
          options={STATUS_OPTIONS}
          onChange={onStatusChange}
          ariaLabel="Filtrar por status"
        />
      </div>

      <div className="filter-spacer" />

      <DeleteControls
        deleteMode={deleteMode}
        onToggleDeleteMode={onToggleDeleteMode}
        onRequestDelete={onRequestDelete}
        disabled={deleteDisabled}
        confirmActive={confirmActive}
        hasSelection={hasSelection}
      />
    </div>
  );
}
