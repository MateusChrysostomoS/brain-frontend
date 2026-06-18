// DashSearch — large search input with a leading magnifier icon.
// Stateless: parent owns the query string.

type DashSearchProps = {
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
};

export default function DashSearch({
  value,
  onChange,
  placeholder = "Buscar por nome do paciente…",
}: DashSearchProps) {
  return (
    <div className="dash-search">
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Buscar pacientes"
      />
    </div>
  );
}
