export default function TrendingPeriodTabs({ period, onChange }) {
  return (
    <div className="period-tabs" role="group" aria-label="Trending time period">
      {[
        ["day", "Today"],
        ["week", "This week"],
      ].map(([value, label]) => (
        <button
          key={value}
          type="button"
          className={period === value ? "active" : ""}
          aria-pressed={period === value}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
