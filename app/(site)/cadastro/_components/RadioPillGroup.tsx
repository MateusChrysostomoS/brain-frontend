"use client";

// RadioPillGroup — a stacked group of full-width radio options, used by every
// intake question in the /cadastro wizard (Q1 whatsapp usage, Q3 prior API,
// Q4 Facebook Page). Renders real <input type="radio"> elements (keyboard +
// screen reader friendly) styled as `.radio-pill--block` cards.

type RadioOption<T extends string> = {
  value: T;
  label: string;
  hint?: string;
};

type RadioPillGroupProps<T extends string> = {
  name: string;
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
};

export function RadioPillGroup<T extends string>({
  name,
  options,
  value,
  onChange,
}: RadioPillGroupProps<T>) {
  return (
    <div className="radio-row" style={{ flexDirection: "column" }} role="radiogroup">
      {options.map((opt) => {
        const checked = value === opt.value;
        return (
          <label
            key={opt.value}
            className={"radio-pill radio-pill--block" + (checked ? " on" : "")}
          >
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={checked}
              onChange={() => onChange(opt.value)}
            />
            <span className="radio-pill-check" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M5 12l5 5 9-11" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="radio-pill-text">
              <span>{opt.label}</span>
              {opt.hint && <span className="radio-pill-hint">{opt.hint}</span>}
            </span>
          </label>
        );
      })}
    </div>
  );
}
