import { STATS } from "@/lib/social-proof";

export default function StatsBand() {
  const stats = STATS.filter((s) => s.value.trim() !== "");
  if (stats.length === 0) return null;

  return (
    <section className="stats-band" aria-label="Com Automação em números">
      <div className="wrap">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className="stat reveal r-rise"
              data-d={String(Math.min(i + 1, 4))}
            >
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
