import { STATS } from "@/lib/social-proof";
import TextDisperse from "@/components/ui/text-disperse";

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
              <TextDisperse text={s.value} className="stat-value" />
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
