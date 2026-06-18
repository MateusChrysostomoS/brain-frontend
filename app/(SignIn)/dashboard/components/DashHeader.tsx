// DashHeader — the editorial title block + the three at-a-glance stats.
// Stats are derived from the current item list so the header always
// reflects the live data, including after a bulk delete or a refetch.

type DashHeaderProps = {
  total: number;
  waiting: number;
};

export default function DashHeader({ total, waiting }: DashHeaderProps) {
  return (
    <header className="dash-head">
      <div>
        <span className="eyebrow">Painel Clínico</span>
        <h1>
          Anamneses <em>do dia</em>.
        </h1>
      </div>

      <div className="dash-stats">
        <Stat value={String(total)} label="Total" />
        <Stat value={<em>{waiting}</em>} label="Em espera" />
      </div>
    </header>
  );
}

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="dash-stat">
      <div className="num">{value}</div>
      <span className="label">{label}</span>
    </div>
  );
}
