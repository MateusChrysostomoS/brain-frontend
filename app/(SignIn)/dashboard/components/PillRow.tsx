// PillRow — single-select pill group used for Date / Status filters and the
// page-size selector at the bottom. One source of truth for the pill styling
// across the dashboard.

type PillOption<T> = { value: T; label: string };

type PillRowProps<T extends string | number> = {
  value: T;
  options: ReadonlyArray<PillOption<T>>;
  onChange: (next: T) => void;
  ariaLabel?: string;
};

export default function PillRow<T extends string | number>({
  value,
  options,
  onChange,
  ariaLabel,
}: PillRowProps<T>) {
  return (
    <div className="pill-row" role="radiogroup" aria-label={ariaLabel}>
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={String(opt.value)}
            type="button"
            role="radio"
            aria-checked={active}
            className={active ? "pill active" : "pill"}
            onClick={() => onChange(opt.value)}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
